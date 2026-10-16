// "use client";

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   FileText,
//   Sparkles,
//   ArrowLeft,
//   Columns,
//   Maximize2,
//   Paperclip,
//   Mic,
//   ArrowUp,
//   Copy,
//   Check,
//   Search,
//   ZoomIn,
//   ZoomOut,
//   Download,
//   FileSpreadsheet,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Maximize,
//   Menu,
//   X,
// } from "lucide-react";
// import dynamic from "next/dynamic";
// import "@crayonai/react-ui/styles/index.css";

// const C1Chat = dynamic(
//   () => import("@thesysai/genui-sdk").then((mod) => mod.C1Chat),
//   { ssr: false },
// );

// interface Message {
//   role: "user" | "assistant";
//   content: string;
//   charts?: any[];
//   thesysMetadata?: any;
//   toolType?: "analyze" | "report" | "dashboard" | "slides";
//   createdAt?: string;
// }

// interface ChatSession {
//   _id: string;
//   title: string;
//   originalFileName: string;
//   fileType: string;
//   fileUrl?: string;
//   fileSize?: number;
//   rowCount?: number;
//   columnCount?: number;
//   columns?: string[];
//   tableData?: any[];
//   tabularPreview?: any[];
//   extractedText?: string;
//   visualImageUrls?: string[];
//   initialPrompt?: string;
//   messages: Message[];
// }

// function getApiServerBase(): string {
//   // If explicitly configured in env
//   const envBase =
//     process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
//   if (envBase) {
//     // Strip trailing /api if present to get root server origin
//     return envBase.replace(/\/api\/?$/, "");
//   }
//   if (typeof window !== "undefined") {
//     const host = window.location.hostname;
//     if (host === "localhost" || host === "127.0.0.1") {
//       return "http://localhost:5000";
//     }
//     // In production, use main API domain
//     return "https://api.onechatai.ai";
//   }
//   return "https://api.onechatai.ai";
// }

// function getAuthToken(): string {
//   if (typeof window === "undefined") return "";

//   // 0. Check URL search param (when redirected from Flutter web)
//   try {
//     const searchParams = new URLSearchParams(window.location.search);
//     const urlToken = searchParams.get("token");
//     if (urlToken && urlToken.trim().length > 10) {
//       localStorage.setItem(
//         "flutter.user_token",
//         JSON.stringify(urlToken.trim()),
//       );
//       return urlToken.trim();
//     }
//   } catch (_) {}

//   // 1. Direct LocalStorage Checks (Common keys & Flutter prefix)
//   const candidateKeys = [
//     "flutter.user_token",
//     "token",
//     "authToken",
//     "user_token",
//     "flutter.token",
//     "accessToken",
//   ];

//   for (const key of candidateKeys) {
//     const val = localStorage.getItem(key);
//     if (val && val !== "null" && val !== "undefined") {
//       try {
//         const parsed = JSON.parse(val);
//         if (typeof parsed === "string" && parsed.length > 10) return parsed;
//       } catch (_) {
//         const cleaned = val.replace(/^"+|"+$/g, "").trim();
//         if (cleaned.length > 10) return cleaned;
//       }
//     }
//   }

//   // 2. Direct Cookie Checks (If stored in document.cookie from Flutter or Auth system)
//   if (typeof document !== "undefined" && document.cookie) {
//     const match = document.cookie.match(
//       /(?:^|;\s*)(?:token|user_token|FBSESSION)=([^;]+)/,
//     );
//     if (match && match[1]) {
//       try {
//         return decodeURIComponent(match[1]);
//       } catch (_) {
//         return match[1];
//       }
//     }
//   }

//   return "";
// }

// function getStoredUserId(): string {
//   if (typeof window === "undefined") return "";
//   const candidateKeys = ["flutter.user_id", "user_id", "userId", "id"];
//   for (const key of candidateKeys) {
//     const val = localStorage.getItem(key);
//     if (val && val !== "null" && val !== "undefined") {
//       try {
//         return JSON.parse(val);
//       } catch (_) {
//         return val.replace(/^"+|"+$/g, "").trim();
//       }
//     }
//   }
//   return "";
// }

// export default function AnalyzeChatNextPage() {
//   const params = useParams();
//   const router = useRouter();
//   const chatId = params?.chatId as string;

//   const [session, setSession] = useState<ChatSession | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputPrompt, setInputPrompt] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [splitRatio, setSplitRatio] = useState(50);
//   const [isDragging, setIsDragging] = useState(false);
//   const [viewMode, setViewMode] = useState<"split" | "docOnly" | "chatOnly">(
//     "split",
//   );
//   const [mobileTab, setMobileTab] = useState<"doc" | "chat">("chat");
//   const [isMobile, setIsMobile] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(1.0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const containerRef = useRef<HTMLDivElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   // Detect mobile width reliably (< 1024px matching Flutter)
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, sending]);

//   // Clean URL if any leftover query parameter (like ?prompt=...) exists
//   useEffect(() => {
//     if (typeof window !== "undefined" && window.location.search) {
//       const cleanPath = window.location.pathname;
//       window.history.replaceState(null, "", cleanPath);
//     }
//   }, []);

//   const autoTriggeredRef = useRef(false);

//   // Load chat session from Node backend
//   useEffect(() => {
//     if (!chatId) return;

//     async function loadChat() {
//       try {
//         setLoading(true);
//         const token = getAuthToken();
//         const serverBase = getApiServerBase();

//         const res = await fetch(
//           `${serverBase}/api/analyze-files/chats/${chatId}`,
//           {
//             headers: {
//               Authorization: token ? `Bearer ${token}` : "",
//             },
//           },
//         );

//         if (res.ok) {
//           const data = await res.json();
//           const chatData = data.chat || data.session;
//           if (data.success && chatData) {
//             setSession(chatData);
//             const existingMessages = chatData.messages || [];
//             setMessages(existingMessages);

//             // Auto-trigger analysis if this is a newly created session with no messages yet
//             if (existingMessages.length === 0 && !autoTriggeredRef.current) {
//               autoTriggeredRef.current = true;
//               const promptToUse =
//                 chatData.initialPrompt && chatData.initialPrompt.trim().length > 0
//                   ? chatData.initialPrompt.trim()
//                   : "Analyze this file or data";

//               // Small delay to allow initial session state render
//               setTimeout(() => {
//                 handleSendMessage(promptToUse);
//               }, 150);
//             }
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load chat session:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadChat();
//   }, [chatId]);

//   // Draggable Split Divider Handlers
//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       if (!isDragging || !containerRef.current) return;
//       const rect = containerRef.current.getBoundingClientRect();
//       const currentX = e.clientX - rect.left;
//       const newRatio = (currentX / rect.width) * 100;
//       setSplitRatio(Math.min(Math.max(newRatio, 20), 80));
//     };

//     const handleMouseUp = () => {
//       setIsDragging(false);
//     };

//     if (isDragging) {
//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//     }
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [isDragging]);

//   const handleSendMessage = async (customPrompt?: string) => {
//     const textToSend = customPrompt || inputPrompt;
//     if (!textToSend.trim() || sending || !chatId) return;

//     setInputPrompt("");
//     setSending(true);

