"use client";

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    Suspense,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
    FileText,
    Sparkles,
    ArrowLeft,
    Columns,
    Maximize2,
    ArrowUp,
    Search,
    ZoomIn,
    ZoomOut,
    Download,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Maximize,
    X,
    Mic,
    Copy,
    Menu,
    Plus,
    Trash2,
    Edit2,
    FileSpreadsheet,
    Paperclip,
    MessageSquare,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// 1. Dynamically import react-pdf components to prevent SSR errors
const Document = dynamic(
    () => import("react-pdf").then((mod) => mod.Document),
    { ssr: false },
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
    ssr: false,
});

// 2. Initialize PDF worker on client side
if (typeof window !== "undefined") {
    import("react-pdf").then((mod) => {
        mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
}

// 3. Dynamically import react-markdown and remark-gfm
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });
import remarkGfm from "remark-gfm";


export interface ChatPdfMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    imageUrl?: string;
    createdAt?: string;
}

export interface ChatPdfSession {
    id: string;
    _id?: string;
    title: string;
    originalFileName: string;
    pageCount: number;
    fileSize: number;
    tokenCount?: number;
    wordCount?: number;
    fileUrl?: string;
    extractedText?: string;
    messages: ChatPdfMessage[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ChatPdfSummary {
    id: string;
    _id?: string;
    title: string;
    originalFileName: string;
    pageCount: number;
    fileSize: number;
    fileUrl?: string;
    messageCount?: number;
    lastMessage?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface RawSessionMessage {
    _id?: string;
    id?: string;
    role?: "user" | "assistant";
    content?: string;
    imageUrl?: string;
    createdAt?: string;
}

interface RawChatSessionData {
    _id?: string;
    id?: string;
    title?: string;
    originalFileName?: string;
    fileName?: string;
    pageCount?: number;
    fileSize?: number;
    tokenCount?: number;
    wordCount?: number;
    fileUrl?: string;
    url?: string;
    downloadUrl?: string;
    filePath?: string;
    s3Url?: string;
    extractedText?: string;
    text?: string;
    content?: string;
    messages?: RawSessionMessage[];
    totalMessages?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface RawSummaryItem {
    _id?: string;
    id?: string;
    title?: string;
    originalFileName?: string;
    pageCount?: number;
    fileSize?: number;
    fileUrl?: string;
    url?: string;
    messageCount?: number;
    lastMessage?: string;
    createdAt?: string;
    updatedAt?: string;
}

type WorkspaceViewMode = "split" | "docOnly" | "chatOnly";

function getApiServerBase(): string {
    const envBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (envBase) return envBase.replace(/\/api\/?$/, "");

    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        return host === "localhost" || host === "127.0.0.1"
            ? "http://localhost:5000"
            : "https://api.onechatai.ai";
    }
    return "https://api.onechatai.ai";
}

function getAuthToken(): string {
    if (typeof window === "undefined") return "";

    try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get("token");
        if (urlToken && urlToken.trim().length > 10) {
            localStorage.setItem("flutter.user_token", JSON.stringify(urlToken.trim()));
            localStorage.setItem("authToken", urlToken.trim());
            searchParams.delete("token");
            const newQuery = searchParams.toString();
            const newUrl =
                window.location.pathname +
                (newQuery ? `?${newQuery}` : "") +
                window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
            return urlToken.trim();
        }
    } catch {
        // ignore
    }

    try {
        const saved =
            localStorage.getItem("flutter.user_token") ||
            localStorage.getItem("authToken");
        if (saved) {
            return saved.replace(/^["']|["']$/g, "").trim();
        }
    } catch {
        // ignore
    }

    if (typeof document !== "undefined" && document.cookie) {
        const match = document.cookie.match(
            /(?:^|;\s*)(?:token|user_token|FBSESSION)=([^;]+)/,
        );
        if (match && match[1]) {
            try {
                return decodeURIComponent(match[1]);
            } catch {
                return match[1];
            }
        }
    }
    return "";
}

function formatTime(dateStr?: string): string {
    if (!dateStr) return "10:24 AM";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "10:24 AM";
        return d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "10:24 AM";
    }
}

function formatFileSize(bytes?: number): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderPdfBadgeIcon(fileName: string = "") {
    const name = fileName.toLowerCase();
    const isWord =
        name.endsWith(".docx") ||
        name.endsWith(".doc") ||
        name.includes(".docx") ||
        name.includes(".doc");
    const isExcel =
        name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");

    let bgColor = "#E5252A"; // Default Red for PDF
    let IconComponent = FileText;

    if (isWord) {
        bgColor = "#2563EB"; // Blue for Word
        IconComponent = FileText;
    } else if (isExcel) {
        bgColor = "#107C41"; // Green for Excel
        IconComponent = FileSpreadsheet;
    }

    return (
        <div
            style={{
                backgroundColor: bgColor,
                boxShadow: `0 2px 8px ${bgColor}59`,
            }}
            className="w-8 h-[34px] rounded-[7px] flex items-center justify-center shrink-0"
        >
            <IconComponent className="w-[19px] h-[19px] text-white" />
        </div>
    );
}

function ChatPdfInner() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const chatId =
        ((params?.chatid as string) || (params?.chatId as string) || "").trim();
    const initialPromptFromUrl = searchParams.get("initialPrompt") || "";
    const autoTriggeredRef = useRef(false);

    // Workspace layout & split states
    const [workspaceViewMode, setWorkspaceViewMode] =
        useState<WorkspaceViewMode>("split");
    const [splitRatio, setSplitRatio] = useState<number>(0.5); // 50/50 default
    const [isDragging, setIsDragging] = useState(false);
    const [mobileTabIndex, setMobileTabIndex] = useState<0 | 1>(1); // 0 = PDF, 1 = Chat
    const [isMobile, setIsMobile] = useState(false);

    // Document states
    const [session, setSession] = useState<ChatPdfSession | null>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [pdfNumPages, setPdfNumPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoomLevel, setZoomLevel] = useState<number>(1.0);
    const [hasPdfLoadFailed, setHasPdfLoadFailed] = useState<boolean>(false);

    // Jump to page modal
    const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);
    const [jumpPageInput, setJumpPageInput] = useState("");

    // Search inside document
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCurrentIndex, setSearchCurrentIndex] = useState(0);
    const [searchTotalCount, setSearchTotalCount] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Chat & Messages states
    const [messages, setMessages] = useState<ChatPdfMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isLoadingEarlierMessages, setIsLoadingEarlierMessages] =
        useState(false);
    const [hasMoreEarlierMessages, setHasMoreEarlierMessages] = useState(false);
    const [oldestLoadedIndex, setOldestLoadedIndex] = useState(0);

    // Speech to text state
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<EventTarget | null>(null);

    // Past chats for history sidebar
    const [pastChats, setPastChats] = useState<ChatPdfSummary[]>([]);
    const [isLoadingPastChats, setIsLoadingPastChats] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [renamingChatId, setRenamingChatId] = useState("");
    const [renameInput, setRenameInput] = useState("");

    // Toast message
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = useCallback((msg: string) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToastMessage(msg);
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 2500);
    }, []);

    // Scroll containers
    const chatScrollContainerRef = useRef<HTMLDivElement>(null);
    const docScrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll chat to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            if (chatScrollContainerRef.current) {
                chatScrollContainerRef.current.scrollTo({
                    top: chatScrollContainerRef.current.scrollHeight + 200,
                    behavior: smooth ? "smooth" : "auto",
                });
            }
        }, 50);
    }, []);

    // Clear any query params from URL (same like Analyze)
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.search) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);

    // 1. Send Message with SSE streaming (declared first)
    const handleSendMessage = useCallback(
        async (textToSend?: string, targetChatId?: string) => {
            const prompt = (textToSend ?? inputMessage).trim();
            const activeId = targetChatId || session?.id || chatId;
            if (!prompt || !activeId || isSendingMessage) return;

            setInputMessage("");

            const userMsgId = `user_${Date.now()}`;
            const assistantMsgId = `assistant_${Date.now() + 1}`;

            const userMsg: ChatPdfMessage = {
                id: userMsgId,
                role: "user",
                content: prompt,
                createdAt: new Date().toISOString(),
            };

            const assistantMsg: ChatPdfMessage = {
                id: assistantMsgId,
                role: "assistant",
                content: "",
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setIsSendingMessage(true);
            scrollToBottom();

            try {
                const token = getAuthToken();
                const base = getApiServerBase();
                const res = await fetch(
                    `${base}/api/chat-pdf/chats/${activeId}/message?stream=true`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ prompt }),
                    },
                );

                if (!res.ok) {
                    let errorMsg = "Failed to get AI response.";
                    try {
                        const errData = await res.json();
                        errorMsg = errData.message || errorMsg;
                    } catch {
                        // ignore
                    }
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantMsgId
                                ? { ...m, content: `Error: ${errorMsg}` }
                                : m,
                        ),
                    );
                    return;
                }

                const reader = res.body?.getReader();
                if (!reader) {
                    throw new Error("ReadableStream not supported");
                }

                const decoder = new TextDecoder();
                let buffer = "";
                let accumulatedText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith("data:")) continue;

                        const jsonStr = trimmed.substring(5).trim();
                        if (jsonStr === "[DONE]") {
                            break;
                        }

                        try {
                            const event = JSON.parse(jsonStr);
                            if (event.type === "delta" && event.content) {
                                accumulatedText += event.content;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMsgId
                                            ? { ...m, content: accumulatedText }
                                            : m,
                                    ),
                                );
                                scrollToBottom();
                            } else if (event.type === "error") {
                                accumulatedText += `\nError: ${event.message || "Unknown error"}`;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantMsgId
                                            ? { ...m, content: accumulatedText }
                                            : m,
                                    ),
                                );
                            }
                        } catch {
                            // ignore json parse error
                        }
                    }
                }
            } catch (err: unknown) {
                console.error("Error sending message:", err);
                const errMsg =
                    err instanceof Error
                        ? err.message
                        : "Failed to communicate with AI";
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMsgId
                            ? { ...m, content: `Error: ${errMsg}` }
                            : m,
                    ),
                );
            } finally {
                setIsSendingMessage(false);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        },
        [inputMessage, session?.id, chatId, isSendingMessage, scrollToBottom],
    );

    // 2. Load Session via useEffect asynchronously
    useEffect(() => {
        if (!chatId) return;
        let cancelled = false;

        async function fetchSession() {
            try {
                const token = getAuthToken();
                const base = getApiServerBase();
                const res = await fetch(
                    `${base}/api/chat-pdf/chats/${chatId}?limit=12`,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    },
                );

                if (!cancelled && res.ok) {
                    const data = await res.json();
                    if (data?.chatPdf) {
                        const rawSession: RawChatSessionData = data.chatPdf;
                        const formattedSession: ChatPdfSession = {
                            id: rawSession._id || rawSession.id || chatId,
                            title: rawSession.title || "New Chat",
                            originalFileName:
                                rawSession.originalFileName ||
                                rawSession.fileName ||
                                "Document.pdf",
                            pageCount: rawSession.pageCount || 1,
                            fileSize: rawSession.fileSize || 0,
                            tokenCount: rawSession.tokenCount || 0,
                            wordCount: rawSession.wordCount || 0,
                            fileUrl:
                                rawSession.fileUrl ||
                                rawSession.url ||
                                rawSession.downloadUrl ||
                                rawSession.filePath ||
                                rawSession.s3Url,
                            extractedText:
                                rawSession.extractedText ||
                                rawSession.text ||
                                rawSession.content,
                            messages: (rawSession.messages || []).map((m: RawSessionMessage) => ({
                                id:
                                    m._id ||
                                    m.id ||
                                    `${m.role || "user"}_${m.createdAt || Date.now()}_${Math.random()}`,
                                role: m.role || "user",
                                content: m.content || "",
                                imageUrl: m.imageUrl,
                                createdAt: m.createdAt,
                            })),
                            createdAt: rawSession.createdAt,
                            updatedAt: rawSession.updatedAt,
                        };

                        setSession(formattedSession);
                        setMessages(formattedSession.messages);
                        setPdfNumPages(
                            formattedSession.pageCount > 0 ? formattedSession.pageCount : 1,
                        );

                        const total =
                            data.totalMessages ||
                            rawSession.totalMessages ||
                            formattedSession.messages.length;
                        const oldest = Math.max(
                            0,
                            total - formattedSession.messages.length,
                        );
                        setOldestLoadedIndex(oldest);
                        setHasMoreEarlierMessages(oldest > 0);

                        // Auto-start chat if messages are empty (same like Analyze)
                        if (
                            formattedSession.messages.length === 0 &&
                            !autoTriggeredRef.current
                        ) {
                            autoTriggeredRef.current = true;
                            let promptToUse = initialPromptFromUrl && initialPromptFromUrl.trim();
                            if (!promptToUse && typeof window !== "undefined") {
                                promptToUse = localStorage.getItem("pending_chat_pdf_prompt") || "";
                                localStorage.removeItem("pending_chat_pdf_prompt");
                            }
                            if (!promptToUse) {
                                promptToUse =
                                    "I've uploaded a document. Please review it and provide a brief overview of what it's about, including its main purpose, key topics, and important information. Keep the response concise, well-organized, and easy to understand. At the end, suggest 3–5 useful questions I can ask to explore the document further.";
                            }

                            setTimeout(() => {
                                handleSendMessage(promptToUse, chatId);
                            }, 200);
                        }

                        scrollToBottom(false);
                    }
                }
            } catch (err) {
                console.error("Error loading chat session:", err);
            } finally {
                if (!cancelled) {
                    setIsLoadingSession(false);
                }
            }
        }

        fetchSession();

        return () => {
            cancelled = true;
        };
    }, [chatId, initialPromptFromUrl, handleSendMessage, scrollToBottom]);

    useEffect(() => {
        let cancelled = false;

        async function fetchPastChats() {
            try {
                setIsLoadingPastChats(true);
                const token = getAuthToken();
                const base = getApiServerBase();
                const res = await fetch(`${base}/api/chat-pdf/chats?page=1&limit=30`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                if (!cancelled && res.ok) {
                    const data = await res.json();
                    const list = (data.chats || []).map((c: RawSummaryItem) => ({
                        id: c._id || c.id || "",
                        title: c.title || "New Chat",
                        originalFileName: c.originalFileName || "Document.pdf",
                        pageCount: c.pageCount || 1,
                        fileSize: c.fileSize || 0,
                        fileUrl: c.fileUrl || c.url,
                        messageCount: c.messageCount || 0,
                        lastMessage: c.lastMessage || "",
                        createdAt: c.createdAt,
                        updatedAt: c.updatedAt,
                    }));
                    setPastChats(list);
                }
            } catch (err) {
                console.error("Error loading past chats:", err);
            } finally {
                if (!cancelled) {
                    setIsLoadingPastChats(false);
                }
            }
        }

        fetchPastChats();

        return () => {
            cancelled = true;
        };
    }, []);

    // 4. Load Earlier Messages on Scroll
    const handleLoadEarlierMessages = useCallback(async () => {
        if (
            !session ||
            !hasMoreEarlierMessages ||
            isLoadingEarlierMessages ||
            oldestLoadedIndex <= 0
        ) {
            return;
        }

        setIsLoadingEarlierMessages(true);
        const scrollContainer = chatScrollContainerRef.current;
        const oldScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

        try {
            const token = getAuthToken();
            const base = getApiServerBase();
            const res = await fetch(
                `${base}/api/chat-pdf/chats/${session.id}?limit=10&before=${oldestLoadedIndex}`,
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                },
            );

            if (res.ok) {
                const data = await res.json();
                if (data?.chatPdf?.messages) {
                    const rawMsgs: RawSessionMessage[] = data.chatPdf.messages;
                    const earlierMsgs: ChatPdfMessage[] = rawMsgs.map((m: RawSessionMessage) => ({
                        id:
                            m._id ||
                            m.id ||
                            `${m.role || "user"}_${m.createdAt || Date.now()}_${Math.random()}`,
                        role: m.role || "user",
                        content: m.content || "",
                        imageUrl: m.imageUrl,
                        createdAt: m.createdAt,
                    }));

                    if (earlierMsgs.length > 0) {
                        setMessages((prev) => {
                            const existingIds = new Set(prev.map((x) => x.id));
                            const uniqueEarlier = earlierMsgs.filter(
                                (m) => !existingIds.has(m.id),
                            );
                            return [...uniqueEarlier, ...prev];
                        });

                        const newOldest = Math.max(
                            0,
                            oldestLoadedIndex - earlierMsgs.length,
                        );
                        setOldestLoadedIndex(newOldest);
                        setHasMoreEarlierMessages(newOldest > 0);

                        // Restore scroll position smoothly
                        setTimeout(() => {
                            if (scrollContainer) {
                                const diff = scrollContainer.scrollHeight - oldScrollHeight;
                                scrollContainer.scrollTop = diff;
                            }
                        }, 30);
                    } else {
                        setHasMoreEarlierMessages(false);
                    }
                }
            }
        } catch (err) {
            console.error("Error loading earlier messages:", err);
        } finally {
            setIsLoadingEarlierMessages(false);
        }
    }, [
        session,
        hasMoreEarlierMessages,
        isLoadingEarlierMessages,
        oldestLoadedIndex,
    ]);

    // 5. Speech to Text
    const toggleSpeech = useCallback(() => {
        if (typeof window === "undefined") return;
        const windowWithSpeech = window as unknown as {
            SpeechRecognition?: new () => {
                continuous: boolean;
                interimResults: boolean;
                lang: string;
                start: () => void;
                stop: () => void;
                onstart: () => void;
                onerror: () => void;
                onend: () => void;
                // onresult: (e: {
                //   resultIndex: number;
                //   results: { [key: number]: { [key: number]: { transcript: string } } & { length: number } };
                // }) => void;
                onresult: (e: {
                    resultIndex: number;
                    results: {
                        length: number;
                        [index: number]: {
                            length: number;
                            [index: number]: {
                                transcript: string;
                            };
                        };
                    };
                }) => void;
            };
            webkitSpeechRecognition?: new () => {
                continuous: boolean;
                interimResults: boolean;
                lang: string;
                start: () => void;
                stop: () => void;
                onstart: () => void;
                onerror: () => void;
                onend: () => void;
                onresult: (e: {
                    resultIndex: number;
                    results: { [key: number]: { [key: number]: { transcript: string } } & { length: number } };
                }) => void;
            };
        };

        const SpeechRecognition =
            windowWithSpeech.SpeechRecognition ||
            windowWithSpeech.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            showToast("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            const activeRecognizer = recognitionRef.current as { stop?: () => void } | null;
            activeRecognizer?.stop?.();
            setIsListening(false);
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onstart = () => setIsListening(true);
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                if (transcript) {
                    setInputMessage((prev) => {
                        const separator = prev && !prev.endsWith(" ") ? " " : "";
                        return prev + separator + transcript;
                    });
                }
            };

            recognitionRef.current = recognition as unknown as EventTarget;
            recognition.start();
        } catch (err) {
            console.error("Speech recognition error:", err);
            setIsListening(false);
        }
    }, [isListening, showToast]);

    // 6. Document zoom controls
    const handleZoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(3.0, +(prev + 0.25).toFixed(2)));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(0.5, +(prev - 0.25).toFixed(2)));
    }, []);

    const handleResetZoom = useCallback(() => {
        setZoomLevel(1.0);
    }, []);

    const handleJumpToPage = useCallback(
        (page: number) => {
            const target = Math.max(1, Math.min(pdfNumPages, page));
            setCurrentPage(target);
            const pageEl = document.getElementById(`pdf-page-${target}`);
            if (pageEl) {
                pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },
        [pdfNumPages],
    );

    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            handleJumpToPage(currentPage - 1);
        }
    }, [currentPage, handleJumpToPage]);

    const handleNextPage = useCallback(() => {
        if (currentPage < pdfNumPages) {
            handleJumpToPage(currentPage + 1);
        }
    }, [currentPage, pdfNumPages, handleJumpToPage]);

    const handleJumpToPageSubmit = useCallback(() => {
        const val = parseInt(jumpPageInput.trim(), 10);
        if (!isNaN(val) && val >= 1 && val <= pdfNumPages) {
            handleJumpToPage(val);
            setIsJumpModalOpen(false);
        } else {
            showToast(`Please enter a page between 1 and ${pdfNumPages}`);
        }
    }, [jumpPageInput, pdfNumPages, handleJumpToPage, showToast]);

    // 7. Search in document
    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            if (!query.trim()) {
                setSearchCurrentIndex(0);
                setSearchTotalCount(0);
                return;
            }
            const rawText = session?.extractedText || "";
            if (rawText) {
                const lower = rawText.toLowerCase();
                const q = query.trim().toLowerCase();
                let count = 0;
                let pos = lower.indexOf(q);
                while (pos !== -1) {
                    count++;
                    pos = lower.indexOf(q, pos + q.length);
                }
                setSearchTotalCount(count);
                setSearchCurrentIndex(count > 0 ? 1 : 0);
            } else {
                setSearchTotalCount(1);
                setSearchCurrentIndex(1);
            }
        },
        [session?.extractedText],
    );

    const handleNextSearchResult = useCallback(() => {
        if (searchTotalCount > 0) {
            setSearchCurrentIndex((prev) => (prev % searchTotalCount) + 1);
        }
    }, [searchTotalCount]);

    const handlePrevSearchResult = useCallback(() => {
        if (searchTotalCount > 0) {
            setSearchCurrentIndex((prev) =>
                prev <= 1 ? searchTotalCount : prev - 1,
            );
        }
    }, [searchTotalCount]);

    // 8. Download Document
    const handleDownloadDocument = useCallback(() => {
        const fileName = session?.originalFileName || "Document.pdf";
        const fileUrl = session?.fileUrl;

        if (fileUrl) {
            const fullUrl = fileUrl.startsWith("http")
                ? fileUrl
                : `${getApiServerBase()}${fileUrl}`;
            const a = document.createElement("a");
            a.href = fullUrl;
            a.download = fileName;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`Downloading ${fileName}...`);
            return;
        }

        if (session?.extractedText) {
            const downloadName = fileName.replace(/\.[^/.]+$/, "") + ".txt";
            const blob = new Blob([session.extractedText], {
                type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Downloaded document text as ${downloadName}`);
            return;
        }

        showToast("No document available to download.");
    }, [session, showToast]);

    // 9. Rename chat
    const handleRenameChat = useCallback(async () => {
        if (!renamingChatId || !renameInput.trim()) return;
        try {
            const token = getAuthToken();
            const base = getApiServerBase();
            const res = await fetch(
                `${base}/api/chat-pdf/chats/${renamingChatId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ title: renameInput.trim() }),
                },
            );
            if (res.ok) {
                setPastChats((prev) =>
                    prev.map((c) =>
                        c.id === renamingChatId ? { ...c, title: renameInput.trim() } : c,
                    ),
                );
                if (session && session.id === renamingChatId) {
                    setSession({ ...session, title: renameInput.trim() });
                }
                showToast("Chat renamed successfully");
            }
        } catch (err) {
            console.error("Error renaming chat:", err);
        } finally {
            setRenameModalOpen(false);
            setRenamingChatId("");
            setRenameInput("");
        }
    }, [renamingChatId, renameInput, session, showToast]);

   

    // 11. Mouse drag handler for split resizing
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newRatio = (e.clientX - rect.left) / rect.width;
            setSplitRatio(Math.max(0.15, Math.min(0.85, newRatio)));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    const docName = session?.originalFileName || "Document.pdf";
    const effectivePages =
        pdfNumPages > 0 ? pdfNumPages : session?.pageCount || 1;
    const sizeStr = formatFileSize(session?.fileSize);
    const pageCountStr = `${effectivePages} ${effectivePages === 1 ? "page" : "pages"}${sizeStr ? ` • ${sizeStr}` : ""}`;

    const resolvedPdfUrl = useMemo(() => {
        if (!session?.fileUrl) return null;
        return session.fileUrl.startsWith("http")
            ? session.fileUrl
            : `${getApiServerBase()}${session.fileUrl}`;
    }, [session?.fileUrl]);

    const isPdf =
        docName.toLowerCase().endsWith(".pdf") ||
        Boolean(resolvedPdfUrl && resolvedPdfUrl.toLowerCase().includes(".pdf"));

    // Extracted text clean up
    const cleanExtractedText = useMemo(() => {
        const raw = session?.extractedText;
        if (!raw || !raw.trim()) return null;
        let clean = raw.trim();
        if (clean.includes("[SYSTEM INSTRUCTION:")) {
            const idx = clean.indexOf("]");
            if (idx !== -1) clean = clean.substring(idx + 1).trim();
        }
        if (clean.includes("<uploaded_document")) {
            const idx = clean.indexOf(">", clean.indexOf("<uploaded_document"));
            if (idx !== -1) clean = clean.substring(idx + 1).trim();
        }
        if (clean.includes("</uploaded_document>")) {
            const idx = clean.lastIndexOf("</uploaded_document>");
            if (idx !== -1) clean = clean.substring(0, idx).trim();
        }
        clean = clean
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");

        return clean;
    }, [session?.extractedText]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#07080F] text-white font-sans select-none">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl bg-[#1E1B38] border border-[#3B3363] text-white text-[13px] font-medium shadow-2xl animate-in fade-in slide-in-from-top-3">
                    {toastMessage}
                </div>
            )}

            

            {/* Main Container */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Top Header matching Flutter _buildTopHeader */}
                <header className="h-[60px] sm:h-16 bg-[#0F1123] border-b border-[#1E223D] px-3 sm:px-4 flex items-center justify-between shrink-0 z-30">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                        
                        {/* Back button matching Analyze Data */}
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    // If referrer has flutter origin, navigate to /chat-pdf
                                    let flutterHost = "";
                                    if (document.referrer) {
                                        try {
                                            flutterHost = new URL(document.referrer).origin;
                                        } catch (_) {}
                                    }
                                    if (!flutterHost && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
                                        flutterHost = "http://localhost:50254";
                                    }

                                    window.location.href = `${flutterHost}/chat-pdf`;
                                }
                            }}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-xs font-semibold hover:bg-[#32276e] transition shrink-0 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{isMobile ? "Back" : "Back to ChatPDF"}</span>
                        </button>

                        {/* Red / Blue / Green Badge Icon */}
                        {renderPdfBadgeIcon(docName)}

                        {/* Document Title & Subtitle */}
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[14px] sm:text-[14.5px] font-bold text-white truncate tracking-tight">
                                {docName}
                            </span>
                            <span className="text-[11px] sm:text-[11.5px] font-medium text-[#8E95AF] truncate">
                                {pageCountStr}
                            </span>
                        </div>
                    </div>

                    {/* Desktop View Action Buttons */}
                    {!isMobile && (
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                            {/* Split Screen Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (workspaceViewMode === "split") {
                                        setWorkspaceViewMode("chatOnly");
                                    } else {
                                        setWorkspaceViewMode("split");
                                        setSplitRatio(0.5);
                                    }
                                }}
                                title="Toggle Split / Single View"
                                className={`p-2 rounded-lg border transition cursor-pointer ${workspaceViewMode === "split"
                                        ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                                        : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
                                    }`}
                            >
                                <Columns className="w-4 h-4" />
                            </button>

                            {/* Fullscreen / Document Only Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (workspaceViewMode === "docOnly") {
                                        setWorkspaceViewMode("split");
                                    } else {
                                        setWorkspaceViewMode("docOnly");
                                    }
                                }}
                                title="Toggle Document Fullscreen"
                                className={`p-2 rounded-lg border transition cursor-pointer ${workspaceViewMode === "docOnly"
                                        ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                                        : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
                                    }`}
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </header>

                {/* Mobile Tab Switcher */}
                {isMobile && (
                    <div className="bg-[#090A14] px-4 pt-1.5 pb-2.5 shrink-0">
                        <div className="flex rounded-xl bg-[#121424] border border-[#222642] p-1">
                            <button
                                type="button"
                                onClick={() => setMobileTabIndex(0)}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${mobileTabIndex === 0
                                        ? "bg-[#6C56E5] text-white shadow-md"
                                        : "text-[#8E95AF] hover:text-white"
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileTabIndex(1)}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${mobileTabIndex === 1
                                        ? "bg-[#6C56E5] text-white shadow-md"
                                        : "text-[#8E95AF] hover:text-white"
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Chat</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Body Workspace */}
                <div
                    ref={containerRef}
                    className="flex-1 flex overflow-hidden relative select-text"
                >
                    {/* Left Document Section */}
                    {(!isMobile || mobileTabIndex === 0) &&
                        (workspaceViewMode !== "chatOnly" || isMobile) && (
                            <div
                                style={{
                                    width: isMobile
                                        ? "100%"
                                        : workspaceViewMode === "docOnly"
                                            ? "100%"
                                            : `${splitRatio * 100}%`,
                                }}
                                className="relative flex flex-col h-full bg-[#080913] overflow-hidden"
                            >
                                {/* Scrollable Document Area */}
                                <div
                                    ref={docScrollContainerRef}
                                    className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 pb-28 relative flex flex-col items-center"
                                >
                                    {isLoadingSession ? (
                                        <div className="flex h-full items-center justify-center flex-col gap-3.5 my-auto">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#6C56E5]" />
                                            <span className="text-xs text-[#8E95AF] font-medium">
                                                Loading PDF document...
                                            </span>
                                        </div>
                                    ) : isPdf && resolvedPdfUrl && !hasPdfLoadFailed ? (
                                        /* PDF Document rendering using react-pdf */
                                        <div
                                            style={{
                                                transform: `scale(${zoomLevel})`,
                                                transformOrigin: "top center",
                                            }}
                                            className="transition-transform duration-150 flex flex-col items-center"
                                        >
                                            <Document
                                                file={resolvedPdfUrl}
                                                onLoadSuccess={({ numPages }) => {
                                                    setPdfNumPages(numPages);
                                                }}
                                                onLoadError={(err) => {
                                                    console.error("PDF load error:", err);
                                                    setHasPdfLoadFailed(true);
                                                }}
                                                loading={
                                                    <div className="flex items-center gap-2.5 text-xs text-[#8E95AF] py-12">
                                                        <Loader2 className="w-5 h-5 animate-spin text-[#6C56E5]" />
                                                        Loading PDF pages...
                                                    </div>
                                                }
                                            >
                                                {Array.from(new Array(pdfNumPages), (_, idx) => (
                                                    <div
                                                        key={`page_${idx + 1}`}
                                                        id={`pdf-page-${idx + 1}`}
                                                        className="shadow-2xl rounded-md overflow-hidden mb-6 bg-white"
                                                    >
                                                        <Page
                                                            pageNumber={idx + 1}
                                                            width={
                                                                isMobile
                                                                    ? window.innerWidth - 48
                                                                    : Math.min(680, window.innerWidth * splitRatio - 60)
                                                            }
                                                            renderAnnotationLayer={false}
                                                            renderTextLayer={true}
                                                        />
                                                    </div>
                                                ))}
                                            </Document>
                                        </div>
                                    ) : (
                                        /* Paper Document Fallback for text / docx / extracted content */
                                        <div
                                            style={{
                                                transform: `scale(${zoomLevel})`,
                                                transformOrigin: "top center",
                                            }}
                                            className="w-full max-w-[680px] bg-white rounded shadow-2xl p-7 sm:p-10 text-slate-800 min-h-[500px] my-4 leading-relaxed transition-transform"
                                        >
                                            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3 mb-5">
                                                <FileText className="w-5 h-5 text-[#6C56E5]" />
                                                <h2 className="text-base font-bold text-[#0F172A] truncate">
                                                    {docName}
                                                </h2>
                                            </div>

                                            {cleanExtractedText ? (
                                                <div className="text-[14px] text-[#334155] leading-[1.7] whitespace-pre-wrap">
                                                    {cleanExtractedText}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                                                    <h4 className="text-base font-bold text-[#1E293B] mb-2">
                                                        {docName}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                                                        No preview text could be extracted from this
                                                        document. Ask any question in the chat to analyze it.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Floating PDF Toolbar matching Flutter _buildFloatingPdfToolbar */}
                                <div className="absolute bottom-5 inset-x-0 flex flex-col items-center pointer-events-none z-40 px-3">
                                    {/* Floating Search Bar */}
                                    {isSearchVisible && (
                                        <div className="pointer-events-auto mb-2 flex items-center gap-2 rounded-xl bg-[#121424] border-[1.2px] border-[#3B3363] px-3 py-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                                            <Search className="w-4 h-4 text-[#A78BFA] shrink-0" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        e.shiftKey
                                                            ? handlePrevSearchResult()
                                                            : handleNextSearchResult();
                                                    }
                                                }}
                                                placeholder="Search..."
                                                className="bg-transparent text-white text-[13.5px] font-medium outline-none w-36 placeholder:text-[#8E95AF]"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handlePrevSearchResult}
                                                className="p-1 text-white/70 hover:text-white transition rounded cursor-pointer"
                                                title="Previous match"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="text-[13px] font-semibold text-[#9E9EAF] px-1 min-w-[32px] text-center">
                                                {searchTotalCount > 0
                                                    ? `${searchCurrentIndex}/${searchTotalCount}`
                                                    : searchQuery.trim()
                                                        ? "0/0"
                                                        : ""}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleNextSearchResult}
                                                className="p-1 text-white/70 hover:text-white transition rounded cursor-pointer"
                                                title="Next match"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsSearchVisible(false);
                                                    setSearchQuery("");
                                                }}
                                                className="p-1 text-white/50 hover:text-white transition rounded ml-1 cursor-pointer"
                                                title="Close search"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Floating Toolbar buttons */}
                                    <div
                                        style={{
                                            boxShadow: "0 8px 22px rgba(0, 0, 0, 0.65)",
                                        }}
                                        className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-2xl bg-[#0C101E] border-[1.2px] border-[#1E2640] max-w-full overflow-x-auto no-scrollbar"
                                    >
                                        {/* Zoom Out */}
                                        <button
                                            type="button"
                                            onClick={handleZoomOut}
                                            title="Zoom Out"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        {/* Reset Zoom */}
                                        <button
                                            type="button"
                                            onClick={handleResetZoom}
                                            title="Fit / Reset Zoom"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </button>
                                        {/* Zoom In */}
                                        <button
                                            type="button"
                                            onClick={handleZoomIn}
                                            title="Zoom In"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>

                                        <div className="w-[1px] h-[18px] bg-[#282C4A] mx-1" />

                                        {/* Prev Page */}
                                        <button
                                            type="button"
                                            onClick={handlePrevPage}
                                            title="Previous Page"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {/* Page counter -> Jump modal */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setJumpPageInput(String(currentPage));
                                                setIsJumpModalOpen(true);
                                            }}
                                            className="px-2 py-1 text-[13px] font-semibold text-white hover:text-[#A78BFA] transition rounded-lg cursor-pointer"
                                        >
                                            {currentPage} of {effectivePages}
                                        </button>

                                        {/* Next Page */}
                                        <button
                                            type="button"
                                            onClick={handleNextPage}
                                            title="Next Page"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        <div className="w-[1px] h-[18px] bg-[#282C4A] mx-1" />

                                        {/* Download */}
                                        <button
                                            type="button"
                                            onClick={handleDownloadDocument}
                                            title="Download Original Document"
                                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>

                                        {/* Search */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSearchVisible(!isSearchVisible);
                                                if (!isSearchVisible) {
                                                    setTimeout(() => searchInputRef.current?.focus(), 50);
                                                }
                                            }}
                                            title="Search in Document"
                                            className={`p-1.5 rounded-full transition cursor-pointer ${isSearchVisible
                                                    ? "bg-[#6C56E5]/30 text-[#A78BFA]"
                                                    : "hover:bg-white/10 text-white/70 hover:text-white"
                                                }`}
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Draggable Divider matching Flutter _buildDraggableDivider */}
                    {workspaceViewMode === "split" && !isMobile && (
                        <div
                            onMouseDown={() => setIsDragging(true)}
                            className="w-[14px] bg-[#090A14] hover:bg-[#111425] transition-colors cursor-col-resize relative flex items-center justify-center select-none shrink-0 z-30"
                        >
                            {/* Center hairline */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#1E223D]" />

                            {/* Pill handle with 6 dots */}
                            <div
                                style={{
                                    boxShadow: "0 2px 10px rgba(99, 91, 255, 0.35)",
                                }}
                                className="relative z-10 w-5 h-11 rounded-[10px] bg-[#261D5A] border-[1.4px] border-[#635BFF] flex items-center justify-center cursor-col-resize"
                            >
                                <div className="flex items-center gap-[3px]">
                                    <div className="flex flex-col gap-[3px]">
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                    </div>
                                    <div className="flex flex-col gap-[3px]">
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                        <div className="w-[3.2px] h-[3.2px] rounded-full bg-white/85" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Chat Section */}
                    {(!isMobile || mobileTabIndex === 1) &&
                        (workspaceViewMode !== "docOnly" || isMobile) && (
                            <div
                                style={{
                                    width: isMobile
                                        ? "100%"
                                        : workspaceViewMode === "chatOnly"
                                            ? "100%"
                                            : `${(1 - splitRatio) * 100}%`,
                                }}
                                className="flex-1 flex flex-col h-full bg-[#090A14] overflow-hidden"
                            >
                                {/* Chat Messages Scrollable Area */}
                                <div
                                    ref={chatScrollContainerRef}
                                    onScroll={(e) => {
                                        const el = e.currentTarget;
                                        if (
                                            el.scrollTop <= 30 &&
                                            hasMoreEarlierMessages &&
                                            !isLoadingEarlierMessages
                                        ) {
                                            handleLoadEarlierMessages();
                                        }
                                    }}
                                    className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6"
                                >
                                    {/* Load earlier messages spinner */}
                                    {isLoadingEarlierMessages && (
                                        <div className="flex justify-center py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#6C56E5]" />
                                        </div>
                                    )}

                                    {/* Empty state placeholder */}
                                    {messages.length === 0 && !isSendingMessage && (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                                            <div className="p-4 rounded-full bg-[#6C56E5]/15 mb-4">
                                                <Sparkles className="w-8 h-8 text-[#A78BFA]" />
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-2">
                                                Ask anything about &quot;{docName}&quot;
                                            </h3>
                                            <p className="text-xs text-[#8E95AF] max-w-sm leading-relaxed">
                                                Summarize sections, extract key insights, explain
                                                clauses, or find specific details.
                                            </p>
                                        </div>
                                    )}

                                    {/* Message cards */}
                                    {messages.map((msg) => {
                                        const isUser = msg.role === "user";
                                        if (isUser) {
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className="flex flex-col items-end mb-6"
                                                >
                                                    <div className="max-w-[540px] p-3.5 rounded-2xl bg-[#14172B] border border-[#282C4E]">
                                                        {/* Attached Document Pill */}
                                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0C0E1A] border border-[#232742] mb-3">
                                                            {renderPdfBadgeIcon(docName)}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[13px] font-semibold text-white truncate">
                                                                    {docName}
                                                                </span>
                                                                <span className="text-[11px] text-[#7E86A3]">
                                                                    {pageCountStr}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-[14px] font-medium text-white leading-relaxed whitespace-pre-wrap">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                    <span className="text-[11px] text-[#6B7280] mt-1 pr-1">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        // AI Message Card
                                        return (
                                            <div
                                                key={msg.id}
                                                className="flex flex-col items-start mb-6"
                                            >
                                                {/* Header */}
                                                <div className="flex items-center gap-2 w-full mb-2.5">
                                                    <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                    </div>
                                                    <span className="text-[13.5px] font-bold text-white">
                                                        OneChat AI
                                                    </span>
                                                    <span className="text-[11px] text-[#6B7280]">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                    <div className="flex-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(msg.content);
                                                            showToast("Copied response to clipboard");
                                                        }}
                                                        className="p-1 rounded text-[#7E86A3] hover:text-white transition cursor-pointer"
                                                        title="Copy response"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Content Body with Markdown */}
                                                <div className="w-full text-[13.5px] text-[#E2E8F0] leading-[1.6]">
                                                    {msg.content ? (
                                                        <div className="prose prose-invert max-w-none text-[13.5px] leading-relaxed">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    p: ({ children }) => (
                                                                        <p className="mb-3 text-[#E2E8F0] text-[13.5px] leading-relaxed">
                                                                            {children}
                                                                        </p>
                                                                    ),
                                                                    strong: ({ children }) => (
                                                                        <strong className="text-white font-bold">
                                                                            {children}
                                                                        </strong>
                                                                    ),
                                                                    h1: ({ children }) => (
                                                                        <h1 className="text-white text-[17px] font-bold mt-4 mb-2">
                                                                            {children}
                                                                        </h1>
                                                                    ),
                                                                    h2: ({ children }) => (
                                                                        <h2 className="text-white text-[15.5px] font-bold mt-3 mb-2">
                                                                            {children}
                                                                        </h2>
                                                                    ),
                                                                    h3: ({ children }) => (
                                                                        <h3 className="text-[#A78BFA] text-[14.5px] font-semibold mt-2 mb-1">
                                                                            {children}
                                                                        </h3>
                                                                    ),
                                                                    ul: ({ children }) => (
                                                                        <ul className="list-disc pl-5 space-y-1 mb-3 text-[#E2E8F0]">
                                                                            {children}
                                                                        </ul>
                                                                    ),
                                                                    ol: ({ children }) => (
                                                                        <ol className="list-decimal pl-5 space-y-1 mb-3 text-[#E2E8F0]">
                                                                            {children}
                                                                        </ol>
                                                                    ),
                                                                    li: ({ children }) => (
                                                                        <li className="text-[13.5px]">{children}</li>
                                                                    ),
                                                                    code: ({ className, children, ...props }) => {
                                                                        const match = /language-(\w+)/.exec(
                                                                            className || "",
                                                                        );
                                                                        return match ? (
                                                                            <pre className="bg-[#121424] border border-[#262C4E] rounded-xl p-3 my-2 overflow-x-auto text-[12.5px] font-mono text-[#A78BFA]">
                                                                                <code>{children}</code>
                                                                            </pre>
                                                                        ) : (
                                                                            <code
                                                                                className="bg-[#131629] text-[#A78BFA] px-1.5 py-0.5 rounded font-mono text-[12.5px]"
                                                                                {...props}
                                                                            >
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    blockquote: ({ children }) => (
                                                                        <blockquote className="border-l-4 border-[#6C56E5] bg-[#121426] p-3 rounded-r-lg text-[#CBD5E1] italic my-2">
                                                                            {children}
                                                                        </blockquote>
                                                                    ),
                                                                    table: ({ children }) => (
                                                                        <div className="overflow-x-auto my-3">
                                                                            <table className="border-collapse border border-[#262C4E] text-xs w-full">
                                                                                {children}
                                                                            </table>
                                                                        </div>
                                                                    ),
                                                                    th: ({ children }) => (
                                                                        <th className="border border-[#262C4E] bg-[#181C30] text-white px-3 py-2 font-bold text-left">
                                                                            {children}
                                                                        </th>
                                                                    ),
                                                                    td: ({ children }) => (
                                                                        <td className="border border-[#262C4E] text-[#CBD5E1] px-3 py-1.5">
                                                                            {children}
                                                                        </td>
                                                                    ),
                                                                }}
                                                            >
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        /* Thinking state */
                                                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#14172B] border border-[#282C4E]">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C56E5]" />
                                                            <span className="text-[13px] font-medium text-[#A78BFA]">
                                                                Reading document &amp; preparing answer...
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Fixed Bottom Chat Input Bar matching Flutter _buildBottomInputBar */}
                                <div className="p-3 sm:p-5 pt-0">
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121424] border-[1.2px] border-[#4A3B8C] shadow-lg">
                                        {/* Paperclip */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                showToast(`Document already attached: ${docName}`)
                                            }
                                            title="Attach file"
                                            className="text-[#7E86A3] hover:text-white transition p-1 cursor-pointer shrink-0"
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </button>

                                        {/* Input field */}
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            disabled={isSendingMessage}
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder={
                                                isSendingMessage
                                                    ? "Generating answer..."
                                                    : "Ask anything about this PDF..."
                                            }
                                            className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-[#5F6987]"
                                        />

                                        {/* Mic button */}
                                        <button
                                            type="button"
                                            onClick={toggleSpeech}
                                            title={
                                                isListening
                                                    ? "Stop listening"
                                                    : "Voice input (Speech to Text)"
                                            }
                                            className={`p-1.5 transition rounded-lg cursor-pointer shrink-0 ${isListening
                                                    ? "text-red-400 animate-pulse"
                                                    : "text-[#7E86A3] hover:text-white"
                                                }`}
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>

                                        {/* Round Upward Send Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleSendMessage()}
                                            disabled={isSendingMessage || !inputMessage.trim()}
                                            title="Send question"
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${isSendingMessage || !inputMessage.trim()
                                                    ? "bg-[#635BFF]/40 text-white/50 cursor-not-allowed"
                                                    : "bg-[#635BFF] hover:bg-[#5249f0] text-white shadow-md hover:scale-105"
                                                }`}
                                        >
                                            {isSendingMessage ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            ) : (
                                                <ArrowUp className="w-5 h-5 text-white" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Jump to Page Dialog */}
            {isJumpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-2xl bg-[#16192E] border border-[#2E3356] p-5 shadow-2xl">
                        <h3 className="text-base font-semibold text-white mb-4">
                            Go to Page
                        </h3>
                        <div className="mb-5">
                            <input
                                type="number"
                                min={1}
                                max={effectivePages}
                                value={jumpPageInput}
                                onChange={(e) => setJumpPageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleJumpToPageSubmit();
                                    }
                                }}
                                placeholder={`Page (1-${effectivePages})`}
                                autoFocus
                                className="w-full rounded-xl bg-[#0F1122] border border-[#33385E] px-3.5 py-2.5 text-white text-[15px] outline-none focus:border-[#6C56E5]"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsJumpModalOpen(false)}
                                className="px-4 py-2 text-sm text-white/60 hover:text-white transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleJumpToPageSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#6C56E5] hover:bg-[#5842dc] rounded-lg transition cursor-pointer"
                            >
                                Go
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Chat Modal */}
            {renameModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-2xl bg-[#16192E] border border-[#2E3356] p-5 shadow-2xl">
                        <h3 className="text-base font-semibold text-white mb-4">
                            Rename Chat
                        </h3>
                        <div className="mb-5">
                            <input
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRenameChat();
                                    }
                                }}
                                placeholder="New title..."
                                autoFocus
                                className="w-full rounded-xl bg-[#0F1122] border border-[#33385E] px-3.5 py-2.5 text-white text-[14px] outline-none focus:border-[#6C56E5]"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRenameModalOpen(false)}
                                className="px-4 py-2 text-sm text-white/60 hover:text-white transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRenameChat}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#6C56E5] hover:bg-[#5842dc] rounded-lg transition cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ChatPdfPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-[#07080F] text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6C56E5]" />
                </div>
            }
        >
            <ChatPdfInner />
        </Suspense>
    );
}
