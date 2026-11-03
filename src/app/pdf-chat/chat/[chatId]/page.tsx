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
    FileSpreadsheet,
    AlertTriangle,
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

    }

    try {
        const saved =
            localStorage.getItem("flutter.user_token") ||
            localStorage.getItem("authToken");
        if (saved) {
            return saved.replace(/^["']|["']$/g, "").trim();
        }
    } catch {

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

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const countMatches = (text: string, query: string): number => {
    if (!query) return 0;
    const regex = new RegExp("(" + escapeRegExp(query) + ")", "gi");
    return Math.floor((text.split(regex).length - 1) / 2);
};

const renderHighlightedDocText = (
    text: string,
    query: string,
    currentIndex: number,
) => {
    if (!query.trim()) return text;
    const regex = new RegExp("(" + escapeRegExp(query) + ")", "gi");
    let hit = 0;
    return text.split(regex).map((part, i) => {
        if (i % 2 === 1) {
            hit++;
            const isCurrent = hit === currentIndex;
            return (
                <mark
                    key={i}
                    data-hit={isCurrent ? "current" : "match"}
                    className={`rounded px-0.5 text-black font-semibold ${isCurrent
                        ? "bg-[#FF9800] ring-2 ring-[#FF9800]/60"
                        : "bg-[#FFEB3B]"
                        }`}
                >
                    {part}
                </mark>
            );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
};

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
    const [splitRatio, setSplitRatio] = useState<number>(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const [mobileTab, setMobileTab] = useState<"doc" | "chat">("chat");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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
    const [pdfMatchCount, setPdfMatchCount] = useState(0);
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.search) {
            window.history.replaceState(null, "", window.location.pathname);
        }
    }, []);

    const isSendingMessageRef = useRef(isSendingMessage);
    isSendingMessageRef.current = isSendingMessage;
    const handleSendMessageRef = useRef<(textToSend?: string, targetChatId?: string) => Promise<void>>(async () => { });

    const handleSendMessage = useCallback(
        async (textToSend?: string, targetChatId?: string) => {
            const prompt = (textToSend ?? inputMessage).trim();
            const activeId = targetChatId || session?.id || chatId;
            if (!prompt || !activeId || isSendingMessageRef.current) return;

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
        [inputMessage, session?.id, chatId, scrollToBottom],
    );
    handleSendMessageRef.current = handleSendMessage;

    useEffect(() => {
        if (!chatId) return;
        let cancelled = false;

        async function fetchSession() {
            try {
                setIsLoadingSession(true);
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
                                handleSendMessageRef.current(promptToUse, chatId);
                            }, 150);
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
    }, [chatId, initialPromptFromUrl]);

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

    const handleDownloadDocument = useCallback(async () => {
  const fileName = session?.originalFileName || "Document.pdf";
  const fileUrl = session?.fileUrl;

  try {
    if (fileUrl) {
      const fullUrl = fileUrl.startsWith("http")
        ? fileUrl
        : `${getApiServerBase()}${fileUrl}`;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast(`Downloading ${fileName}...`);
      return;
    }

    if (session?.extractedText) {
      const downloadName = fileName.replace(/\.[^/.]+$/, "") + ".txt";
      const blob = new Blob([session.extractedText], { type: "text/plain;charset=utf-8" });
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
  } catch (err) {
    // Fallback: open in new tab
    if (fileUrl) {
      const url = fileUrl.startsWith("http") ? fileUrl : `${getApiServerBase()}${fileUrl}`;
      window.open(url, "_blank");
    }
  }
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

    const docName = session?.originalFileName || session?.title || "Document.pdf";
    const candidateNames = [
        session?.originalFileName || "",
        session?.title || "",
        docName,
    ].map((s) => s.toLowerCase());

    const isDocOrWord = candidateNames.some(
        (name) =>
            name.endsWith(".doc") ||
            name.endsWith(".docx") ||
            name.endsWith(".txt") ||
            name.endsWith(".rtf") ||
            name.includes(".doc?") ||
            name.includes(".docx?"),
    );

    const rawExt = (docName.includes(".") ? (docName.split(".").pop() || "") : "").toLowerCase();
    const fileType = isDocOrWord
        ? (rawExt && ["doc", "docx", "txt", "rtf"].includes(rawExt)
            ? rawExt
            : candidateNames.find((n) => n.endsWith(".docx"))
                ? "docx"
                : "doc")
        : (rawExt === "pdf" ? "pdf" : rawExt || "pdf");

    const effectivePages =
        pdfNumPages > 0 ? pdfNumPages : session?.pageCount || 1;
    const sizeStr = formatFileSize(session?.fileSize);

    const resolvedPdfUrl = useMemo(() => {
        if (!session?.fileUrl) return null;
        return session.fileUrl.startsWith("http")
            ? session.fileUrl
            : `${getApiServerBase()}${session.fileUrl}`;
    }, [session?.fileUrl]);

    // Only genuine PDF documents use react-pdf viewer. Doc/Word/Text files always use the Paper Document view matching Analyze
    const isPdf =
        !isDocOrWord &&
        (rawExt === "pdf" ||
            Boolean(
                resolvedPdfUrl &&
                (resolvedPdfUrl.toLowerCase().endsWith(".pdf") ||
                    resolvedPdfUrl.toLowerCase().includes(".pdf?")),
            ));

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

    const pageCountStr = isDocOrWord
        ? (session?.wordCount
            ? `${session.wordCount} words${sizeStr ? ` • ${sizeStr}` : ""}`
            : `${cleanExtractedText ? cleanExtractedText.trim().split(/\s+/).length : 0} words${sizeStr ? ` • ${sizeStr}` : ""}`)
        : `${effectivePages} ${effectivePages === 1 ? "page" : "pages"}${sizeStr ? ` • ${sizeStr}` : ""}`;



    const showPdfViewer = isPdf && !!resolvedPdfUrl && !hasPdfLoadFailed;
    const trimmedQuery = searchQuery.trim();

    const docMatchCount = useMemo(() => {
        if (showPdfViewer || !trimmedQuery || !cleanExtractedText) return 0;
        return countMatches(cleanExtractedText, trimmedQuery);
    }, [showPdfViewer, trimmedQuery, cleanExtractedText]);

    const searchTotalCount = showPdfViewer ? pdfMatchCount : docMatchCount;

    const syncPdfHighlights = useCallback(
        (scroll: boolean) => {
            const root = docScrollContainerRef.current;
            if (!root) return;
            const hits = Array.from(
                root.querySelectorAll<HTMLElement>("mark.pdf-hit"),
            );
            setPdfMatchCount(hits.length);
            hits.forEach((el, i) =>
                el.classList.toggle("pdf-hit-current", i + 1 === searchCurrentIndex),
            );
            if (scroll && hits[searchCurrentIndex - 1]) {
                hits[searchCurrentIndex - 1].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        },
        [searchCurrentIndex],
    );

    const pdfTextRenderer = useCallback(
        ({ str }: { str: string }) => {
            if (!trimmedQuery) return escapeHtml(str);
            const regex = new RegExp("(" + escapeRegExp(trimmedQuery) + ")", "gi");
            return str
                .split(regex)
                .map((part, i) =>
                    i % 2 === 1
                        ? `<mark class="pdf-hit">${escapeHtml(part)}</mark>`
                        : escapeHtml(part),
                )
                .join("");
        },
        [trimmedQuery],
    );

    useEffect(() => {
        if (!showPdfViewer) return;
        if (!trimmedQuery) {
            setPdfMatchCount(0);
            return;
        }
        const t = setTimeout(() => syncPdfHighlights(true), 200);
        return () => clearTimeout(t);
    }, [showPdfViewer, trimmedQuery, searchCurrentIndex, syncPdfHighlights]);

    useEffect(() => {
        if (showPdfViewer || !trimmedQuery) return;
        const t = setTimeout(() => {
            docScrollContainerRef.current
                ?.querySelector('[data-hit="current"]')
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
        return () => clearTimeout(t);
    }, [showPdfViewer, trimmedQuery, searchCurrentIndex, searchTotalCount]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setSearchCurrentIndex(query.trim() ? 1 : 0);
    }, []);

    const handleNextSearchResult = useCallback(() => {
        if (searchTotalCount > 0)
            setSearchCurrentIndex((prev) => (prev % searchTotalCount) + 1);
    }, [searchTotalCount]);

    const handlePrevSearchResult = useCallback(() => {
        if (searchTotalCount > 0)
            setSearchCurrentIndex((prev) =>
                prev <= 1 ? searchTotalCount : prev - 1,
            );
    }, [searchTotalCount]);

    const closeSearch = useCallback(() => {
        setIsSearchVisible(false);
        setSearchQuery("");
        setSearchCurrentIndex(0);
        setPdfMatchCount(0);
    }, []);



    return (
        <div className="flex flex-col h-screen w-screen bg-[#070914] text-slate-100 overflow-hidden font-sans select-text">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl bg-[#1E1B38] border border-[#3B3363] text-white text-[13px] font-medium shadow-2xl animate-in fade-in slide-in-from-top-3">
                    {toastMessage}
                </div>
            )}

            {/* Top Header matching Flutter _buildTopHeader & Analyze */}
            <header className="h-16 px-3.5 md:px-5 flex items-center justify-between bg-[#0F1123] border-b border-[#1E223D] shrink-0 relative z-30">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                if (document.referrer && document.referrer.includes("multi-chat")) {
                                    try {
                                        const refUrl = new URL(document.referrer);
                                        refUrl.searchParams.set("subTab", "ChatPDF");
                                        window.location.href = refUrl.toString();
                                        return;
                                    } catch (_) { }
                                }

                                if (window.history.length > 1 && document.referrer && document.referrer.startsWith(window.location.origin)) {
                                    router.back();
                                    return;
                                }

                                window.location.href = "/chat-pdf";
                            }
                        }}
                        className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-[13px] font-semibold hover:bg-[#322774] transition shrink-0"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Back to ChatPDF</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    {renderPdfBadgeIcon(docName)}
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-[14px] md:text-[14.5px] font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {docName}
                        </h1>
                        <span className="text-[11px] md:text-[11.5px] text-[#8E95AF] font-medium">
                            {pageCountStr}
                        </span>
                    </div>
                </div>

                {!isMobile && (
                    <div className="flex items-center gap-2">
                        {/* Document Full View Toggle Button */}
                        <div className="relative group/docbtn">
                            <button
                                type="button"
                                onClick={() => {
                                    setWorkspaceViewMode(workspaceViewMode === "docOnly" ? "split" : "docOnly");
                                    setSplitRatio(0.5);
                                }}
                                className={`cursor-pointer p-2 rounded-lg border transition ${workspaceViewMode === "docOnly"
                                    ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                                    : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
                                    }`}
                                aria-label="Document Full View"
                            >
                                <Columns className="w-4 h-4" />
                            </button>
                            <div className="pointer-events-none absolute top-full right-0 mt-2.5 hidden group-hover/docbtn:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-[9999] animate-in fade-in zoom-in-95">
                                Document Full View
                                <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-[#181B34]" />
                            </div>
                        </div>

                        <div className="relative group/chatbtn">
                            <button
                                type="button"
                                onClick={() => {
                                    setWorkspaceViewMode(workspaceViewMode === "chatOnly" ? "split" : "chatOnly");
                                    setSplitRatio(0.5);
                                }}
                                className={`cursor-pointer p-2 rounded-lg border transition ${workspaceViewMode === "chatOnly"
                                    ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                                    : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
                                    }`}
                                aria-label="Chat Full View"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <div className="pointer-events-none absolute top-full right-0 mt-2.5 hidden group-hover/chatbtn:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-[9999] animate-in fade-in zoom-in-95">
                                Chat Full View
                                <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-[#181B34]" />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {isMobile && (
                <div className="bg-[#090A14] px-4 py-2 shrink-0 border-b border-[#1E223D]">
                    <div className="flex rounded-xl bg-[#121424] border border-[#222642] p-1">
                        <button
                            type="button"
                            onClick={() => setMobileTab("doc")}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${mobileTab === "doc"
                                ? "bg-[#6C56E5] text-white shadow-md"
                                : "text-[#8E95AF] hover:text-white"
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Document
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab("chat")}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${mobileTab === "chat"
                                ? "bg-[#6C56E5] text-white shadow-md"
                                : "text-[#8E95AF] hover:text-white"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" /> Chat & Analysis
                        </button>
                    </div>
                </div>
            )}

            <div
                ref={containerRef}
                className="flex flex-1 min-h-0 relative overflow-hidden select-text"
            >
                {(!isMobile || mobileTab === "doc") &&
                    (workspaceViewMode !== "chatOnly" || isMobile) && (
                        <div
                            style={{
                                width: isMobile
                                    ? "100%"
                                    : workspaceViewMode === "docOnly"
                                        ? "100%"
                                        : `${splitRatio * 100}%`,
                            }}
                            className="relative flex flex-col bg-[#0B0E1A] border-r border-[#1E223D] overflow-hidden h-full"
                        >
                            {isSearchVisible && (
                                <div className="absolute bottom-[76px] inset-x-0 flex justify-center z-30 px-4 pointer-events-none">
                                    <div className="pointer-events-auto bg-[#121424] border border-[#292D49] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-2xl backdrop-blur-md">
                                        <Search className="w-4 h-4 text-[#A78BFA] shrink-0" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    e.shiftKey ? handlePrevSearchResult() : handleNextSearchResult();
                                                } else if (e.key === "Escape") {
                                                    closeSearch();
                                                }
                                            }}
                                            placeholder="Search in document..."
                                            className="bg-transparent text-white text-sm outline-none w-36 placeholder:text-slate-500 cursor-text"
                                            autoFocus
                                        />
                                        <div className="flex items-center gap-3 text-slate-400 border-l border-[#292D49] pl-4 ml-1">
                                            <ChevronLeft onClick={handlePrevSearchResult} className="w-4 h-4 cursor-pointer hover:text-white transition" />
                                            <span className="text-xs font-medium min-w-[36px] text-center">
                                                {trimmedQuery && searchTotalCount > 0
                                                    ? `${searchCurrentIndex} / ${searchTotalCount}`
                                                    : "0 / 0"}
                                            </span>
                                            <ChevronRight onClick={handleNextSearchResult} className="w-4 h-4 cursor-pointer hover:text-white transition" />
                                            <X onClick={closeSearch} className="w-4 h-4 cursor-pointer hover:text-white ml-1 transition" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div
                                ref={docScrollContainerRef}
                                className={`flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 pb-28 relative flex ${isPdf ? "flex-col items-center" : "justify-center items-start"}`}
                            >
                                {isLoadingSession ? (
                                    <div className="flex h-full items-center justify-center flex-col gap-3.5 my-auto">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#6C56E5]" />
                                        <span className="text-xs text-[#8E95AF] font-medium">
                                            Loading PDF document...
                                        </span>
                                    </div>
                                ) : isPdf && resolvedPdfUrl && !hasPdfLoadFailed ? (
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
                                                                ? typeof window !== "undefined"
                                                                    ? Math.min(window.innerWidth - 32, 680)
                                                                    : 340
                                                                : Math.min(
                                                                    680,
                                                                    typeof window !== "undefined"
                                                                        ? window.innerWidth * splitRatio - 60
                                                                        : 500,
                                                                )
                                                        }
                                                        renderAnnotationLayer={false}
                                                        renderTextLayer={true}
                                                        customTextRenderer={pdfTextRenderer}
                                                        onRenderTextLayerSuccess={() => syncPdfHighlights(false)}
                                                    />
                                                </div>
                                            ))}
                                        </Document>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: "top center",
                                        }}
                                        className="w-full max-w-[800px] bg-white rounded-lg shadow-2xl p-6 sm:p-12 text-slate-800 min-h-[650px] my-4 leading-relaxed select-text transition-transform border border-slate-200/80"
                                    >
                                        <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
                                            <div>
                                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                                    {docName}
                                                </h2>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    Document Content Extract
                                                </p>
                                            </div>
                                            <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#2B579A]/10 text-[#2B579A] font-bold font-mono uppercase">
                                                {fileType || "doc"}
                                            </span>
                                        </div>

                                        <div className="text-[14px] whitespace-pre-wrap font-sans text-slate-800 leading-relaxed font-normal">
                                            {cleanExtractedText ? (
                                                trimmedQuery
                                                    ? renderHighlightedDocText(cleanExtractedText, trimmedQuery, searchCurrentIndex)
                                                    : cleanExtractedText

                                            ) : (
                                                <div className="text-slate-400 italic text-center py-12">
                                                    No preview text could be extracted from this document.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none z-20 px-3">
                                <div className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0C101E]/95 border border-[#1E2640] shadow-[0_8px_24px_rgba(0,0,0,0.65)] backdrop-blur-md text-white text-xs font-medium">
                                    <button
                                        type="button"
                                        onClick={handleZoomOut}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetZoom}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                                        title="Fit to Page"
                                    >
                                        <Maximize className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleZoomIn}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />
                                    <button
                                        type="button"
                                        onClick={handlePrevPage}
                                        disabled={currentPage <= 1 || isDocOrWord}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
                                        title="Previous"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setJumpPageInput(String(currentPage));
                                            setIsJumpModalOpen(true);
                                        }}
                                        className="px-1 text-[11.5px] font-semibold text-white hover:text-[#A78BFA] transition cursor-pointer"
                                        title="Jump to page"
                                    >
                                        {isDocOrWord ? "1 / 1" : `${currentPage} / ${effectivePages}`}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextPage}
                                        disabled={currentPage >= effectivePages || isDocOrWord}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
                                        title="Next"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />
                                    <button
                                        type="button"
                                        onClick={handleDownloadDocument}
                                        className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                                        title="Download document"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => (isSearchVisible ? closeSearch() : (setIsSearchVisible(true), setTimeout(() => searchInputRef.current?.focus(), 100)))}
                                        className={`cursor-pointer p-1.5 rounded-full transition ${isSearchVisible ? "bg-[#6C56E5]/40 text-[#A78BFA]" : "hover:bg-white/10 text-slate-300"}`}
                                        title="Search in Document"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Draggable Divider matching Flutter _buildDraggableDivider */}
                {workspaceViewMode === "split" && !isMobile && (
                    <div
                        onMouseDown={() => setIsDragging(true)}
                        className="relative flex items-center justify-center w-3 bg-[#090A14] hover:bg-[#1E223D] cursor-col-resize select-none shrink-0 z-30 transition-colors"
                    >
                        <div className="w-[1px] h-full bg-[#1E223D]" />
                        <div className="absolute w-5 h-11 rounded-[10px] bg-[#261D5A] border-[1.4px] border-[#635BFF] shadow-[0_2px_10px_rgba(99,91,255,0.4)] flex items-center justify-center gap-[3px] pointer-events-none">
                            <div className="flex flex-col gap-[3px]">
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                            </div>
                            <div className="flex flex-col gap-[3px]">
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                            </div>
                        </div>
                    </div>
                )}

                {(!isMobile || mobileTab === "chat") &&
                    (workspaceViewMode !== "docOnly" || isMobile) && (
                        <div
                            style={{
                                width: isMobile
                                    ? "100%"
                                    : workspaceViewMode === "chatOnly"
                                        ? "100%"
                                        : `${(1 - splitRatio) * 100}%`,
                            }}
                            className="flex flex-col bg-[#070914] overflow-hidden h-full relative"
                        >
                            <div className="flex h-full min-h-0 w-full flex-col bg-[#070914] text-white">
                                {/* Top Chat Header matching Analyze */}
                                <div className="flex items-center gap-3 border-b border-[#1E223D] px-5 py-4 shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C56E5]/20">
                                        <Sparkles className="h-5 w-5 text-[#A78BFA]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-semibold">OneChat AI</h2>
                                        <p className="truncate text-xs text-slate-400">
                                            Ask anything about {docName}
                                        </p>
                                    </div>
                                </div>

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
                                    className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
                                >
                                    {/* Load earlier messages spinner */}
                                    {isLoadingEarlierMessages && (
                                        <div className="flex justify-center py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#6C56E5]" />
                                        </div>
                                    )}

                                    {(isLoadingSession || (isSendingMessage && messages.length === 0)) && (
                                        <div className="flex h-full min-h-[300px] items-center justify-center flex-col gap-3.5 my-auto">
                                            <div className="flex w-fit items-center gap-3 rounded-full border border-[#292D49] bg-[#121424] px-4 py-2.5 text-sm text-[#A78BFA]">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#6C56E5]" />
                                                Reading document &amp; preparing answer...
                                            </div>
                                        </div>
                                    )}

                                    {!isLoadingSession && messages.length === 0 && !isSendingMessage && (
                                        <div className="mx-auto mt-10 max-w-lg text-center px-4">
                                            <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#8B7AFF]" />
                                            <h3 className="text-lg font-semibold text-white">
                                                What would you like to explore?
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Ask questions, extract key insights, explain clauses, or summarize sections from your PDF.
                                            </p>
                                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                                {[
                                                    "Summarize this document",
                                                    "What are the key points?",
                                                    "Explain the main conclusions",
                                                    "Find key dates and numbers",
                                                ].map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => void handleSendMessage(suggestion)}
                                                        className="rounded-full border border-[#292D49] px-3.5 py-2 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 cursor-pointer"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg) => {
                                        const isUser = msg.role === "user";
                                        if (isUser) {
                                            return (
                                                <div key={msg.id} className="flex justify-end">
                                                    <div className="max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#6C56E5] px-4 py-3 text-sm text-white leading-relaxed">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const isError =
                                            msg.content.startsWith("[Error:") ||
                                            msg.content.startsWith("Error:") ||
                                            msg.content.includes("failed to serve this request") ||
                                            msg.content.includes("Request failed");

                                        if (isError) {
                                            return (
                                                <div key={msg.id} className="w-full">
                                                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-200">
                                                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                                                        <div>
                                                            <div className="font-semibold text-red-300">
                                                                AI Service Notice
                                                            </div>
                                                            <div className="mt-1 text-xs text-red-200/90 leading-relaxed">
                                                                {/* {msg.content.replace(/^\[Error:\s*\vert{}\s*\]$/g, "")} */}
                                                                {msg.content.replace(/^\[Error:\s*/, "").replace(/\]\s*$/, "")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (!msg.content || msg.content.trim().length === 0) {
                                            if (isSendingMessage) {
                                                return (
                                                    <div key={msg.id} className="flex justify-start">
                                                        <div className="flex w-fit items-center gap-3 rounded-full border border-[#292D49] bg-[#121424] px-4 py-2.5 text-sm text-[#A78BFA]">
                                                            <Loader2 className="h-4 w-4 animate-spin text-[#6C56E5]" />
                                                            Reading document &amp; preparing answer...
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }

                                        return (
                                            <div key={msg.id} className="flex flex-col items-start w-full">
                                                <div className="flex items-center gap-2 w-full mb-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#6C56E5]/20 flex items-center justify-center">
                                                        <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                                                    </div>
                                                    <span className="text-[13px] font-semibold text-white">
                                                        OneChat AI
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                    <div className="flex-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(msg.content);
                                                            showToast("Copied response to clipboard");
                                                        }}
                                                        className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                                                        title="Copy response"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="w-full text-sm text-[#E2E8F0] leading-relaxed">
                                                    <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                p: ({ children }) => (
                                                                    <p className="mb-3 text-[#E2E8F0] text-sm leading-relaxed">
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
                                                                    <li className="text-sm">{children}</li>
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
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* In case messages ends with a user message and assistant message is not yet added */}
                                    {isSendingMessage && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                                        <div className="flex justify-start">
                                            <div className="flex w-fit items-center gap-3 rounded-full border border-[#292D49] bg-[#121424] px-4 py-2.5 text-sm text-[#A78BFA]">
                                                <Loader2 className="h-4 w-4 animate-spin text-[#6C56E5]" />
                                                Reading document &amp; preparing answer...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} className="h-0 w-0" />
                                </div>

                                {/* Bottom Chat Input Bar matching Analyze Data */}
                                <div className="border-t border-[#1E223D] bg-[#070914] p-4 sm:px-6 shrink-0">
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            void handleSendMessage();
                                        }}
                                        className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-[#292D49] bg-[#0C1020] px-4 py-3 focus-within:border-[#7564F6]"
                                    >
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            disabled={isSendingMessage}
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder={
                                                isSendingMessage
                                                    ? "Generating answer..."
                                                    : "Ask anything about this PDF..."
                                            }
                                            className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50 cursor-text"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleSpeech}
                                            title={isListening ? "Stop listening" : "Voice input"}
                                            className={`p-1.5 transition rounded-lg cursor-pointer shrink-0 ${isListening
                                                ? "text-red-400 animate-pulse"
                                                : "text-slate-400 hover:text-white"
                                                }`}
                                        >
                                            <Mic className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!inputMessage.trim() || isSendingMessage}
                                            className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full bg-[#6C56E5] text-white transition hover:bg-[#7965F0] disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Send message"
                                        >
                                            {isSendingMessage ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ArrowUp className="h-4 w-4" />
                                            )}
                                        </button>
                                    </form>
                                    <p className="mt-2 text-center text-[11px] text-slate-500">
                                        OneChat AI can make mistakes. Check important information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