//     const timeString = new Date().toLocaleTimeString([], {
//       hour: "numeric",
//       minute: "2-digit",
//     });

//     const userMessage: Message = {
//       role: "user",
//       content: textToSend.trim(),
//       createdAt: timeString,
//     };

//     const assistantPlaceholder: Message = {
//       role: "assistant",
//       content: "",
//       createdAt: timeString,
//     };

//     setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);

//     try {
//       const token = getAuthToken();
//       const serverBase = getApiServerBase();

//       const response = await fetch(
//         `${serverBase}/api/analyze-files/chats/${chatId}/message?stream=true`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: token ? `Bearer ${token}` : "",
//           },
//           body: JSON.stringify({
//             prompt: textToSend,
//           }),
//         },
//       );

//       if (!response.ok) {
//         throw new Error("Failed to send message");
//       }

//       const reader = response.body?.getReader();
//       const decoder = new TextDecoder();
//       let assistantText = "";
//       let charts: any[] = [];
//       let thesysMeta: any = null;

//       if (reader) {
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           const lines = chunk.split("\n");

//           for (const line of lines) {
//             if (line.startsWith("data: ")) {
//               const dataStr = line.replace("data: ", "").trim();
//               if (dataStr === "[DONE]") continue;

//               try {
//                 const parsed = JSON.parse(dataStr);
//                 if (parsed.type === "done" && parsed.charts) {
//                   charts = parsed.charts;
//                   if (charts.length > 0 && charts[0].thesysMetadata) {
//                     thesysMeta = charts[0].thesysMetadata;
//                   }
//                 }
//                 if (parsed.content) {
//                   assistantText += parsed.content;
//                 }
//                 if (parsed.charts) {
//                   charts = parsed.charts;
//                 }
//                 if (parsed.thesys) {
//                   thesysMeta = parsed.thesys;
//                 }

//                 setMessages((prev) => {
//                   const updated = [...prev];
//                   const lastIdx = updated.length - 1;
//                   if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
//                     updated[lastIdx] = {
//                       ...updated[lastIdx],
//                       content: assistantText,
//                       charts:
//                         charts.length > 0 ? charts : updated[lastIdx].charts,
//                       thesysMetadata:
//                         thesysMeta || updated[lastIdx].thesysMetadata,
//                     };
//                   }
//                   return updated;
//                 });
//               } catch (_) {}
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Send message error:", error);
//       setMessages((prev) => {
//         const updated = [...prev];
//         const lastIdx = updated.length - 1;
//         if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
//           updated[lastIdx] = {
//             ...updated[lastIdx],
//             content:
//               "Sorry, could not process your query at this moment. Please check server logs.",
//           };
//         }
//         return updated;
//       });
//     } finally {
//       setSending(false);
//     }
//   };

//   const copyToClipboard = (text: string, idx: number) => {
//     navigator.clipboard.writeText(text);
//     setCopiedIdx(idx);
//     setTimeout(() => setCopiedIdx(null), 2000);
//   };

//   const docName =
//     session?.originalFileName || session?.title || "Uploaded File";
//   const fileType = (session?.fileType || "csv").toLowerCase();

//   const getSubtitle = () => {
//     const sizeBytes = session?.fileSize || 0;
//     let sizeStr = "";
//     if (sizeBytes > 0) {
//       sizeStr =
//         sizeBytes < 1024 * 1024
//           ? ` • ${(sizeBytes / 1024).toFixed(1)} KB`
//           : ` • ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
//     }

//     if (["csv", "xlsx", "xls"].includes(fileType)) {
//       const rows = session?.rowCount || session?.tableData?.length || 0;
//       const cols = session?.columnCount || session?.columns?.length || 0;
//       return `${rows} rows • ${cols} cols${sizeStr}`;
//     } else if (["docx", "doc", "txt", "rtf"].includes(fileType)) {
//       const text = session?.extractedText || "";
//       const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
//       return `${wordCount} words${sizeStr}`;
//     }
//     return `1 page${sizeStr}`;
//   };

//   const getColumnLetter = (index: number) => {
//     if (index < 26) return String.fromCharCode(65 + index);
//     return `${String.fromCharCode(65 + Math.floor(index / 26) - 1)}${String.fromCharCode(65 + (index % 26))}`;
//   };

//   const renderBadgeIcon = () => {
//     if (["csv", "xlsx", "xls"].includes(fileType)) {
//       return (
//         <div className="w-8 h-8 rounded-[7px] bg-[#107C41] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,124,65,0.4)] shrink-0">
//           <FileSpreadsheet className="w-4 h-4" />
//         </div>
//       );
//     }
//     if (["docx", "doc"].includes(fileType)) {
//       return (
//         <div className="w-8 h-8 rounded-[7px] bg-[#2B579A] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(43,87,154,0.4)] shrink-0">
//           <FileText className="w-4 h-4" />
//         </div>
//       );
//     }
//     return (
//       <div className="w-8 h-8 rounded-[7px] bg-[#EF4444] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(239,68,68,0.4)] shrink-0">
//         <FileText className="w-4 h-4" />
//       </div>
//     );
//   };

//   const columnsList =
//     session?.columns ||
//     (session?.tableData?.[0] ? Object.keys(session.tableData[0]) : []);
//   const allRows = session?.tableData || [];

//   // Filter rows if search query is provided
//   const filteredRows = searchQuery.trim()
//     ? allRows.filter((row) =>
//         Object.values(row).some((val) =>
//           String(val).toLowerCase().includes(searchQuery.trim().toLowerCase()),
//         ),
//       )
//     : allRows;

//   // Pagination support (50 rows per page if large)
//   const rowsPerPage = 50;
//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
//   const displayedRows = filteredRows.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage,
//   );

