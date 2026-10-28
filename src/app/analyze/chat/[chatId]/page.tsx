"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useRouter } from "next/navigation";
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
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
  ImageIcon,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { C1MessageItem } from "@/components/C1MessageItem";

// 1. Dynamically import react-pdf components to prevent SSR 'document is not defined' errors
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false },
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// 2. Safely initialize the PDF worker only on the client side
if (typeof window !== "undefined") {
  import("react-pdf").then((mod) => {
    // Note the .mjs extension used in modern pdfjs-dist (v3.x / v4.x+)
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
  });
}

const C1Component = dynamic(
  () => import("@thesysai/genui-sdk").then((mod) => mod.C1Component),
  { ssr: false },
);

interface Message {
  role: "user" | "assistant";
  content: string;
  charts?: any[];
  thesysMetadata?: any;
  toolType?: "analyze" | "report" | "dashboard" | "slides";
  createdAt?: string;
}

export interface ChatFileItem {
  originalFileName: string;
  fileType: string;
  fileUrl?: string;
  fileSize?: number;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  tableData?: any[];
  tabularPreview?: any[];
  sheetNames?: string[];
  extractedText?: string;
  visualImageUrls?: string[];
  pageCount?: number;
  datasetCoverage?: {
    totalRows?: number;
    analyzedRows?: number;
    isComplete?: boolean;
    limitReason?: string;
  };
}

interface ChatSession {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: string;
  fileUrl?: string;
  fileSize?: number;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  tableData?: any[];
  tabularPreview?: any[];
  sheetNames?: string[];
  extractedText?: string;
  visualImageUrls?: string[];
  initialPrompt?: string;
  datasetCoverage?: {
    totalRows?: number;
    analyzedRows?: number;
    isComplete?: boolean;
    limitReason?: string;
  };
  files?: ChatFileItem[];
  messages: Message[];
}

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
      localStorage.setItem(
        "flutter.user_token",
        JSON.stringify(urlToken.trim()),
      );
      searchParams.delete("token");
      const newQuery = searchParams.toString();
      const newUrl =
        window.location.pathname +
        (newQuery ? `?${newQuery}` : "") +
        window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      return urlToken.trim();
    }
  } catch (_) { }

  const candidateKeys = [
    "flutter.user_token",
    "token",
    "authToken",
    "user_token",
    "flutter.token",
    "accessToken",
  ];
  for (const key of candidateKeys) {
    const val = localStorage.getItem(key);
    if (val && val !== "null" && val !== "undefined") {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === "string" && parsed.length > 10) return parsed;
      } catch (_) {
        const cleaned = val.replace(/^"+|"+$/g, "").trim();
        if (cleaned.length > 10) return cleaned;
      }
    }
  }

  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie.match(
      /(?:^|;\s*)(?:token|user_token|FBSESSION)=([^;]+)/,
    );
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch (_) {
        return match[1];
      }
    }
  }
  return "";
}

