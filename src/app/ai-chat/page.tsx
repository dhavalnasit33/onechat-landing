"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronDown,
  Copy,
  CheckCheck,
  Paperclip,
  ArrowUp,
  Brain,
  X,
  Menu,
} from "lucide-react";
import { PROVIDER_MODELS, AIModelItem } from "@/constants/providerModelsHelper";

// 15 Major Models list (Exact Flutter models & icons)
export const MAJOR_PROVIDERS = [
  {
    name: "ChatGPT",
    route: "/chatgpt",
    provider: "openai",
    icon: "/assets/images/home_chatGPT.png",
    defaultModel: "GPT 5.6 Terra",
  },
  {
    name: "Gemini",
    route: "/gemini",
    provider: "google",
    icon: "/assets/images/home_gemini.png",
    defaultModel: "Gemini 2.5 Flash",
  },
  {
    name: "Claude",
    route: "/claude",
    provider: "anthropic",
    icon: "/assets/images/claude1.png",
    defaultModel: "Claude Sonnet 5",
  },
  {
    name: "DeepSeek",
    route: "/deepseek",
    provider: "deepseek",
    icon: "/assets/images/deepseek1.png",
    defaultModel: "DeepSeek V4 Pro",
  },
  {
    name: "Llama",
    route: "/llama",
    provider: "meta",
    icon: "/assets/images/home_meta_ai.png",
    defaultModel: "Llama 4 Maverick",
  },
  {
    name: "Meta Muse",
    route: "/muse",
    provider: "muse",
    icon: "/assets/images/muse-logo.png",
    defaultModel: "Meta Muse Pro",
  },
  {
    name: "Grok",
    route: "/grok",
    provider: "xai",
    icon: "/assets/images/grok-icon.png",
    defaultModel: "Grok 4.20",
  },
  {
    name: "Perplexity",
    route: "/perplexity",
    provider: "perplexity",
    icon: "/assets/images/home_perplexity.png",
    defaultModel: "Sonar",
  },
  {
    name: "Kimi",
    route: "/kimi",
    provider: "kimi",
    icon: "/assets/images/kimi-icon.png",
    defaultModel: "Kimi K3",
  },
  {
    name: "Mistral",
    route: "/mistral",
    provider: "mistral",
    icon: "/assets/images/mistral1.png",
    defaultModel: "Mistral Small 2603",
  },
  {
    name: "Qwen",
    route: "/qwen",
    provider: "qwen",
    icon: "/assets/images/qwen1.png",
    defaultModel: "Qwen 3.8 27B",
  },
  {
    name: "MiniMax",
    route: "/minimax",
    provider: "minimax",
    icon: "/assets/images/minimax1.png",
    defaultModel: "MiniMax M3",
  },
  {
    name: "MiMo",
    route: "/mimo",
    provider: "mimo",
    icon: "/assets/images/mimo1.png",
    defaultModel: "MiMo V2.5 Pro",
  },
  {
    name: "GLM",
    route: "/glm",
    provider: "glm",
    icon: "/assets/images/glm1.png",
    defaultModel: "GLM 5.3",
  },
  {
    name: "Nemotron",
    route: "/nemotron",
    provider: "nemotron",
    icon: "/assets/images/nemotron1.png",
    defaultModel: "NVIDIA Nemotron 3...",
  },
];

export const PROVIDER_ICONS: Record<string, string> = {
  ChatGPT: "/assets/images/home_chatGPT.png",
  Gemini: "/assets/images/home_gemini.png",
  Claude: "/assets/images/claude1.png",
  DeepSeek: "/assets/images/deepseek1.png",
  Llama: "/assets/images/home_meta_ai.png",
  "Meta Muse": "/assets/images/muse-logo.png",
  Grok: "/assets/images/grok-icon.png",
  Perplexity: "/assets/images/home_perplexity.png",
  Kimi: "/assets/images/kimi-icon.png",
  Mistral: "/assets/images/mistral1.png",
  Qwen: "/assets/images/qwen1.png",
  MiniMax: "/assets/images/minimax1.png",
  MiMo: "/assets/images/mimo1.png",
  GLM: "/assets/images/glm1.png",
  Nemotron: "/assets/images/nemotron1.png",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface HistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  is_double?: boolean;
  isDouble?: boolean;
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
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
  } catch (_) {}

  const candidateKeys = [
    "flutter.user_token",
    "token",
    "authToken",
    "user_token",
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
  return "";
}