//   // File Download handler
//   const handleDownload = () => {
//     if (session?.fileUrl) {
//       const serverBase = getApiServerBase();
//       const url = session.fileUrl.startsWith("http")
//         ? session.fileUrl
//         : `${serverBase}${session.fileUrl}`;
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = docName;
//       a.target = "_blank";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//     } else if (allRows.length > 0) {
//       // Export table data to CSV
//       const header = columnsList.join(",");
//       const csvContent = [
//         header,
//         ...allRows.map((r) =>
//           columnsList.map((c) => JSON.stringify(r[c] ?? "")).join(","),
//         ),
//       ].join("\n");
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = docName.endsWith(".csv") ? docName : `${docName}.csv`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } else if (session?.extractedText) {
//       const blob = new Blob([session.extractedText], {
//         type: "text/plain;charset=utf-8;",
//       });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${docName}.txt`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen w-screen bg-[#070914] text-slate-100 overflow-hidden font-sans select-text">
//       {/* 1. TOP HEADER - Exact 1:1 match with Flutter AnalyzeFilesChatScreen */}
//       <header className="h-16 px-3.5 md:px-5 flex items-center justify-between bg-[#0F1123] border-b border-[#1E223D] shrink-0 z-20">
//         <div className="flex items-center gap-3 min-w-0">
//           {/* Mobile Menu Icon (Image 3) */}
//           <button
//             onClick={() => {
//               if (window.history.length > 1) {
//                 router.back();
//               } else {
//                 window.location.href = "/analyze";
//               }
//             }}
//             className="md:hidden p-2 rounded-lg bg-[#131629] border border-[#242948] text-white shrink-0"
//           >
//             <Menu className="w-4 h-4" />
//           </button>

//           {/* Back to Analyze button */}
//           <button
//             onClick={() => {
//               if (window.history.length > 1) {
//                 router.back();
//               } else {
//                 window.location.href = "/analyze";
//               }
//             }}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-[13px] font-semibold hover:bg-[#322774] transition shrink-0"
//           >
//             <ArrowLeft className="w-3.5 h-3.5" />
//             <span className="hidden sm:inline">Back to Analyze</span>
//             <span className="sm:hidden">Back</span>
//           </button>

//           {/* Dynamic File Badge Icon */}
//           {renderBadgeIcon()}

//           {/* File Name & Subtitle */}
//           <div className="flex flex-col min-w-0">
//             <h1 className="text-[14px] md:text-[14.5px] font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
//               {docName}
//             </h1>
//             <span className="text-[11px] md:text-[11.5px] text-[#8E95AF] font-medium">
//               {getSubtitle()}
//             </span>
//           </div>
//         </div>

//         {/* View Controls - Split / Fullscreen (Image 2) */}
//         {!isMobile && (
//           <div className="flex items-center gap-2">
//             {/* Split Screen Toggle */}
//             <button
//               onClick={() => {
//                 if (viewMode === "split") {
//                   setViewMode("chatOnly");
//                 } else {
//                   setViewMode("split");
//                   setSplitRatio(50);
//                 }
//               }}
//               title="Toggle Split / Single View"
//               className={`p-2 rounded-lg border transition ${
//                 viewMode === "split"
//                   ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
//                   : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
//               }`}
//             >
//               <Columns className="w-4 h-4" />
//             </button>

//             {/* Fullscreen / Doc Only Button */}
//             <button
//               onClick={() => {
//                 if (viewMode === "docOnly") {
//                   setViewMode("split");
//                 } else {
//                   setViewMode("docOnly");
//                 }
//               }}
//               title="Toggle Fullscreen Preview"
//               className={`p-2 rounded-lg border transition ${
//                 viewMode === "docOnly"
//                   ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
//                   : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
//               }`}
//             >
//               <Maximize2 className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </header>

//       {/* MOBILE TABS SWITCHER (Image 3: Document vs Chat & Analysis) */}
//       {isMobile && (
//         <div className="bg-[#090A14] px-4 py-2 shrink-0 border-b border-[#1E223D]">
//           <div className="flex rounded-xl bg-[#121424] border border-[#222642] p-1">
//             <button
//               onClick={() => setMobileTab("doc")}
//               className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${
//                 mobileTab === "doc"
//                   ? "bg-[#6C56E5] text-white shadow-md"
//                   : "text-[#8E95AF] hover:text-white"
//               }`}
//             >
//               <FileText className="w-4 h-4" />
//               Document
//             </button>
//             <button
//               onClick={() => setMobileTab("chat")}
//               className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${
//                 mobileTab === "chat"
//                   ? "bg-[#6C56E5] text-white shadow-md"
//                   : "text-[#8E95AF] hover:text-white"
//               }`}
//             >
//               <Sparkles className="w-4 h-4" />
//               Chat & Analysis
//             </button>
//           </div>
//         </div>
//       )}

//       {/* 2. MAIN WORKSPACE CONTAINER */}
//       <div
//         ref={containerRef}
//         className="flex flex-1 min-h-0 relative overflow-hidden select-text"
//       >
//         {/* Left Side: Document Preview Pane */}
//         {(!isMobile || mobileTab === "doc") &&
//           (viewMode !== "chatOnly" || isMobile) && (
//             <div
//               style={{
//                 width: isMobile
//                   ? "100%"
//                   : viewMode === "docOnly"
//                     ? "100%"
//                     : `${splitRatio}%`,
//               }}
//               className="relative flex flex-col bg-[#0B0E1A] border-r border-[#1E223D] overflow-hidden h-full"
//             >
//               {loading ? (
//                 <div className="flex h-full items-center justify-center flex-col gap-3 text-slate-400">
//                   <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
//                   <span className="text-xs font-medium">
//                     Loading document preview...
//                   </span>
//                 </div>
//               ) : ["csv", "xlsx", "xls"].includes(fileType) &&
//                 allRows.length > 0 ? (
//                 /* Excel Spreadsheet Grid with formula ribbon & Sheet1 footer */
//                 <div className="flex flex-col h-full bg-white text-slate-800">
//                   {/* Excel Classic Formula Bar */}
//                   <div className="h-10 bg-[#F3F2F1] border-b border-[#D4D4D4] px-3.5 flex items-center gap-3 shrink-0">
//                     <div className="px-2 py-0.5 rounded bg-[#107C41] text-white text-[11px] font-bold tracking-wider flex items-center gap-1">
//                       <FileSpreadsheet className="w-3 h-3" />
//                       EXCEL
//                     </div>
//                     <div className="h-7 flex-1 bg-white border border-[#D4D4D4] rounded px-2.5 flex items-center gap-2 text-xs">
//                       <span className="italic font-bold text-[#107C41]">
//                         fx
//                       </span>
//                       <span className="w-[1px] h-3.5 bg-[#D4D4D4]" />
//                       <span className="text-[#323130] text-[11px] font-medium truncate">
//                         {columnsList.length} Columns • {allRows.length} Rows{" "}
//                         {searchQuery ? `(${filteredRows.length} matched)` : ""}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Spreadsheet Table with Column Letters A, B, C... and dynamic zoom */}
//                   <div className="flex-1 overflow-auto">
//                     <div
//                       style={{
//                         transform: `scale(${zoomLevel})`,
//                         transformOrigin: "top left",
//                         transition: isDragging
//                           ? "none"
//                           : "transform 0.15s ease-out",
//                       }}
//                     >
//                       <table className="w-full border-collapse text-xs select-text">
//                         <thead>
//                           <tr className="bg-[#F2F2F2] sticky top-0 z-10 border-b border-[#D4D4D4]">
//                             <th className="w-12 px-2 py-2 text-center font-bold text-[#605E5C] bg-[#F2F2F2] border-r border-[#D4D4D4]">
//                               #
//                             </th>
//                             {columnsList.map((col, idx) => (
//                               <th
//                                 key={idx}
//                                 className="px-3 py-2 text-left border-r border-[#D4D4D4] whitespace-nowrap bg-[#F2F2F2]"
//                               >
//                                 <div className="text-[11px] font-extrabold text-[#107C41]">
//                                   {getColumnLetter(idx)}
//                                 </div>
//                                 <div className="text-[12px] font-bold text-[#201F1E]">
//                                   {col}
//                                 </div>
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {displayedRows.map((row, rIdx) => {
//                             const originalIdx =
//                               (currentPage - 1) * rowsPerPage + rIdx + 1;
//                             return (
//                               <tr
//                                 key={rIdx}
//                                 className="hover:bg-[#EBF1F5] border-b border-[#D4D4D4]"
//                               >
//                                 <td className="px-2 py-1.5 text-center font-mono text-[11px] text-[#605E5C] bg-[#F8F8F8] border-r border-[#D4D4D4]">
//                                   {originalIdx}
//                                 </td>
//                                 {columnsList.map((col, cIdx) => (
//                                   <td
//                                     key={cIdx}
//                                     className="px-3 py-1.5 text-slate-800 border-r border-[#D4D4D4] whitespace-nowrap max-w-[240px] truncate font-normal"
//                                   >
//                                     {String(row[col] ?? "")}
//                                   </td>
//                                 ))}
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {/* Bottom Sheet Tab Bar (Image 2: Sheet1 & rows loaded) */}
//                   <div className="h-8 bg-[#F3F2F1] border-t border-[#D4D4D4] px-3 flex items-center justify-between shrink-0 text-xs">
//                     <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-b-2 border-[#107C41] text-[#107C41] font-bold text-[11px]">
//                       <FileSpreadsheet className="w-3 h-3" />
//                       Sheet1
//                     </div>
//                     <span className="text-[11px] text-[#605E5C]">
//                       {allRows.length} rows loaded
//                     </span>
//                   </div>
//                 </div>
//               ) : ["image", "jpg", "jpeg", "png", "webp"].includes(fileType) ? (
//                 /* High-Quality Image Viewer with dynamic zoom & pan */
//                 <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#0B0E1A]">
//                   {session?.visualImageUrls &&
//                   session.visualImageUrls.length > 0 ? (
//                     <div
//                       style={{
//                         transform: `scale(${zoomLevel})`,
//                         transformOrigin: "center center",
//                         transition: isDragging
//                           ? "none"
//                           : "transform 0.15s ease-out",
//                       }}
//                       className="max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
//                     >
//                       <img
//                         src={session.visualImageUrls[0]}
//                         alt={docName}
//                         className="max-h-[80vh] w-auto object-contain rounded-lg"
//                       />
//                     </div>
//                   ) : session?.fileUrl ? (
//                     <div
//                       style={{
//                         transform: `scale(${zoomLevel})`,
//                         transformOrigin: "center center",
//                         transition: isDragging
//                           ? "none"
//                           : "transform 0.15s ease-out",
//                       }}
//                       className="max-w-full max-h-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-white/10"
//                     >
//                       <img
//                         src={
//                           session.fileUrl.startsWith("http")
//                             ? session.fileUrl
//                             : `${getApiServerBase()}${session.fileUrl}`
//                         }
//                         alt={docName}
//                         className="max-h-[80vh] w-auto object-contain rounded-lg"
//                       />
//                     </div>
//                   ) : (
//                     <div className="text-slate-400 text-xs">
//                       Image preview not available
//                     </div>
//                   )}
//                 </div>
//               ) : fileType === "pdf" && session?.fileUrl ? (
//                 /* PDF Native Viewer with fallback */
//                 <div className="flex-1 h-full w-full bg-[#1A1D2E] relative flex flex-col">
//                   <iframe
//                     src={
//                       session.fileUrl.startsWith("http")
//                         ? session.fileUrl
//                         : `${getApiServerBase()}${session.fileUrl}`
//                     }
//                     className="w-full h-full border-none flex-1"
//                     title="PDF Preview"
//                   />
//                 </div>
//               ) : (
//                 /* Word / Text Document Viewer */
//                 <div className="flex-1 overflow-auto p-6 md:p-8 bg-[#0B0E1A] flex justify-center">
//                   <div
//                     style={{
//                       transform: `scale(${zoomLevel})`,
//                       transformOrigin: "top center",
//                     }}
//                     className="w-full max-w-[750px] bg-white rounded-md shadow-2xl p-8 md:p-10 text-slate-800 min-h-[500px] leading-relaxed select-text transition-transform"
//                   >
//                     <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
//                       <div>
//                         <h2 className="text-base font-bold text-slate-900">
//                           {docName}
//                         </h2>
//                         <p className="text-xs text-slate-500 font-medium">
//                           Document Content Extract
//                         </p>
//                       </div>
//                       <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase">
//                         {fileType || "doc"}
//                       </span>
//                     </div>
//                     <div className="text-[13.5px] whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
//                       {session?.extractedText ||
//                         "No text preview available for this document."}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Floating Search Bar (if search opened) */}
//               {isSearchOpen && (
//                 <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none z-20">
//                   <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121424] border border-[#3B3363] shadow-2xl text-white text-xs">
//                     <Search className="w-4 h-4 text-[#A78BFA]" />
//                     <input
//                       ref={searchInputRef}
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       placeholder="Search in table..."
//                       className="bg-transparent text-white text-xs outline-none w-36 placeholder-[#8E95AF]"
//                       autoFocus
//                     />
//                     {searchQuery && (
//                       <button
//                         onClick={() => setSearchQuery("")}
//                         className="text-slate-400 hover:text-white"
//                       >
//                         <X className="w-3.5 h-3.5" />
//                       </button>
//                     )}
//                     <button
//                       onClick={() => {
//                         setIsSearchOpen(false);
//                         setSearchQuery("");
//                       }}
//                       className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white ml-1"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Floating Document Bottom Toolbar - Exact 1:1 matching Image 2 */}
//               <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none z-10">
//                 <div className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0C101E]/95 border border-[#1E2640] shadow-[0_8px_24px_rgba(0,0,0,0.65)] backdrop-blur-md text-white text-xs font-medium">
//                   {/* Zoom Out (-) */}
//                   <button
//                     onClick={() =>
//                       setZoomLevel((z) =>
//                         Math.max(0.5, Number((z - 0.15).toFixed(2))),
//                       )
//                     }
//                     className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
//                     title="Zoom Out"
//                   >
//                     <ZoomOut className="w-3.5 h-3.5" />
//                   </button>

//                   {/* Reset Zoom / Fit */}
//                   <button
//                     onClick={() => setZoomLevel(1.0)}
//                     className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
//                     title="Fit to Page (Reset 100%)"
//                   >
//                     <Maximize className="w-3.5 h-3.5" />
//                   </button>

//                   {/* Zoom In (+) */}
//                   <button
//                     onClick={() =>
//                       setZoomLevel((z) =>
//                         Math.min(2.0, Number((z + 0.15).toFixed(2))),
//                       )
//                     }
//                     className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
//                     title="Zoom In"
//                   >
//                     <ZoomIn className="w-3.5 h-3.5" />
//                   </button>

//                   <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />

//                   {/* Prev Chevron */}
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     disabled={currentPage <= 1}
//                     className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
//                     title="Previous"
//                   >
//                     <ChevronLeft className="w-3.5 h-3.5" />
//                   </button>

//                   {/* Counter text e.g. '12 rows' or page indicator */}
//                   <span className="px-1 text-[11.5px] font-semibold text-white">
//                     {totalPages > 1
//                       ? `${currentPage} / ${totalPages}`
//                       : allRows.length > 0
//                         ? `${allRows.length} rows`
//                         : "1 page"}
//                   </span>

//                   {/* Next Chevron */}
//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(totalPages, p + 1))
//                     }
//                     disabled={currentPage >= totalPages}
//                     className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
//                     title="Next"
//                   >
//                     <ChevronRight className="w-3.5 h-3.5" />
//                   </button>

//                   <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />

//                   {/* Download Document */}
//                   <button
//                     onClick={handleDownload}
//                     className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
//                     title="Download document"
//                   >
//                     <Download className="w-3.5 h-3.5" />
//                   </button>

//                   {/* Search in Document */}
//                   <button
//                     onClick={() => {
//                       setIsSearchOpen(!isSearchOpen);
//                       if (!isSearchOpen) {
//                         setTimeout(() => searchInputRef.current?.focus(), 100);
//                       }
//                     }}
//                     className={`p-1.5 rounded-full transition ${
//                       isSearchOpen
//                         ? "bg-[#6C56E5]/40 text-[#A78BFA]"
//                         : "hover:bg-white/10 text-slate-300"
//                     }`}
//                     title="Search in Document"
//                   >
//                     <Search className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//         {/* Center: Draggable Divider Handle (ChatPDF exact 6-dots pill in Red Circle) */}
//         {!isMobile && viewMode === "split" && (
//           <div
//             onMouseDown={handleMouseDown}
//             className="relative flex items-center justify-center w-3 bg-[#090A14] hover:bg-[#1E223D] cursor-col-resize select-none shrink-0 z-30 transition-colors"
//           >
//             {/* Center Line */}
//             <div className="w-[1px] h-full bg-[#1E223D]" />

//             {/* 6-Dots Rounded Pill Container (Image 1 Red Circle) */}
//             <div className="absolute w-5 h-11 rounded-[10px] bg-[#261D5A] border-[1.4px] border-[#635BFF] shadow-[0_2px_10px_rgba(99,91,255,0.4)] flex items-center justify-center gap-[3px] pointer-events-none">
//               {/* Left 3 dots */}
//               <div className="flex flex-col gap-[3px]">
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//               </div>
//               {/* Right 3 dots */}
//               <div className="flex flex-col gap-[3px]">
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//                 <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Right Side: Chat & Generative UI (Powered by Thesys C1) */}
//         {(!isMobile || mobileTab === "chat") &&
//           (viewMode !== "docOnly" || isMobile) && (
//             <div
//               style={{
//                 width: isMobile
//                   ? "100%"
//                   : viewMode === "chatOnly"
//                     ? "100%"
//                     : `${100 - splitRatio}%`,
//               }}
//               className="flex flex-col bg-[#070914] overflow-hidden h-full relative"
//             >
//               {chatId ? (
//                 <div className="w-full h-full flex flex-col c1-chat-container">
//                   <C1Chat
//                     welcomeMessage={{
//                       title: docName,
//                       description: `Ask questions, calculate metrics, create reports, slides, or dashboards from ${docName}.`,
//                     }}
//                     conversationStarters={{
//                       variant: "short",
//                       options: [
//                         { displayText: "📊 Create a dashboard", prompt: "Create a dashboard with this file and data" },
//                         { displayText: "📄 Generate report", prompt: "Create a report with this file and data" },
//                         { displayText: "📑 Create slides", prompt: "Create slides with this file and data" },
//                         { displayText: "📈 Analyze trends", prompt: "Analyze this file or data and highlight top trends" },
//                       ],
//                     }}
//                     processMessage={async ({
//                       messages,
//                       responseId,
//                       abortController,
//                     }) => {
//                       const lastUserMsg = [...messages]
//                         .reverse()
//                         .find((m) => m.role === "user");
//                       const serverBase = getApiServerBase();
//                       const token = getAuthToken();

//                       return fetch(
//                         `${serverBase}/api/analyze-files/chats/${chatId}/message?stream=true`,
//                         {
//                           method: "POST",
//                           headers: {
//                             "Content-Type": "application/json",
//                             Authorization: token ? `Bearer ${token}` : "",
//                           },
//                           body: JSON.stringify({
//                             prompt: {
//                               role: "user",
//                               content: lastUserMsg?.content || "",
//                             },
//                             messages,
//                             responseId,
//                             threadId: chatId,
//                           }),
//                           signal: abortController.signal,
//                         },
//                       );
//                     }}
//                     theme={{ mode: "dark" }}
//                   />
//                 </div>
//               ) : (
//                 <div className="flex h-full items-center justify-center text-slate-400 text-xs">
//                   No active session found.
//                 </div>
//               )}
//             </div>
//           )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Columns,
  Maximize2,
  Paperclip,
  Mic,
  ArrowUp,
  Copy,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  Download,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Menu,
  X,
  ImageIcon,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import dynamic from "next/dynamic";
import "@crayonai/react-ui/styles/index.css";

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
  extractedText?: string;
  visualImageUrls?: string[];
  initialPrompt?: string;
  datasetCoverage?: {
    totalRows?: number;
    analyzedRows?: number;
    isComplete?: boolean;
    limitReason?: string;
  };
  messages: Message[];
}

function getApiServerBase(): string {
  // If explicitly configured in env
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) {
    // Strip trailing /api if present to get root server origin
    return envBase.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }
    // In production, use main API domain
    return "https://api.onechatai.ai";
  }
  return "https://api.onechatai.ai";
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";

  // 0. Check URL search param (when redirected from Flutter web)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get("token");
    if (urlToken && urlToken.trim().length > 10) {
      localStorage.setItem(
        "flutter.user_token",
        JSON.stringify(urlToken.trim()),
      );
      // Clean token out of visible URL and browser history immediately
      searchParams.delete("token");
      const newQuery = searchParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "") + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      return urlToken.trim();
    }
  } catch (_) {}

  // 1. Direct LocalStorage Checks (Common keys & Flutter prefix)
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

  // 2. Direct Cookie Checks (If stored in document.cookie from Flutter or Auth system)
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