export default function AnalyzeChatNextPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.chatId as string;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "docOnly" | "chatOnly">(
    "split",
  );
  const [pdfNumPages, setPdfNumPages] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"doc" | "chat">("chat");
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [appliedPdfSearch, setAppliedPdfSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Multi-file tabs state
  const [filesList, setFilesList] = useState<ChatFileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const [customChatMessages, setCustomChatMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [customChatInput, setCustomChatInput] = useState("");
  const [customChatLoading, setCustomChatLoading] = useState(false);

  // Multi-tab Excel support
  const [excelSheets, setExcelSheets] = useState<{
    [sheetName: string]: any[];
  }>({});
  const [excelSheetNames, setExcelSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [excelLoading, setExcelLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoTriggeredRef = useRef(false);

  const highlightPattern = (text: string, pattern: string) => {
    if (!pattern) return text;
    // Safely escape the search string
    const escapeRegExp = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(pattern)})`, "gi");

    return text
      .split(regex)
      .map((part) => {
        if (regex.test(part)) {
          // ✅ Fix: Use inline styles to force it to show above the PDF canvas
          return `<mark style="background-color: #FF9900; color: white; font-weight: bold; border-radius: 2px;">${part}</mark>`;
        }
        return part;
      })
      .join("");
  };

  const customTextRenderer = useCallback(
    // ✅ Fix: Use appliedPdfSearch instead of debouncedSearchQuery
    (textItem: any) => highlightPattern(textItem.str, appliedPdfSearch),
    [appliedPdfSearch],
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    async function loadChat() {
      try {
        setLoading(true);
        const token = getAuthToken();
        const serverBase = getApiServerBase();

        const res = await fetch(
          `${serverBase}/api/analyze-files/chats/${chatId}`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          },
        );

        if (res.ok) {
          const data = await res.json();
          const chatData = data.chat || data.session;
          if (data.success && chatData) {
            setSession(chatData);

            const loadedFiles: ChatFileItem[] =
              chatData.files && chatData.files.length > 0
                ? chatData.files
                : [
                  {
                    originalFileName: chatData.originalFileName,
                    fileType: chatData.fileType,
                    fileUrl: chatData.fileUrl,
                    fileSize: chatData.fileSize,
                    rowCount: chatData.rowCount,
                    columnCount: chatData.columnCount,
                    columns: chatData.columns,
                    tableData: chatData.tableData || chatData.tabularPreview,
                    tabularPreview: chatData.tabularPreview,
                    sheetNames: chatData.sheetNames,
                    extractedText: chatData.extractedText,
                    visualImageUrls: chatData.visualImageUrls,
                    datasetCoverage: chatData.datasetCoverage,
                  },
                ];
            setFilesList(loadedFiles);
            setActiveFileIndex(0);

            const existingMessages = chatData.messages || [];
            setMessages(existingMessages);

            const formattedMessages = existingMessages.map((msg: any) => ({
              id: msg.id || msg._id || `${Date.now()}-${Math.random()}`,
              role: msg.role,
              content: msg.content || "",
            }));
            setCustomChatMessages(formattedMessages);

            if (existingMessages.length === 0 && !autoTriggeredRef.current) {
              autoTriggeredRef.current = true;
              const rawInitial = (chatData.initialPrompt || "").trim();
              const isGeneric =
                !rawInitial ||
                rawInitial.toLowerCase() === "analyze this file or data" ||
                rawInitial.toLowerCase() === "analyze this file";
              const promptToUse =
                !isGeneric && rawInitial
                  ? rawInitial
                  : loadedFiles.length > 1
                    ? `Analyze all ${loadedFiles.length} uploaded files and data thoroughly, covering every file in detail.`
                    : "Analyze this file or data";
              setTimeout(() => sendCustomChatMessage(promptToUse), 150);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load chat session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [chatId]);

  const activeFile: ChatFileItem | null =
    filesList[activeFileIndex] ||
    filesList[0] ||
    (session as any) ||
    null;

  const docName =
    activeFile?.originalFileName || session?.originalFileName || session?.title || "Uploaded File";
  const fileType = (
    activeFile?.fileType ||
    docName.split(".").pop() ||
    "csv"
  ).toLowerCase();
  const isImage = ["image", "jpg", "jpeg", "png", "webp", "gif"].includes(
    fileType,
  );

  // Load and parse all sheets for Excel files (.xlsx, .xls)
  useEffect(() => {
    const fileUrlToUse = activeFile?.fileUrl || session?.fileUrl;
    if (!fileUrlToUse) {
      setExcelSheets({});
      setExcelSheetNames([]);
      setActiveSheet("");
      return;
    }
    const fType = (
      activeFile?.fileType ||
      session?.fileType ||
      activeFile?.originalFileName?.split(".").pop() ||
      session?.originalFileName?.split(".").pop() ||
      ""
    ).toLowerCase();
    if (!["xlsx", "xls"].includes(fType)) {
      setExcelSheets({});
      setExcelSheetNames([]);
      setActiveSheet("");
      return;
    }

    // Pre-populate sheet names immediately from metadata if available
    const initialSheets =
      activeFile?.sheetNames && activeFile.sheetNames.length > 0
        ? activeFile.sheetNames
        : session?.sheetNames && session.sheetNames.length > 0
          ? session.sheetNames
          : [];

    if (initialSheets.length > 0) {
      setExcelSheetNames(initialSheets);
      setActiveSheet((prev) =>
        prev && initialSheets.includes(prev) ? prev : initialSheets[0],
      );
    }

    let isMounted = true;
    setExcelLoading(true);

    const fileDownloadUrl = fileUrlToUse.startsWith("http")
      ? fileUrlToUse
      : `${getApiServerBase()}${fileUrlToUse}`;

    Promise.all([
      fetch(fileDownloadUrl).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch excel file");
        return res.arrayBuffer();
      }),
      import("xlsx"),
    ])
      .then(([buffer, XLSX]) => {
        if (!isMounted) return;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetsMap: { [sheetName: string]: any[] } = {};

        workbook.SheetNames.forEach((sheetName: any) => {
          const worksheet = workbook.Sheets[sheetName];
          if (worksheet) {
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            sheetsMap[sheetName] = rawRows;
          }
        });

        setExcelSheets(sheetsMap);
        setExcelSheetNames(workbook.SheetNames);
        if (workbook.SheetNames.length > 0) {
          setActiveSheet((prev) =>
            prev && workbook.SheetNames.includes(prev)
              ? prev
              : workbook.SheetNames[0],
          );
        }
      })
      .catch((err) => {
        console.warn(
          "Could not parse excel workbook client-side, falling back to server preview:",
          err,
        );
      })
      .finally(() => {
        if (isMounted) setExcelLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeFile?.fileUrl,
    activeFile?.fileType,
    activeFile?.originalFileName,
    session?.fileUrl,
    session?.fileType,
    session?.originalFileName,
  ]);

  useEffect(() => {
    setPdfNumPages(null);
  }, [activeFile?.fileUrl, session?.fileUrl]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newRatio = Math.min(
        Math.max((currentX / rect.width) * 100, 20),
        80,
      );
      setSplitRatio(newRatio);
      setZoomLevel(Number((newRatio / 50).toFixed(2)));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const getSubtitle = () => {
    const sizeBytes = activeFile?.fileSize || session?.fileSize || 0;
    const sizeStr =
      sizeBytes > 0
        ? sizeBytes < 1024 * 1024
          ? ` • ${(sizeBytes / 1024).toFixed(1)} KB`
          : ` • ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : "";

    if (["csv", "xlsx", "xls"].includes(fileType)) {
      const rCount = activeFile?.rowCount || session?.rowCount || allRows.length || 0;
      const cCount = activeFile?.columnCount || session?.columnCount || columnsList.length || 0;
      return `${rCount} rows • ${cCount} cols${sizeStr}`;
    } else if (["json", "docx", "doc", "txt", "rtf"].includes(fileType)) {
      const text = activeFile?.extractedText || session?.extractedText || "";
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      return fileType === "json" && allRows.length
        ? `${allRows.length} records${sizeStr}`
        : `${wordCount} words${sizeStr}`;
    } else if (
      ["image", "jpg", "jpeg", "png", "webp", "gif"].includes(fileType)
    ) {
      return `Image${sizeStr}`;
    }

    // ✅ FIX: Use pdfNumPages dynamically for PDFs instead of hardcoding "1 page"
    if (fileType === "pdf") {
      return `${pdfNumPages || 1} pages${sizeStr}`;
    }

    return `1 page${sizeStr}`;
  };

  const getColumnLetter = (index: number) => {
    if (index < 26) return String.fromCharCode(65 + index);
    return `${String.fromCharCode(65 + Math.floor(index / 26) - 1)}${String.fromCharCode(65 + (index % 26))}`;
  };

  const renderBadgeIconForType = (type: string, isMini: boolean = false) => {
    const dim = isMini ? "w-4 h-4 rounded" : "w-8 h-8 rounded-[7px]";
    const iconDim = isMini ? "w-2.5 h-2.5" : "w-4 h-4";

    if (["csv", "xlsx", "xls"].includes(type)) {
      return (
        <div className={`${dim} bg-[#107C41] flex items-center justify-center text-white shrink-0 ${!isMini ? "shadow-[0_2px_8px_rgba(16,124,65,0.4)]" : ""}`}>
          <FileSpreadsheet className={iconDim} />
        </div>
      );
    }
    if (type === "json") {
      return (
        <div className={`${dim} bg-[#E37400] flex items-center justify-center text-white shrink-0 ${!isMini ? "shadow-[0_2px_8px_rgba(227,116,0,0.4)]" : ""}`}>
          <FileCode className={iconDim} />
        </div>
      );
    }
    if (["docx", "doc"].includes(type)) {
      return (
        <div className={`${dim} bg-[#2B579A] flex items-center justify-center text-white shrink-0 ${!isMini ? "shadow-[0_2px_8px_rgba(43,87,154,0.4)]" : ""}`}>
          <FileText className={iconDim} />
        </div>
      );
    }
    if (["image", "jpg", "jpeg", "png", "webp", "gif"].includes(type)) {
      return (
        <div className={`${dim} bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white shrink-0 ${!isMini ? "shadow-[0_2px_8px_rgba(139,92,246,0.4)]" : ""}`}>
          <ImageIcon className={iconDim} />
        </div>
      );
    }
    return (
      <div className={`${dim} bg-[#EF4444] flex items-center justify-center text-white shrink-0 ${!isMini ? "shadow-[0_2px_8px_rgba(239,68,68,0.4)]" : ""}`}>
        <FileText className={iconDim} />
      </div>
    );
  };

  const renderBadgeIcon = () => renderBadgeIconForType(fileType, false);

  const allRows = useMemo(() => {
    if (activeSheet && excelSheets[activeSheet]) {
      return excelSheets[activeSheet];
    }
    return activeFile?.tableData || activeFile?.tabularPreview || session?.tableData || [];
  }, [activeSheet, excelSheets, activeFile?.tableData, activeFile?.tabularPreview, session?.tableData]);

  const columnsList = useMemo(() => {
    if (allRows.length > 0 && allRows[0]) {
      return Object.keys(allRows[0]);
    }
    return activeFile?.columns || session?.columns || [];
  }, [allRows, activeFile?.columns, session?.columns]);

  const availableSheets = useMemo(() => {
    if (excelSheetNames.length > 0) return excelSheetNames;
    if (activeFile?.sheetNames && activeFile.sheetNames.length > 0)
      return activeFile.sheetNames;
    if (session?.sheetNames && session.sheetNames.length > 0)
      return session.sheetNames;
    return [];
  }, [excelSheetNames, activeFile?.sheetNames, session?.sheetNames]);

  const hasMultipleSheets =
    ["xlsx", "xls"].includes(fileType) && availableSheets.length > 1;

  const [matchCoords, setMatchCoords] = useState<
    { page: number; rIdx: number; cIdx: number }[]
  >([]);
  const [docMatchesCount, setDocMatchesCount] = useState(0);
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);
  const totalPages = 1;
  const displayedRows = allRows;

  const renderHighlightedText = (
    text: string,
    query: string,
    activeMatch: number | boolean = activeMatchIdx,
  ) => {
    if (!query.trim()) return text;
    const escapeRegExp = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    const parts = text.split(regex);
    let matchCounter = 0;

    return parts.map((part, i) => {
      if (regex.test(part)) {
        const thisIdx = matchCounter++;
        const isCurrentActive =
          typeof activeMatch === "boolean"
            ? activeMatch
            : thisIdx === activeMatch;
        return (
          <span
            key={i}
            id={`doc-highlight-${thisIdx}`}
            className={`${isCurrentActive ? "bg-[#FF9900] text-white shadow-md ring-2 ring-[#FF9900]" : "bg-[#FFEB3B] text-black"} font-bold px-0.5 rounded transition-all duration-150`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setMatchCoords((prev) => (prev.length === 0 ? prev : []));
      setDocMatchesCount(0);
      setActiveMatchIdx(0);
      return;
    }

    const query = debouncedSearchQuery.toLowerCase();

    if (["csv", "xlsx", "xls"].includes(fileType)) {
      const coords: { page: number; rIdx: number; cIdx: number }[] = [];
      allRows.forEach((row, rIdx) => {
        columnsList.forEach((col, cIdx) => {
          const val = String(row[col] ?? "").toLowerCase();
          if (val.includes(query)) {
            coords.push({
              page: 1, // <-- Ahya direct 1 muki do
              rIdx,
              cIdx,
            });
          }
        });
      });
      setMatchCoords(coords);
      setDocMatchesCount(coords.length);
      setActiveMatchIdx(0);
    } else if (session?.extractedText) {
      const escapeRegExp = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapeRegExp(query), "gi");
      const matches = session.extractedText.match(regex);
      setDocMatchesCount(matches ? matches.length : 0);
      setActiveMatchIdx(0);
    } else {
      setDocMatchesCount(0);
      setActiveMatchIdx(0);
    }
  }, [
    debouncedSearchQuery,
    allRows,
    columnsList,
    fileType,
    session?.extractedText,
  ]);

  useEffect(() => {
    if (fileType !== "pdf") return;
    const timer = setTimeout(
      () => setAppliedPdfSearch(searchQuery.trim()),
      600,
    );
    return () => clearTimeout(timer);
  }, [searchQuery, fileType]);

  const handleNextSearch = () => {
    if (["csv", "xlsx", "xls"].includes(fileType)) {
      if (matchCoords.length === 0) return;
      const nextIdx = (activeMatchIdx + 1) % matchCoords.length;
      setActiveMatchIdx(nextIdx);
      const match = matchCoords[nextIdx];
      if (currentPage !== match.page) setCurrentPage(match.page);
      setTimeout(() => {
        const el = document.getElementById(`cell-${match.rIdx}-${match.cIdx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (docMatchesCount > 0) {
      const nextIdx = (activeMatchIdx + 1) % docMatchesCount;
      setActiveMatchIdx(nextIdx);
      setTimeout(() => {
        const el = document.getElementById(
          fileType === "pdf"
            ? `pdf-match-${nextIdx}`
            : `doc-highlight-${nextIdx}`,
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  const handlePrevSearch = () => {
    if (["csv", "xlsx", "xls"].includes(fileType)) {
      if (matchCoords.length === 0) return;
      const prevIdx =
        (activeMatchIdx - 1 + matchCoords.length) % matchCoords.length;
      setActiveMatchIdx(prevIdx);
      const match = matchCoords[prevIdx];
      if (currentPage !== match.page) setCurrentPage(match.page);
      setTimeout(() => {
        const el = document.getElementById(`cell-${match.rIdx}-${match.cIdx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (docMatchesCount > 0) {
      const prevIdx = (activeMatchIdx - 1 + docMatchesCount) % docMatchesCount;
      setActiveMatchIdx(prevIdx);
      setTimeout(() => {
        const el = document.getElementById(
          fileType === "pdf"
            ? `pdf-match-${prevIdx}`
            : `doc-highlight-${prevIdx}`,
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  const handleDownload = async () => {
    try {
      const currentUrl = activeFile?.fileUrl || session?.fileUrl;
      const currentText = activeFile?.extractedText || session?.extractedText;
      if (currentUrl) {
        const url = currentUrl.startsWith("http")
          ? currentUrl
          : `${getApiServerBase()}${currentUrl}`;
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = docName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else if (allRows.length > 0) {
        const header = columnsList.join(",");
        const csvContent = [
          header,
          ...allRows.map((r) =>
            columnsList.map((c) => JSON.stringify(r[c] ?? "")).join(","),
          ),
        ].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = docName.endsWith(".csv") ? docName : `${docName}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (currentText) {
        const blob = new Blob([currentText], {
          type: "text/plain;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${docName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      const currentUrl = activeFile?.fileUrl || session?.fileUrl;
      if (currentUrl) {
        const url = currentUrl.startsWith("http")
          ? currentUrl
          : `${getApiServerBase()}${currentUrl}`;
        window.open(url, "_blank");
      }
    }
  };

  const customChatMessagesRef = useRef(customChatMessages);
  customChatMessagesRef.current = customChatMessages;
  const customChatLoadingRef = useRef(customChatLoading);
  customChatLoadingRef.current = customChatLoading;

  const sendCustomChatMessageRef = useRef<(promptText?: string) => Promise<void>>(async () => { });

  const sendCustomChatMessage = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? customChatInput).trim();
    if (!prompt || !chatId || customChatLoadingRef.current) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user" as const,
      content: prompt,
    };
    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: "assistant" as const,
      content: "",
    };
    const currentMsgs = customChatMessagesRef.current;
    const requestMessages = [...currentMsgs, userMessage];

    setCustomChatMessages([...requestMessages, assistantMessage]);
    setCustomChatInput("");
    setCustomChatLoading(true);

    try {
      const serverBase = getApiServerBase();
      const token = getAuthToken();
      const response = await fetch(
        `${serverBase}/api/analyze-files/chats/${chatId}/message?stream=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            prompt: { role: "user", content: prompt },
            messages: requestMessages.map(({ role, content }) => ({
              role,
              content,
            })),
            threadId: chatId,
          }),
        },
      );

      if (!response.ok) {
        let errMessage = `Request failed (${response.status})`;
        try {
          errMessage = (await response.json())?.message || errMessage;
        } catch (_) { }
        throw new Error(errMessage);
      }
      if (!response.body)
        throw new Error("The server returned no response stream.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        setCustomChatMessages((current) =>
          current.map((item) =>
            item.id === assistantMessage.id
              ? { ...item, content: fullResponse }
              : item,
          ),
        );
      }
      fullResponse += decoder.decode();
      setCustomChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, content: fullResponse.trim() }
            : item,
        ),
      );
    } catch (error: any) {
      setCustomChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? {
              ...item,
              content:
                error?.message ||
                "Sorry, something went wrong. Please try again.",
            }
            : item,
        ),
      );
    } finally {
      setCustomChatLoading(false);
    }
  };
  sendCustomChatMessageRef.current = sendCustomChatMessage;

  useEffect(() => {
    const handleThesysActionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Never trigger on chart overlays (Download, Share, Full View) or dialogs, nav, headers
      if (
        target.closest(
          ".chart-action-overlay, [role='dialog'], .crayon-modal, [class*='dialog'], nav, header"
        )
      ) {
        return;
      }

      // 2. Click must be inside a message or follow-up container
      const messageContainer = target.closest(
        ".c1-component-container, [data-c1-component], .openui-markdown-renderer, .openui-follow-up-block, .openui-follow-up-item"
      );

      // 3. Check if user clicked directly on an OpenUI follow-up item (Related Queries)
      const followUpItem = target.closest(".openui-follow-up-item, [data-followup], .followup-item");
      if (followUpItem) {
        e.preventDefault();
        e.stopPropagation();

        const textEl = followUpItem.querySelector(".openui-follow-up-item-text") || followUpItem;
        let queryText = textEl.textContent?.trim() || "";
        queryText = queryText.replace(/^[\+\-\s*•·›»\u2022\u25B6\u25BC]+/, "").trim();

        if (queryText && queryText.length > 5 && !customChatLoadingRef.current) {
          void sendCustomChatMessageRef.current(queryText);
        }
        return;
      }

      if (!messageContainer) return;

      // 4. Find if user clicked a suggestion button, link, or bullet item
      const clickable = target.closest("button, [role='button'], a, li");
      if (!clickable) return;

      // Strictly ignore:
      // - Accordion headers / expansion controls
      // - Filter tabs / category pills / pagination / table controls
      // - Chart overlays / close buttons
      if (
        clickable.hasAttribute("aria-expanded") ||
        clickable.hasAttribute("data-radix-collection-item") ||
        clickable.classList.contains("openui-accordion-trigger") ||
        clickable.getAttribute("role") === "tab" ||
        clickable.getAttribute("role") === "tablist" ||
        clickable.classList.contains("close-btn") ||
        clickable.closest("[data-state='closed']") ||
        clickable.closest("table, thead, tbody, [role='table']")
      ) {
        return;
      }

      // Check if inside a Related Queries container or accordion content
      const isInsideRelatedQueries = Boolean(
        clickable.closest(".openui-follow-up-block, .related-query, .thesys-action-btn") ||
        clickable.closest("[class*='accordion-content'], [data-state='open']") ||
        clickable.closest("section, div")?.textContent?.includes("Related Queries") ||
        clickable.closest("section, div")?.textContent?.includes("Related Questions")
      );

      // Extract prompt text
      let actionText =
        clickable.getAttribute("data-prompt") ||
        clickable.getAttribute("data-action") ||
        clickable.textContent?.trim() ||
        "";

      actionText = actionText.replace(/^[\+\-\s*•·›»\u2022\u25B6\u25BC]+/, "").trim();

      // Ensure it is ONLY submitted if it's within Related Queries / Follow-up suggestions
      // OR it's an actual analytical question
      const isActualQuestion =
        actionText.endsWith("?") ||
        /^(how|what|why|can|are|is|show|compare|analyze|explain|which|where|when|could|would)\b/i.test(actionText);

      if (
        (isInsideRelatedQueries || isActualQuestion) &&
        actionText.length > 8 &&
        actionText.length < 160 &&
        !["Download", "Share", "Full View", "PNG Image", "PDF Document", "PPT (Slide)"].includes(actionText) &&
        !actionText.toLowerCase().includes("related quer") &&
        !actionText.toLowerCase().includes("key driver") &&
        !actionText.toLowerCase().includes("channel breakdown")
      ) {
        if (clickable.tagName === "A" || clickable.getAttribute("role") === "button") {
          e.preventDefault();
        }
        if (!customChatLoadingRef.current) {
          void sendCustomChatMessageRef.current(actionText);
        }
      }
    };

    window.addEventListener("click", handleThesysActionClick, true);
    return () => {
      window.removeEventListener("click", handleThesysActionClick, true);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070914] text-slate-100 overflow-hidden font-sans select-text">
      <header className="h-16 px-3.5 md:px-5 flex items-center justify-between bg-[#0F1123] border-b border-[#1E223D] shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              window.history.length > 1
                ? router.back()
                : (window.location.href = "/analyze");
            }}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-[13px] font-semibold hover:bg-[#322774] transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Analyze</span>
            <span className="sm:hidden">Back</span>
          </button>
          {renderBadgeIcon()}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] md:text-[14.5px] font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {docName}
            </h1>
            <span className="text-[11px] md:text-[11.5px] text-[#8E95AF] font-medium">
              {getSubtitle()}
            </span>
          </div>
        </div>

        {!isMobile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode(viewMode === "split" ? "chatOnly" : "split");
                setSplitRatio(50);
              }}
              className={`cursor-pointer p-2 rounded-lg border transition ${viewMode === "split" ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]" : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"}`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === "docOnly" ? "split" : "docOnly")
              }
              className={`cursor-pointer p-2 rounded-lg border transition ${viewMode === "docOnly" ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]" : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"}`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {isMobile && (
        <div className="bg-[#090A14] px-4 py-2 shrink-0 border-b border-[#1E223D]">
          <div className="flex rounded-xl bg-[#121424] border border-[#222642] p-1">
            <button
              onClick={() => setMobileTab("doc")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${mobileTab === "doc" ? "bg-[#6C56E5] text-white shadow-md" : "text-[#8E95AF] hover:text-white"}`}
            >
              <FileText className="w-4 h-4" /> Document
            </button>
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${mobileTab === "chat" ? "bg-[#6C56E5] text-white shadow-md" : "text-[#8E95AF] hover:text-white"}`}
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
          (viewMode !== "chatOnly" || isMobile) && (
            <div
              style={{
                width: isMobile
                  ? "100%"
                  : viewMode === "docOnly"
                    ? "100%"
                    : `${splitRatio}%`,
              }}
              className="relative flex flex-col bg-[#0B0E1A] border-r border-[#1E223D] overflow-hidden h-full"
            >
              {/* File Tabs Bar: shown when multiple files are uploaded (or single file) */}
              {filesList.length > 0 && (
                <div className="h-11 bg-[#0F1123] border-b border-[#1E223D] px-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 z-20 select-none">
                  <div className="flex items-center gap-1.5 pr-2 border-r border-[#1E223D] shrink-0">
                    <span className="text-[11px] font-bold text-[#8E95AF] uppercase tracking-wider">
                      Files ({filesList.length})
                    </span>
                  </div>
                  {filesList.map((fItem, idx) => {
                    const isActive = idx === activeFileIndex;
                    const fExt = (
                      fItem.fileType ||
                      fItem.originalFileName?.split(".").pop() ||
                      "pdf"
                    ).toLowerCase();
                    return (
                      <button
                        key={`${fItem.originalFileName}-${idx}`}
                        onClick={() => {
                          setActiveFileIndex(idx);
                          setCurrentPage(1);
                          setSearchQuery("");
                          setAppliedPdfSearch("");
                          if (fItem.sheetNames && fItem.sheetNames.length > 0) {
                            setExcelSheetNames(fItem.sheetNames);
                            setActiveSheet(fItem.sheetNames[0]);
                          } else {
                            setExcelSheetNames([]);
                            setActiveSheet("");
                          }
                          setExcelSheets({});
                        }}
                        title={fItem.originalFileName}
                        className={`cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 border ${isActive
                          ? "bg-[#261D5A] border-[#635BFF] text-white shadow-sm ring-1 ring-[#635BFF]/30 font-semibold"
                          : "bg-[#131629] border-[#222642] text-[#8E95AF] hover:text-white hover:bg-[#1A1E38]"
                          }`}
                      >
                        {renderBadgeIconForType(fExt, true)}
                        <span className="max-w-[130px] sm:max-w-[170px] truncate">
                          {fItem.originalFileName}
                        </span>
                        {fItem.rowCount ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive
                              ? "bg-white/15 text-white"
                              : "bg-[#1C2038] text-[#8E95AF]"
                              }`}
                          >
                            {fItem.rowCount}r
                          </span>
                        ) : fItem.pageCount && fItem.pageCount > 1 ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive
                              ? "bg-white/15 text-white"
                              : "bg-[#1C2038] text-[#8E95AF]"
                              }`}
                          >
                            {fItem.pageCount}p
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {loading ? (
                <div className="flex h-full items-center justify-center flex-col gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                  <span className="text-xs font-medium">
                    Loading document preview...
                  </span>
                </div>
              ) : ["csv", "xlsx", "xls"].includes(fileType) &&
                allRows.length > 0 ? (
                <div className="flex flex-col flex-1 min-h-0 bg-white text-slate-800">
                  <div className="h-10 bg-[#F3F2F1] border-b border-[#D4D4D4] px-3.5 flex items-center gap-3 shrink-0">
                    <div className="px-2 py-0.5 rounded bg-[#107C41] text-white text-[11px] font-bold tracking-wider flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" /> EXCEL
                    </div>
                    <div className="h-7 flex-1 bg-white border border-[#D4D4D4] rounded px-2.5 flex items-center gap-2 text-xs">
                      <span className="italic font-bold text-[#107C41]">
                        fx
                      </span>
                      <span className="w-[1px] h-3.5 bg-[#D4D4D4]" />
                      <span className="text-[#323130] text-[11px] font-medium truncate">
                        {columnsList.length} Columns • {allRows.length} Rows{" "}
                        {searchQuery ? `(${matchCoords.length} matched)` : ""}
                      </span>
                    </div>
                  </div>

                  {(activeFile?.datasetCoverage || session?.datasetCoverage) &&
                    (activeFile?.datasetCoverage || session?.datasetCoverage)
                      ?.isComplete === false && (
                      <div className="bg-[#FFF4CE] border-b border-[#FDE79E] text-[#797673] px-3.5 py-1.5 text-[11.5px] flex items-center justify-between shrink-0">
                        <span className="font-medium text-[#323130]">
                          ⚠️ Partial Dataset: Displaying and analyzing the first{" "}
                          <strong>
                            {(
                              activeFile?.datasetCoverage ||
                              session?.datasetCoverage
                            )?.analyzedRows?.toLocaleString()}
                          </strong>{" "}
                          of{" "}
                          <strong>
                            {(
                              activeFile?.datasetCoverage ||
                              session?.datasetCoverage
                            )?.totalRows?.toLocaleString()}
                          </strong>{" "}
                          rows due to system performance limits.
                        </span>
                      </div>
                    )}

                  <div className="flex-1 overflow-auto">
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "top left",
                        transition: isDragging
                          ? "none"
                          : "transform 0.15s ease-out",
                      }}
                    >
                      <table className="w-full border-collapse text-xs select-text">
                        <thead>
                          <tr className="bg-[#F2F2F2] sticky top-0 z-10 border-b border-[#D4D4D4]">
                            <th className="w-12 px-2 py-2 text-center font-bold text-[#605E5C] bg-[#F2F2F2] border-r border-[#D4D4D4]">
                              #
                            </th>
                            {columnsList.map((col, idx) => (
                              <th
                                key={idx}
                                className="px-3 py-2 text-left border-r border-[#D4D4D4] whitespace-nowrap bg-[#F2F2F2]"
                              >
                                <div className="text-[11px] font-extrabold text-[#107C41]">
                                  {getColumnLetter(idx)}
                                </div>
                                <div className="text-[12px] font-bold text-[#201F1E]">
                                  {col}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {displayedRows.map((row, rIdx) => {
                            const originalIdx = rIdx + 1;
                            const globalRowIdx = rIdx;
                            return (
                              <tr
                                key={rIdx}
                                className="hover:bg-[#EBF1F5] border-b border-[#D4D4D4]"
                              >
                                <td className="px-2 py-1.5 text-center font-mono text-[11px] text-[#605E5C] bg-[#F8F8F8] border-r border-[#D4D4D4]">
                                  {originalIdx}
                                </td>
                                {columnsList.map((col, cIdx) => {
                                  const isMatchActive =
                                    matchCoords.length > 0 &&
                                    matchCoords[activeMatchIdx]?.rIdx ===
                                    globalRowIdx &&
                                    matchCoords[activeMatchIdx]?.cIdx === cIdx;
                                  return (
                                    <td
                                      key={cIdx}
                                      id={`cell-${globalRowIdx}-${cIdx}`}
                                      className="px-3 py-1.5 text-slate-800 border-r border-[#D4D4D4] whitespace-nowrap max-w-[240px] truncate font-normal"
                                    >
                                      {renderHighlightedText(
                                        String(row[col] ?? ""),
                                        debouncedSearchQuery,
                                        isMatchActive,
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {hasMultipleSheets && (
                    <div className="h-9 bg-[#F3F2F1] border-t border-[#D4D4D4] px-2 flex items-center justify-between shrink-0 text-xs overflow-x-auto relative z-20">
                      <div className="flex items-center gap-1 overflow-x-auto py-1">
                        {availableSheets.map((sName) => (
                          <button
                            key={sName}
                            onClick={() => {
                              setActiveSheet(sName);
                              setCurrentPage(1);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold transition rounded-t-sm cursor-pointer border-t border-x border-[#D4D4D4] shrink-0 ${activeSheet === sName
                              ? "bg-white text-[#107C41] border-b-2 border-b-[#107C41] shadow-xs font-extrabold"
                              : "bg-[#E1DFDD] text-[#605E5C] hover:bg-white/70 border-b border-b-[#D4D4D4]"
                              }`}
                          >
                            <FileSpreadsheet className="w-3 h-3" />
                            <span>{sName}</span>
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-[#605E5C] shrink-0 pl-2 font-medium">
                        {excelLoading ? (
                          <span className="flex items-center gap-1 text-[#107C41]">
                            <Loader2 className="w-3 h-3 animate-spin" /> Loading sheets...
                          </span>
                        ) : (
                          `${allRows.length} rows loaded`
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : ["image", "jpg", "jpeg", "png", "webp"].includes(fileType) ? (
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#0B0E1A]">
                  {(activeFile?.visualImageUrls?.length || session?.visualImageUrls?.length) ? (
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        transition: isDragging
                          ? "none"
                          : "transform 0.15s ease-out",
                      }}
                      className="max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={activeFile?.visualImageUrls?.[0] || session?.visualImageUrls?.[0]}
                        alt={docName}
                        className="max-h-[80vh] w-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (activeFile?.fileUrl || session?.fileUrl) ? (
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                        transition: isDragging
                          ? "none"
                          : "transform 0.15s ease-out",
                      }}
                      className="max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={
                          (activeFile?.fileUrl || session?.fileUrl || "").startsWith("http")
                            ? (activeFile?.fileUrl || session?.fileUrl)
                            : `${getApiServerBase()}${activeFile?.fileUrl || session?.fileUrl}`
                        }
                        alt={docName}
                        className="max-h-[80vh] w-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">
                      Image preview not available
                    </div>
                  )}
                </div>
              ) : fileType === "pdf" && (activeFile?.fileUrl || session?.fileUrl) ? (
                <div className="flex-1 h-full w-full bg-[#1A1D2E] relative flex flex-col items-center overflow-auto py-8">
                  <Document
                    file={
                      (activeFile?.fileUrl || session?.fileUrl || "").startsWith("http")
                        ? (activeFile?.fileUrl || session?.fileUrl)
                        : `${getApiServerBase()}${activeFile?.fileUrl || session?.fileUrl}`
                    }
                    onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                    onLoadError={(err) => {
                      console.error("PDF load error:", err);
                      setPdfNumPages(0);
                    }}
                    loading={
                      <div className="text-white text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading
                        PDF...
                      </div>
                    }
                  >
                    {/* Map through all pages and render them vertically */}
                    {pdfNumPages && pdfNumPages > 0 ? (
                      Array.from(new Array(pdfNumPages), (el, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          scale={zoomLevel}
                          customTextRenderer={customTextRenderer}
                          className="shadow-2xl rounded-md overflow-hidden mb-8" // mb-8 creates spacing between pages
                        />
                      ))
                    ) : null}
                  </Document>
                </div>
              ) : (
                <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#0B0E1A] flex justify-center items-start">
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
                      {(activeFile?.extractedText || session?.extractedText) ? (
                        debouncedSearchQuery.trim() ? (
                          renderHighlightedText(
                            activeFile?.extractedText || session?.extractedText || "",
                            debouncedSearchQuery.trim(),
                          )
                        ) : (
                          activeFile?.extractedText || session?.extractedText
                        )
                      ) : (
                        <div className="text-slate-400 italic text-center py-12">
                          No text preview available for this document.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isImage && isSearchOpen && (
                <div className="absolute bottom-20 inset-x-0 flex justify-center pointer-events-none z-50">
                  <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-[#121424] border border-[#292D49] px-4 py-2 shadow-2xl">
                    <Search className="w-4 h-4 text-[#A78BFA]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (fileType === "pdf")
                            setAppliedPdfSearch(searchQuery.trim());
                          e.shiftKey ? handlePrevSearch() : handleNextSearch();
                        }
                      }}
                      placeholder="Search in document..."
                      className="bg-transparent text-white text-sm outline-none w-36 placeholder:text-slate-500 cursor-text"
                      autoFocus
                    />
                    <div className="flex items-center gap-3 text-slate-400 border-l border-[#292D49] pl-4 ml-1">
                      <ChevronLeft
                        onClick={handlePrevSearch}
                        className="w-4 h-4 cursor-pointer hover:text-white transition"
                      />
                      <span className="text-xs font-medium">
                        {searchQuery.trim()
                          ? ["csv", "xlsx", "xls"].includes(fileType)
                            ? matchCoords.length > 0
                              ? `${activeMatchIdx + 1} / ${matchCoords.length}`
                              : "0 / 0"
                            : docMatchesCount > 0
                              ? `${activeMatchIdx + 1} / ${docMatchesCount}`
                              : "0 / 0"
                          : "0 / 0"}
                      </span>
                      <ChevronRight
                        onClick={handleNextSearch}
                        className="w-4 h-4 cursor-pointer hover:text-white transition"
                      />
                      <X
                        className="w-4 h-4 cursor-pointer hover:text-white ml-2 transition"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`absolute ${hasMultipleSheets ? "bottom-16" : "bottom-5"} inset-x-0 flex justify-center pointer-events-none z-10`}
              >
                <div className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0C101E]/95 border border-[#1E2640] shadow-[0_8px_24px_rgba(0,0,0,0.65)] backdrop-blur-md text-white text-xs font-medium">
                  <button
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.max(0.5, Number((z - 0.15).toFixed(2))),
                      )
                    }
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Fit to Page"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.min(2.0, Number((z + 0.15).toFixed(2))),
                      )
                    }
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />
                  {fileType !== "pdf" && (
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
                      title="Previous"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="px-1 text-[11.5px] font-semibold text-white">
                    {fileType === "pdf"
                      ? `${pdfNumPages || 1} pages`
                      : ["csv", "xlsx", "xls"].includes(fileType)
                        ? `${allRows.length} rows`
                        : "1 page"}
                  </span>
                  {fileType !== "pdf" && (
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
                      title="Next"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />
                  <button
                    onClick={handleDownload}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {!isImage && (
                    <button
                      onClick={() => {
                        setIsSearchOpen(!isSearchOpen);
                        if (!isSearchOpen)
                          setTimeout(
                            () => searchInputRef.current?.focus(),
                            100,
                          );
                      }}
                      className={`cursor-pointer p-1.5 rounded-full transition ${isSearchOpen ? "bg-[#6C56E5]/40 text-[#A78BFA]" : "hover:bg-white/10 text-slate-300"}`}
                      title="Search in Document"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        {!isMobile && viewMode === "split" && (
          <div
            onMouseDown={handleMouseDown}
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
          (viewMode !== "docOnly" || isMobile) && (
            <div
              style={{
                width: isMobile
                  ? "100%"
                  : viewMode === "chatOnly"
                    ? "100%"
                    : `${100 - splitRatio}%`,
              }}
              className="flex flex-col bg-[#070914] overflow-hidden h-full relative"
            >
              {chatId ? (
                <div className="flex h-full min-h-0 w-full flex-col bg-[#070914] text-white">
                  <div className="flex items-center gap-3 border-b border-[#1E223D] px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C56E5]/20">
                      <Sparkles className="h-5 w-5 text-[#A78BFA]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold">OneChat AI</h2>
                      <p className="truncate text-xs text-slate-400">
                        {filesList.length > 1
                          ? `Ask anything about all ${filesList.length} files (${filesList.map((f) => f.originalFileName).join(", ")})`
                          : `Ask anything about ${docName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
                    {customChatMessages.length === 0 && (
                      <div className="mx-auto mt-10 max-w-lg text-center">
                        <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#8B7AFF]" />
                        <h3 className="text-lg font-semibold">
                          What would you like to explore?
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Ask questions, analyze trends, or create an integrated report across your {filesList.length > 1 ? `${filesList.length} files` : "file"}.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          {(filesList.length > 1
                            ? [
                              `Analyze all ${filesList.length} files`,
                              "Compare across files",
                              "Create integrated dashboard",
                              "Cross-file summary report",
                            ]
                            : [
                              "Analyze trends",
                              "Create a dashboard",
                              "Generate a report",
                              "Create slides",
                            ]
                          ).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() =>
                                void sendCustomChatMessage(suggestion)
                              }
                              className="rounded-full border border-[#292D49] px-3 py-2 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {customChatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={
                          message.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >
                        {message.role === "user" ? (
                          <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#6C56E5] px-4 py-3 text-sm text-white">
                            {message.content}
                          </div>
                        ) : (
                          <div className="w-full min-w-0 max-w-full overflow-x-auto">
                            {message.content.startsWith("[Error:") ||
                              message.content.startsWith("Error:") ||
                              message.content.includes(
                                "failed to serve this request",
                              ) ||
                              message.content.includes("Request failed") ? (
                              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-200">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                                <div>
                                  <div className="font-semibold text-red-300">
                                    AI Service Notice
                                  </div>
                                  <div className="mt-1 text-xs text-red-200/90 leading-relaxed">
                                    {message.content.replace(
                                      /^\[Error:\s*\vert{}\s*\]$/g,
                                      "",
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : message.content.trim().length > 0 ? (
                              <C1MessageItem
                                message={message}
                                chatId={chatId as string}
                                isStreaming={
                                  customChatLoading &&
                                  customChatMessages[
                                    customChatMessages.length - 1
                                  ]?.id === message.id
                                }
                                apiBaseUrl={getApiServerBase()}
                                authToken={getAuthToken()}
                              />
                            ) : customChatLoading ? (
                              <div className="flex w-fit items-center gap-3 rounded-full border border-[#292D49] bg-[#121424] px-4 py-2.5 text-sm text-[#A78BFA]">
                                <Loader2 className="h-4 w-4 animate-spin text-[#6C56E5]" />
                                Reading document & preparing answer...
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#1E223D] bg-[#070914] p-4 sm:px-6">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void sendCustomChatMessage();
                      }}
                      className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-[#292D49] bg-[#0C1020] px-4 py-3 focus-within:border-[#7564F6]"
                    >
                      <input
                        type="text"
                        value={customChatInput}
                        onChange={(event) =>
                          setCustomChatInput(event.target.value)
                        }
                        placeholder={
                          customChatLoading
                            ? "Generating answer..."
                            : filesList.length > 1
                              ? `Ask anything about all ${filesList.length} files or a specific file...`
                              : "Ask anything about your file..."
                        }
                        disabled={customChatLoading || !chatId}
                        className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50 cursor-text"
                      />
                      <button
                        type="submit"
                        disabled={
                          !customChatInput.trim() ||
                          customChatLoading ||
                          !chatId
                        }
                        className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full bg-[#6C56E5] text-white transition hover:bg-[#7965F0] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                    </form>
                    <p className="mt-2 text-center text-[11px] text-slate-500">
                      OneChat AI can make mistakes. Check important information.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                  No active session found.
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