function getApiBase(): string {
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) return envBase.replace(/\/api\/?$/, "");
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://api.onechatai.ai";
  }
  return "https://api.onechatai.ai";
}

function FormattedAiResponse({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex items-center gap-1.5 py-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse" />
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    );
  }
  return (
    <div className="prose prose-invert max-w-none text-[15px] leading-relaxed font-normal text-[#E2E8F0] selection:bg-purple-600/40">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-[#181C2B] transition cursor-pointer"
      title="Copy"
    >
      {copied ? (
        <CheckCheck className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function AiChatInner() {
  const searchParams = useSearchParams();

  // Find initial provider from URL params (?model=deepseek)
  const initialProviderName = (() => {
    if (typeof window === "undefined") return "DeepSeek";
    const params = new URLSearchParams(window.location.search);
    const m = params.get("model") || params.get("provider") || "";
    if (m) {
      const match = MAJOR_PROVIDERS.find(
        (p) =>
          p.name.toLowerCase() === m.toLowerCase() ||
          p.provider.toLowerCase() === m.toLowerCase() ||
          m.toLowerCase().includes(p.name.toLowerCase()) ||
          m.toLowerCase().includes(p.provider.toLowerCase()),
      );
      if (match) return match.name;
    }
    return "DeepSeek";
  })();

  const [selectedProvider, setSelectedProvider] =
    useState<string>(initialProviderName);
  const [selectedModel, setSelectedModel] = useState<AIModelItem>(() => {
    return (
      PROVIDER_MODELS[initialProviderName]?.[0] || {
        name: "DeepSeek V4 Pro",
        id: "6a756dc990ca2618be6d839c",
        slug: "deepseek-v4-pro",
        icon: "assets/images/deepseek1.png",
      }
    );
  });

  const [openSubModelDropdown, setOpenSubModelDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // DeepThink Toggle (Search removed)
  const [isDeepThinkActive, setIsDeepThinkActive] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // File
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasAutoTriggeredRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Read URL query params & load Model / ChatId
  useEffect(() => {
    const provParam = searchParams.get("model") || searchParams.get("provider");
    if (provParam) {
      const match = MAJOR_PROVIDERS.find(
        (p) =>
          p.name.toLowerCase() === provParam.toLowerCase() ||
          p.provider.toLowerCase() === provParam.toLowerCase() ||
          provParam.toLowerCase().includes(p.name.toLowerCase()) ||
          provParam.toLowerCase().includes(p.provider.toLowerCase()),
      );
      if (match && match.name !== selectedProvider) {
        setSelectedProvider(match.name);
        const models = PROVIDER_MODELS[match.name] || [];
        if (models.length > 0) {
          setSelectedModel(models[0]);
        }
      }
    }

    const chatIdParam = searchParams.get("chatId");
    if (chatIdParam) {
      setCurrentChatId(chatIdParam);
      loadChatById(chatIdParam);
    }
  }, [searchParams]);

  // 🚀 Auto-trigger initial prompt from Cookie or Query param
  useEffect(() => {
    if (hasAutoTriggeredRef.current) return;

    const cookiePrompt = getCookie("chat_initial_prompt");
    const queryPrompt = searchParams.get("prompt");
    const promptToTrigger = (cookiePrompt || queryPrompt || "").trim();

    if (promptToTrigger) {
      hasAutoTriggeredRef.current = true;
      deleteCookie("chat_initial_prompt");
      setTimeout(() => {
        handleSendMessage(promptToTrigger);
      }, 300);
    }
  }, [selectedModel]);

  // 🔥 Load History strictly matching Flutter (removes isDouble / Multi-Chat)
  const loadProviderHistory = async (provName: string) => {
    const token = getAuthToken();
    if (!token) return;
    setIsLoadingHistory(true);

    const providerObj = MAJOR_PROVIDERS.find(
      (p) => p.name.toLowerCase() === provName.toLowerCase(),
    );
    const apiProvider = providerObj
      ? providerObj.provider
      : provName.toLowerCase();

    try {
      const res = await fetch(
        `${getApiBase()}/api/chat-history?ischatehistry=true&provider=${apiProvider}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const rawList: HistoryItem[] = data?.data || data?.chats || [];

        // Exact Flutter filter: exclude Multi-Chat
        const singleModelChats = rawList.filter(
          (item) => item.is_double !== true && item.isDouble !== true,
        );

        setHistoryList(singleModelChats);
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadProviderHistory(selectedProvider);
  }, [selectedProvider]);

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = () => setOpenSubModelDropdown(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  // 🔄 જ્યારે યુઝર સાઇડબારમાંથી બીજા કોઈ મોડેલ પર ક્લિક કરે -> સીધું Flutter માં પાછા જવું!
  const handleModelSidebarClick = (item: (typeof MAJOR_PROVIDERS)[0]) => {
    if (item.name.toLowerCase() === selectedProvider.toLowerCase()) {
      return;
    }
    const flutterHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? window.location.origin
        : "";
    window.location.href = `${flutterHost}${item.route}`;
  };

  // Ensure Chat ID in Backend (ischatehistry: true matching Flutter)
  const ensureChatId = async (
    provider: string,
    chatId?: string | null,
    firstMessageTitle?: string,
  ) => {
    if (chatId) return chatId;
    const token = getAuthToken();
    if (!token) return null;

    const providerObj = MAJOR_PROVIDERS.find(
      (p) => p.name.toLowerCase() === provider.toLowerCase(),
    );
    const apiProvider = providerObj
      ? providerObj.provider
      : provider.toLowerCase();
    const title =
      firstMessageTitle && firstMessageTitle.length > 0
        ? firstMessageTitle.length > 30
          ? `${firstMessageTitle.substring(0, 30)}...`
          : firstMessageTitle
        : `Chat: ${provider}`;

    try {
      const res = await fetch(`${getApiBase()}/api/chat-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          tags: ["is_model_chat", apiProvider],
          provider: apiProvider,
          ischatehistry: true, // ✅ MATCHES FLUTTER
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newId = data?.data?._id || data?._id || null;
      if (newId) {
        setCurrentChatId(newId);
        loadProviderHistory(provider);
      }
      return newId;
    } catch (e) {
      console.error("Chat history creation failed:", e);
      return null;
    }
  };

  // Load chat by ID (Carefully parses role to ensure user messages stay on the RIGHT)
  const loadChatById = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${getApiBase()}/api/chat-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const chat = data?.data || data?.chat;
        if (chat && chat.messages) {
          const msgs: ChatMessage[] = chat.messages.map((m: any) => {
            const roleStr = (m.role || m.sender || m.type || "").toLowerCase();
            const isUser =
              roleStr === "user" || roleStr === "me" || roleStr === "human";
            return {
              role: isUser ? "user" : "assistant",
              content: m.content || m.text || m.message || "",
            };
          });
          setMessages(msgs);
        }
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  // Handle Stream Generation (ischatehistry: true matching Flutter)
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || prompt).trim();
    if (!promptText && selectedFiles.length === 0) return;

    setPrompt("");
    setSelectedFiles([]);

    const chatId = await ensureChatId(
      selectedProvider,
      currentChatId,
      promptText,
    );

    setMessages((prev) => [
      ...prev,
      { role: "user", content: promptText },
      { role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const token = getAuthToken();

    try {
      const res = await fetch(`${getApiBase()}/api/tools/ai/general-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: promptText,
          modelId: isDeepThinkActive
            ? "6a756dfd90ca2618be6d83f5"
            : selectedModel.id,
          chatId: chatId,
          ischatehistry: true, // ✅ MATCHES FLUTTER
          max_tokens: 4000,
          source: "model-chat-text",
          promptId: `${Date.now()}_${selectedProvider}`,
          system_prompt: "You are a helpful AI assistant in OneChat AI.",
        }),
        signal: controller.signal,
      });

      // Reload chat history after sending message
      setTimeout(() => {
        loadProviderHistory(selectedProvider);
      }, 1000);

      if (!res.ok) {
        let errorMsg = `${selectedProvider} is temporarily unavailable (${res.status}).`;
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `⚠️ ${errorMsg}`,
          };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        chunk.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) return;

          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.replace(/^data:\s*/, "");
            if (dataContent !== "[DONE]") {
              try {
                const parsed = JSON.parse(dataContent);
                let piece =
                  parsed.chunk ??
                  parsed.text ??
                  parsed.content ??
                  parsed.message ??
                  "";
                if (typeof piece === "string") accumulated += piece;
              } catch (_) {
                accumulated += dataContent;
              }
            }
          }
        });

        const cleaned = accumulated.replace(/^:+/, "").trimStart();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: cleaned };
          return copy;
        });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Stream generation error:", e);
        setMessages((prev) => {
          const copy = [...prev];
          if (
            copy.length > 0 &&
            copy[copy.length - 1].role === "assistant" &&
            !copy[copy.length - 1].content
          ) {
            copy[copy.length - 1] = {
              role: "assistant",
              content: "⚠️ Request failed. Please try again.",
            };
          }
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090E] text-white font-sans">
      {/* 1. LEFT SIDEBAR (EXACT FLUTTER 2ND IMAGE MATCH) */}
      <div
        className={`${
          isSidebarOpen ? "w-[240px]" : "w-[68px]"
        } transition-all duration-300 bg-[#090B14] border-r border-[#1B1F30]/80 flex flex-col shrink-0 relative z-30`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1B1F30]/60">
          {isSidebarOpen && (
            <span className="font-bold text-[17px] tracking-wide text-white">
              Chat
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#181C2B] transition cursor-pointer ml-auto"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Top 2 Items: Home & Compare AIs */}
        <div className="px-2 pt-2 space-y-0.5">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#151928] hover:text-white transition"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <img
                src="/assets/images/onechat.png"
                alt="Home"
                className="w-full h-full object-contain"
              />
            </div>

            {isSidebarOpen && <span className="text-[13.5px]">Home</span>}
          </a>
          <a
            href="/compare-ai"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#151928] hover:text-white transition"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[#6366F1]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m16 3 4 4-4 4" />
                <path d="M20 7H4" />
                <path d="m8 21-4-4 4-4" />
                <path d="M4 17h16" />
              </svg>
            </div>
            {isSidebarOpen && (
              <span className="text-[13.5px]">Compare AIs</span>
            )}
          </a>
        </div>

        {/* Major Models List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-[#1B1F30]">
          {MAJOR_PROVIDERS.map((item) => {
            const isSelected =
              selectedProvider.toLowerCase() === item.name.toLowerCase();
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleModelSidebarClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer ${
                  isSelected
                    ? "bg-[#6342E8]/25 border border-[#8B5CF6]/40 text-[#C4B5FD] font-semibold"
                    : "text-gray-300 hover:bg-[#151928] hover:text-white border border-transparent"
                }`}
                title={item.name}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                {isSidebarOpen && (
                  <span className="text-[13.5px] truncate">{item.name}</span>
                )}
              </button>
            );
          })}

          {/* Model History Section (Exact Flutter: "Your <Model> History") */}
          {isSidebarOpen && (
            <div className="pt-4 mt-3 border-t border-[#1B1F30]/70">
              <div className="px-2 mb-2">
                <span className="text-[12px] font-bold text-white tracking-wide">
                  Your {selectedProvider} History
                </span>
              </div>

              {isLoadingHistory ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  Loading history...
                </div>
              ) : historyList.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No recent chats
                </div>
              ) : (
                <div className="space-y-0.5">
                  {historyList.map((hist) => {
                    const isCurrent = currentChatId === hist._id;
                    return (
                      <button
                        key={hist._id}
                        type="button"
                        onClick={() => {
                          setCurrentChatId(hist._id);
                          loadChatById(hist._id);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition truncate cursor-pointer ${
                          isCurrent
                            ? "bg-[#181C2B] text-white font-medium"
                            : "text-gray-400 hover:bg-[#121522] hover:text-gray-200"
                        }`}
                      >
                        <span className="truncate">
                          {hist.title || "Untitled Chat"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA (EXACT MATCH WITH FLUTTER IMAGE 1) */}
      <div className="flex-1 flex flex-col h-full bg-[#08090E] relative overflow-hidden">
        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-28 py-8 space-y-6 scrollbar-thin scrollbar-thumb-[#1B1F30]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#121522] border border-[#252A40] flex items-center justify-center mb-4 shadow-xl">
                <Image
                  src={
                    PROVIDER_ICONS[selectedProvider] ||
                    "/assets/images/deepseek1.png"
                  }
                  alt={selectedProvider}
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {selectedProvider}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Start chatting with {selectedModel.name}.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={idx}
                    className={`w-full flex ${isUser ? "justify-end" : "justify-start"} group relative`}
                  >
                    {isUser ? (
                      /* USER MESSAGE: EXACT FLUTTER AppThemeColors.activeHomeBg (0xFF1E1B38) PILL ON THE RIGHT */
                      <div className="max-w-[70%] rounded-[18px] px-4 py-2 bg-[#1E1B38] text-[14.5px] text-white shadow-md whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      /* ASSISTANT MESSAGE: ON THE LEFT WITH MODEL HEADER */
                      <div className="w-full max-w-[850px] space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Image
                            src={
                              PROVIDER_ICONS[selectedProvider] ||
                              "/assets/images/deepseek1.png"
                            }
                            alt={selectedProvider}
                            width={18}
                            height={18}
                            className="object-contain"
                          />
                          <span className="text-xs font-semibold text-gray-300">
                            {selectedProvider}
                          </span>
                        </div>
                        <FormattedAiResponse content={msg.content} />
                        {msg.content && !isStreaming && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-2">
                            <CopyButton text={msg.content} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 3. FLUTTER-STYLE SEARCH INPUT CONTAINER (MATCHING IMAGE 1) */}
        <div className="px-4 pb-6 pt-2 bg-[#08090E]">
          <div className="max-w-[850px] mx-auto rounded-[20px] bg-[#0E1220] border border-[#1E253A] shadow-2xl p-3 flex flex-col gap-2">
            {/* File attachment preview */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#181C2B] px-3 py-1 rounded-xl text-xs"
                  >
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Text Area */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message ${selectedProvider}...`}
              className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder-gray-500 px-1 py-1"
              disabled={isStreaming}
            />

            {/* Bottom Actions Row matching Image 1 */}
            <div className="flex items-center justify-between pt-1">
              {/* Left Action Button (Only DeepThink - Search removed) */}
              <div className="flex items-center gap-2">
                {selectedProvider === "DeepSeek" && (
                  <button
                    type="button"
                    onClick={() => setIsDeepThinkActive(!isDeepThinkActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isDeepThinkActive
                        ? "bg-[#2563EB]/25 text-[#60A5FA] border border-[#3B82F6]/50"
                        : "bg-[#141A2D] text-gray-300 hover:bg-[#1C243E] border border-[#232B45]"
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>DeepThink</span>
                  </button>
                )}
              </div>

              {/* Right Side: Model Name Dropdown, Attachment, Send Button */}
              <div className="flex items-center gap-3">
                {/* Model Selector Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSubModelDropdown(!openSubModelDropdown);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <span>{selectedModel.name.replace("DeepSeek ", "")}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {openSubModelDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#121522] border border-[#252A40] rounded-xl shadow-2xl py-1.5 z-50">
                      {(PROVIDER_MODELS[selectedProvider] || []).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(m);
                            setOpenSubModelDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs transition flex items-center text-gray-300 hover:bg-[#181C2B] hover:text-white cursor-pointer"
                        >
                          <span className="truncate">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachment Clip */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files)
                      setSelectedFiles(Array.from(e.target.files));
                  }}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!prompt.trim() || isStreaming}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                    prompt.trim() && !isStreaming
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-[#1E253A] text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#08090E]" />}>
      <AiChatInner />
    </Suspense>
  );
}