function getStoredUserId(): string {
  if (typeof window === "undefined") return "";
  const candidateKeys = ["flutter.user_id", "user_id", "userId", "id"];
  for (const key of candidateKeys) {
    const val = localStorage.getItem(key);
    if (val && val !== "null" && val !== "undefined") {
      try {
        return JSON.parse(val);
      } catch (_) {
        return val.replace(/^"+|"+$/g, "").trim();
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
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "docOnly" | "chatOnly">(
    "split",
  );
  const [mobileTab, setMobileTab] = useState<"doc" | "chat">("chat");
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [customChatMessages, setCustomChatMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [customChatInput, setCustomChatInput] = useState("");
  const [customChatLoading, setCustomChatLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile width reliably (< 1024px matching Flutter)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Clean URL if any leftover query parameter (like ?prompt=...) exists
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const cleanPath = window.location.pathname;
      window.history.replaceState(null, "", cleanPath);
    }
  }, []);

  const autoTriggeredRef = useRef(false);

  // Load chat session from Node backend
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
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          const chatData = data.chat || data.session;
          if (data.success && chatData) {
            setSession(chatData);

            const existingMessages = chatData.messages || [];
            setMessages(existingMessages);

            // FIX 2: Old messages ne customChatMessages state ma map karo jethi blank na ave
            const formattedMessages = existingMessages.map((msg: any) => ({
              id: msg.id || msg._id || `${Date.now()}-${Math.random()}`,
              role: msg.role,
              content: msg.content || "",
            }));
            setCustomChatMessages(formattedMessages);

            // Auto-trigger analysis if this is a newly created session with no messages yet
            if (existingMessages.length === 0 && !autoTriggeredRef.current) {
              autoTriggeredRef.current = true;
              const promptToUse =
                chatData.initialPrompt &&
                chatData.initialPrompt.trim().length > 0
                  ? chatData.initialPrompt.trim()
                  : "Analyze this file or data";

              setTimeout(() => {
                // FIX 1: Junu handleSendMessage ni jagya e sachu function call karo
                sendCustomChatMessage(promptToUse);
              }, 150);
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

  // Draggable Split Divider Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const newRatio = (currentX / rect.width) * 100;

      // Split ratio update (min 20%, max 80%)
      const finalRatio = Math.min(Math.max(newRatio, 20), 80);
      setSplitRatio(finalRatio);

      // NAVU: Dragging vakhate zoom level auto-adjust karo
      // Calculate karyu chhe ke 50% width par 1.0 zoom (normal size) rahe.
      // Jo screen nanu thase (e.g. 25%), to zoom pan 0.5 thai jase.
      const dynamicZoom = Number((finalRatio / 50).toFixed(2));
      setZoomLevel(dynamicZoom);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const docName =
    session?.originalFileName || session?.title || "Uploaded File";
  const fileType = (
    session?.fileType ||
    docName.split(".").pop() ||
    "csv"
  ).toLowerCase();

  const getSubtitle = () => {
    const sizeBytes = session?.fileSize || 0;
    let sizeStr = "";
    if (sizeBytes > 0) {
      sizeStr =
        sizeBytes < 1024 * 1024
          ? ` • ${(sizeBytes / 1024).toFixed(1)} KB`
          : ` • ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (["csv", "xlsx", "xls"].includes(fileType)) {
      const rows = session?.rowCount || session?.tableData?.length || 0;
      const cols = session?.columnCount || session?.columns?.length || 0;
      return `${rows} rows • ${cols} cols${sizeStr}`;
    } else if (fileType === "json") {
      if (session?.tableData?.length) {
        return `${session.tableData.length} records${sizeStr}`;
      }
      const text = session?.extractedText || "";
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      return `${wordCount} words${sizeStr}`;
    } else if (["docx", "doc", "txt", "rtf"].includes(fileType)) {
      const text = session?.extractedText || "";
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      return `${wordCount} words${sizeStr}`;
    } else if (["image", "jpg", "jpeg", "png", "webp", "gif"].includes(fileType)) {
      return `Image${sizeStr}`;
    }
    return `1 page${sizeStr}`;
  };

  const getColumnLetter = (index: number) => {
    if (index < 26) return String.fromCharCode(65 + index);
    return `${String.fromCharCode(65 + Math.floor(index / 26) - 1)}${String.fromCharCode(65 + (index % 26))}`;
  };

  const renderBadgeIcon = () => {
    if (["csv", "xlsx", "xls"].includes(fileType)) {
      return (
        <div className="w-8 h-8 rounded-[7px] bg-[#107C41] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(16,124,65,0.4)] shrink-0">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
      );
    }
    if (fileType === "json") {
      return (
        <div className="w-8 h-8 rounded-[7px] bg-[#E37400] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(227,116,0,0.4)] shrink-0">
          <FileCode className="w-4 h-4" />
        </div>
      );
    }
    if (["docx", "doc"].includes(fileType)) {
      return (
        <div className="w-8 h-8 rounded-[7px] bg-[#2B579A] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(43,87,154,0.4)] shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (["image", "jpg", "jpeg", "png", "webp", "gif"].includes(fileType)) {
      return (
        <div className="w-8 h-8 rounded-[7px] bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)] shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-[7px] bg-[#EF4444] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(239,68,68,0.4)] shrink-0">
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  const columnsList = useMemo(
    () =>
      session?.columns ||
      (session?.tableData?.[0] ? Object.keys(session.tableData[0]) : []),
    [session?.columns, session?.tableData],
  );
  const allRows = useMemo(
    () => session?.tableData || [],
    [session?.tableData],
  );

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
            className={`${
              isCurrentActive
                ? "bg-[#FF9900] text-white shadow-md ring-2 ring-[#FF9900]"
                : "bg-[#FFEB3B] text-black"
            } font-bold px-0.5 rounded transition-all duration-150`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // 2. Search Tracker States
  const [matchCoords, setMatchCoords] = useState<
    { page: number; rIdx: number; cIdx: number }[]
  >([]);
  const [docMatchesCount, setDocMatchesCount] = useState(0);
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  // Pagination support (50 rows per page if large)
  const rowsPerPage = 50;
  const totalPages = Math.max(1, Math.ceil(allRows.length / rowsPerPage));
  const displayedRows = allRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // 3. Find All Matches Effect (Both for Spreadsheet and Word/Text Docs)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchCoords((prev) => (prev.length === 0 ? prev : []));
      setDocMatchesCount(0);
      setActiveMatchIdx(0);
      return;
    }

    const query = searchQuery.toLowerCase();

    if (["csv", "xlsx", "xls"].includes(fileType)) {
      const coords: { page: number; rIdx: number; cIdx: number }[] = [];

      allRows.forEach((row, rIdx) => {
        columnsList.forEach((col, cIdx) => {
          const val = String(row[col] ?? "").toLowerCase();
          if (val.includes(query)) {
            coords.push({
              page: Math.floor(rIdx / rowsPerPage) + 1,
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
      // Calculate all occurrences in Word/Text document
      const escapeRegExp = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapeRegExp(query), "gi");
      const matches = session.extractedText.match(regex);
      const total = matches ? matches.length : 0;
      setDocMatchesCount(total);
      setActiveMatchIdx(0);
    } else {
      setDocMatchesCount(0);
      setActiveMatchIdx(0);
    }
  }, [searchQuery, allRows, columnsList, fileType, rowsPerPage, session?.extractedText]);

  const handleNextSearch = () => {
    if (["csv", "xlsx", "xls"].includes(fileType)) {
      if (matchCoords.length === 0) return;
      const nextIdx = (activeMatchIdx + 1) % matchCoords.length;
      setActiveMatchIdx(nextIdx);
      const match = matchCoords[nextIdx];
      if (currentPage !== match.page) {
        setCurrentPage(match.page);
      }
      setTimeout(() => {
        const el = document.getElementById(`cell-${match.rIdx}-${match.cIdx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (docMatchesCount > 0) {
      const nextIdx = (activeMatchIdx + 1) % docMatchesCount;
      setActiveMatchIdx(nextIdx);
      setTimeout(() => {
        const el = document.getElementById(`doc-highlight-${nextIdx}`);
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
      if (currentPage !== match.page) {
        setCurrentPage(match.page);
      }
      setTimeout(() => {
        const el = document.getElementById(`cell-${match.rIdx}-${match.cIdx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else if (docMatchesCount > 0) {
      const prevIdx = (activeMatchIdx - 1 + docMatchesCount) % docMatchesCount;
      setActiveMatchIdx(prevIdx);
      setTimeout(() => {
        const el = document.getElementById(`doc-highlight-${prevIdx}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  // File Download handler
  const handleDownload = () => {
    if (session?.fileUrl) {
      const serverBase = getApiServerBase();
      const url = session.fileUrl.startsWith("http")
        ? session.fileUrl
        : `${serverBase}${session.fileUrl}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = docName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (allRows.length > 0) {
      // Export table data to CSV
      const header = columnsList.join(",");
      const csvContent = [
        header,
        ...allRows.map((r) =>
          columnsList.map((c) => JSON.stringify(r[c] ?? "")).join(","),
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docName.endsWith(".csv") ? docName : `${docName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (session?.extractedText) {
      const blob = new Blob([session.extractedText], {
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
  };

  const sendCustomChatMessage = async (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? customChatInput).trim();
    if (!prompt || !chatId || customChatLoading) return;

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
    const requestMessages = [...customChatMessages, userMessage];

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
          const errData = await response.json();
          if (errData?.message) errMessage = errData.message;
        } catch (_) {}
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
        const partial = fullResponse;
        setCustomChatMessages((current) =>
          current.map((item) =>
            item.id === assistantMessage.id
              ? { ...item, content: partial }
              : item,
          ),
        );
      }
      fullResponse += decoder.decode();
      const finalClean = fullResponse.trim();
      setCustomChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, content: finalClean }
            : item,
        ),
      );
    } catch (error: any) {
      console.error("OneChat AI request failed:", error);
      const displayMsg =
        error?.message || "Sorry, something went wrong. Please try again.";
      setCustomChatMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? {
                ...item,
                content: displayMsg,
              }
            : item,
        ),
      );
    } finally {
      setCustomChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070914] text-slate-100 overflow-hidden font-sans select-text">
      {/* 1. TOP HEADER - Exact 1:1 match with Flutter AnalyzeFilesChatScreen */}
      <header className="h-16 px-3.5 md:px-5 flex items-center justify-between bg-[#0F1123] border-b border-[#1E223D] shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                window.location.href = "/analyze";
              }
            }}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-[13px] font-semibold hover:bg-[#322774] transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Analyze</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Dynamic File Badge Icon */}
          {renderBadgeIcon()}

          {/* File Name & Subtitle */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-[14px] md:text-[14.5px] font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {docName}
            </h1>
            <span className="text-[11px] md:text-[11.5px] text-[#8E95AF] font-medium">
              {getSubtitle()}
            </span>
          </div>
        </div>

        {/* View Controls - Split / Fullscreen (Image 2) */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            {/* Split Screen Toggle */}
            <button
              onClick={() => {
                if (viewMode === "split") {
                  setViewMode("chatOnly");
                } else {
                  setViewMode("split");
                  setSplitRatio(50);
                }
              }}
              title="Toggle Split / Single View"
              className={`cursor-pointer p-2 rounded-lg border transition ${
                viewMode === "split"
                  ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                  : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>

            {/* Fullscreen / Doc Only Button */}
            <button
              onClick={() => {
                if (viewMode === "docOnly") {
                  setViewMode("split");
                } else {
                  setViewMode("docOnly");
                }
              }}
              title="Toggle Fullscreen Preview"
              className={`cursor-pointer p-2 rounded-lg border transition ${
                viewMode === "docOnly"
                  ? "bg-[#261D5A] border-[#635BFF] text-[#C7D2FE]"
                  : "bg-[#131629] border-[#242948] text-[#8E95AF] hover:text-white"
              }`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* MOBILE TABS SWITCHER (Image 3: Document vs Chat & Analysis) */}
      {isMobile && (
        <div className="bg-[#090A14] px-4 py-2 shrink-0 border-b border-[#1E223D]">
          <div className="flex rounded-xl bg-[#121424] border border-[#222642] p-1">
            <button
              onClick={() => setMobileTab("doc")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${
                mobileTab === "doc"
                  ? "bg-[#6C56E5] text-white shadow-md"
                  : "text-[#8E95AF] hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              Document
            </button>
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition ${
                mobileTab === "chat"
                  ? "bg-[#6C56E5] text-white shadow-md"
                  : "text-[#8E95AF] hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Chat & Analysis
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 relative overflow-hidden select-text"
      >
        {/* Left Side: Document Preview Pane */}
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
              {loading ? (
                <div className="flex h-full items-center justify-center flex-col gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-[#8B5CF6]" />
                  <span className="text-xs font-medium">
                    Loading document preview...
                  </span>
                </div>
              ) : ["csv", "xlsx", "xls"].includes(fileType) &&
                allRows.length > 0 ? (
                /* Excel Spreadsheet Grid with formula ribbon & Sheet1 footer */
                <div className="flex flex-col h-full bg-white text-slate-800">
                  {/* Excel Classic Formula Bar */}
                  <div className="h-10 bg-[#F3F2F1] border-b border-[#D4D4D4] px-3.5 flex items-center gap-3 shrink-0">
                    <div className="px-2 py-0.5 rounded bg-[#107C41] text-white text-[11px] font-bold tracking-wider flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3" />
                      EXCEL
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

                  {/* Partial Data Notice if file exceeded max rows */}
                  {session?.datasetCoverage &&
                    session.datasetCoverage.isComplete === false && (
                      <div className="bg-[#FFF4CE] border-b border-[#FDE79E] text-[#797673] px-3.5 py-1.5 text-[11.5px] flex items-center justify-between shrink-0">
                        <span className="font-medium text-[#323130]">
                          ⚠️ Partial Dataset: Displaying and analyzing the first{" "}
                          <strong>
                            {session.datasetCoverage.analyzedRows?.toLocaleString()}
                          </strong>{" "}
                          of{" "}
                          <strong>
                            {session.datasetCoverage.totalRows?.toLocaleString()}
                          </strong>{" "}
                          rows due to system performance limits.
                        </span>
                      </div>
                    )}

                  {/* Spreadsheet Table with Column Letters A, B, C... and dynamic zoom */}
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
                            const originalIdx =
                              (currentPage - 1) * rowsPerPage + rIdx + 1;
                            const globalRowIdx =
                              (currentPage - 1) * rowsPerPage + rIdx;
                            return (
                              <tr
                                key={rIdx}
                                className="hover:bg-[#EBF1F5] border-b border-[#D4D4D4]"
                              >
                                <td className="px-2 py-1.5 text-center font-mono text-[11px] text-[#605E5C] bg-[#F8F8F8] border-r border-[#D4D4D4]">
                                  {originalIdx}
                                </td>
                                {columnsList.map((col, cIdx) => {
                                  // Check if this specific cell is the currently active match
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
                                      {/* Ahya direct string ni jagya e renderHighlightedText call karyu chhe */}
                                      {renderHighlightedText(
                                        String(row[col] ?? ""),
                                        searchQuery,
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

                  {/* Bottom Sheet Tab Bar (Image 2: Sheet1 & rows loaded) */}
                  <div className="h-8 bg-[#F3F2F1] border-t border-[#D4D4D4] px-3 flex items-center justify-between shrink-0 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border-b-2 border-[#107C41] text-[#107C41] font-bold text-[11px]">
                      <FileSpreadsheet className="w-3 h-3" />
                      Sheet1
                    </div>
                    <span className="text-[11px] text-[#605E5C]">
                      {allRows.length} rows loaded
                    </span>
                  </div>
                </div>
              ) : ["image", "jpg", "jpeg", "png", "webp"].includes(fileType) ? (
                /* High-Quality Image Viewer with dynamic zoom & pan */
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#0B0E1A]">
                  {session?.visualImageUrls &&
                  session.visualImageUrls.length > 0 ? (
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
                        src={session.visualImageUrls[0]}
                        alt={docName}
                        className="max-h-[80vh] w-auto object-contain rounded-lg"
                      />
                    </div>
                  ) : session?.fileUrl ? (
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
                          session.fileUrl.startsWith("http")
                            ? session.fileUrl
                            : `${getApiServerBase()}${session.fileUrl}`
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
              ): fileType === "pdf" && session?.fileUrl ? (
  /* PDF Native Viewer with fallback & search highlight support */
  <div className="flex-1 h-full w-full bg-[#1A1D2E] relative flex flex-col items-center">
    <object
      key={searchQuery.trim() ? `pdf-${searchQuery.trim()}` : "pdf-default"}
      data={
        session.fileUrl.startsWith("http")
          ? `${session.fileUrl}#toolbar=0&navpanes=0${searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : ""}`
          : `${getApiServerBase()}${session.fileUrl}#toolbar=0&navpanes=0${searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : ""}`
      }
      type="application/pdf"
      className="w-full h-full border-none flex-1"
    >
      <iframe
        src={
          session.fileUrl.startsWith("http")
            ? `${session.fileUrl}${searchQuery.trim() ? `#search=${encodeURIComponent(searchQuery.trim())}` : ""}`
            : `${getApiServerBase()}${session.fileUrl}${searchQuery.trim() ? `#search=${encodeURIComponent(searchQuery.trim())}` : ""}`
        }
        className="w-full h-full border-none flex-1"
        title="PDF Preview"
      />
    </object>
  </div>
) : (
                /* Word / Text Document Viewer */
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
                      {session?.extractedText ? (
                        searchQuery.trim() ? (
                          renderHighlightedText(session.extractedText, searchQuery.trim())
                        ) : (
                          session.extractedText
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

              {isSearchOpen && (
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
                          if (e.shiftKey) {
                            handlePrevSearch();
                          } else {
                            handleNextSearch();
                          }
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

              {/* Floating Document Bottom Toolbar - Exact 1:1 matching Image 2 */}
              <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none z-10">
                <div className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0C101E]/95 border border-[#1E2640] shadow-[0_8px_24px_rgba(0,0,0,0.65)] backdrop-blur-md text-white text-xs font-medium">
                  {/* Zoom Out (-) */}
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

                  {/* Reset Zoom / Fit */}
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Fit to Page (Reset 100%)"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>

                  {/* Zoom In (+) */}
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

                  {/* Prev Chevron */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30 text-slate-300 transition"
                    title="Previous"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Counter text e.g. '12 rows' or page indicator */}
                  <span className="px-1 text-[11.5px] font-semibold text-white">
                    {totalPages > 1
                      ? `${currentPage} / ${totalPages}`
                      : allRows.length > 0
                        ? `${allRows.length} rows`
                        : "1 page"}
                  </span>

                  {/* Next Chevron */}
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

                  <div className="w-[1px] h-3.5 bg-[#282C4A] mx-1" />

                  {/* Download Document */}
                  <button
                    onClick={handleDownload}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Search in Document */}
                  <button
                    onClick={() => {
                      setIsSearchOpen(!isSearchOpen);
                      if (!isSearchOpen) {
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                      }
                    }}
                    className={`cursor-pointer p-1.5 rounded-full transition ${
                      isSearchOpen
                        ? "bg-[#6C56E5]/40 text-[#A78BFA]"
                        : "hover:bg-white/10 text-slate-300"
                    }`}
                    title="Search in Document"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Center: Draggable Divider Handle (ChatPDF exact 6-dots pill in Red Circle) */}
        {!isMobile && viewMode === "split" && (
          <div
            onMouseDown={handleMouseDown}
            className="relative flex items-center justify-center w-3 bg-[#090A14] hover:bg-[#1E223D] cursor-col-resize select-none shrink-0 z-30 transition-colors"
          >
            {/* Center Line */}
            <div className="w-[1px] h-full bg-[#1E223D]" />

            {/* 6-Dots Rounded Pill Container (Image 1 Red Circle) */}
            <div className="absolute w-5 h-11 rounded-[10px] bg-[#261D5A] border-[1.4px] border-[#635BFF] shadow-[0_2px_10px_rgba(99,91,255,0.4)] flex items-center justify-center gap-[3px] pointer-events-none">
              {/* Left 3 dots */}
              <div className="flex flex-col gap-[3px]">
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
              </div>
              {/* Right 3 dots */}
              <div className="flex flex-col gap-[3px]">
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
                <div className="w-[3px] h-[3px] rounded-full bg-[#C7D2FE]" />
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Chat & Generative UI (Powered by Thesys C1) */}
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
                        Ask anything about {docName}
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
                          Ask questions, analyze trends, or create a report from
                          your file.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                          {[
                            "Analyze trends",
                            "Create a dashboard",
                            "Generate a report",
                            "Create slides",
                          ].map((suggestion) => (
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
                            message.content.includes("failed to serve this request") ||
                            message.content.includes("Request failed") ? (
                              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-sm text-red-200">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                                <div>
                                  <div className="font-semibold text-red-300">
                                    AI Service Notice
                                  </div>
                                  <div className="mt-1 text-xs text-red-200/90 leading-relaxed">
                                    {message.content.replace(/^\[Error:\s*|\s*\]$/g, "")}
                                  </div>
                                </div>
                              </div>
                            ) : message.content.trim().length > 0 ? (
                              <C1Component
                                c1Response={message.content}
                                isStreaming={true}
                              />
                            ) : customChatLoading ? (
                              /* NAVU SPINNER UI (Image 1) */
                              <div className="flex w-fit items-center gap-3 rounded-full border border-[#292D49] bg-[#121424] px-4 py-2.5 text-sm text-[#A78BFA]">
                                <svg
                                  className="h-4 w-4 animate-spin text-[#6C56E5]"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-20"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                  ></circle>
                                  <path
                                    className="opacity-100"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Reading document & preparing answer...
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#1E223D] bg-[#070914] p-4 sm:px-6">
                    {/* NAVU CHAT INPUT UI (Image 2) */}
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void sendCustomChatMessage();
                      }}
                      className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-[#292D49] bg-[#0C1020] px-4 py-3 focus-within:border-[#7564F6]"
                    >
                      {/* Paperclip icon ahya thi remove kari didhu chhe */}

                      <input
                        type="text"
                        value={customChatInput}
                        onChange={(event) =>
                          setCustomChatInput(event.target.value)
                        }
                        placeholder={
                          customChatLoading
                            ? "Generating answer..."
                            : "Ask anything about your file..."
                        }
                        disabled={customChatLoading || !chatId}
                        className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50 cursor-text"
                      />

                      {/* Mic icon ahya thi remove kari didhu chhe */}

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
