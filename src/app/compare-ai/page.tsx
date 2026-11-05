"use client";

import React, { useState, useEffect, useRef, Suspense, DragEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronDown,
  Plus,
  Mic,
  ArrowUp,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCheck,
  X,
  FileText,
  Lock,
  Zap,
  Image as ImageIcon,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import { extractTextFromFile } from "@/lib/extractFileText";
import {
  PROVIDER_MODELS,
  AIModelItem,
} from "@/constants/providerModelsHelper";
import { getApiBase } from "@/lib/apiBase";

interface SearchResult {
  title: string;
  url: string;
  content?: string;
  snippet?: string;
  domain?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  searchResults?: SearchResult[];
}

interface ActiveProviderState {
  provider: string;
  selectedModel: AIModelItem;
  isEnabled: boolean;
  messages: ChatMessage[];
  isStreaming: boolean;
  openDropdown: boolean;
  chatId?: string; // Backend chat tracking[cite: 1]
}

// Basic Plan Allowed Models[cite: 1]
const BASIC_TEXT_MODELS: Record<string, string[]> = {
  ChatGPT: ['GPT 5.6 Terra'],
  Gemini: ['Gemini 3.8 Flash'],
  Claude: ['Claude Sonnet 5'],
  DeepSeek: ['DeepSeek V4 Pro'],
  Llama: ['Llama 4 Maverick'],
  'Meta Muse': ['Muse Spark 1.3'],
  Perplexity: ['Perplexity Sonar Deep Research', 'Perplexity Sonar'],
  Grok: ['Grok 4.6', 'Grok 4.20 Non-Reasoning'],
  Kimi: ['Kimi K3'],
  Mistral: ['Mistral Medium 3.5'],
  Qwen: ['Qwen 3.8 27B'],
  MiniMax: ['MiniMax M3'],
  MiMo: ['MiMo V2.5 Pro'],
  GLM: ['GLM 5.3'],
  Nemotron: ['NVIDIA Nemotron 3 Ultra'],
};

const PROVIDER_ICONS: Record<string, string> = {
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

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get("token");
    if (urlToken && urlToken.trim().length > 10) {
      localStorage.setItem("flutter.user_token", JSON.stringify(urlToken.trim()));
      searchParams.delete("token");
      const newQuery = searchParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "") + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      return urlToken.trim();
    }
  } catch (_) {}

  const candidateKeys = ["flutter.user_token", "token", "authToken", "user_token"];
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



// Citation Badge and Hover Popup Card (matching ai-chat)
function CitationBadgeHover({
  index,
  extraCount = 0,
  searchResults,
}: {
  index: number;
  extraCount?: number;
  searchResults?: SearchResult[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = Math.max(0, index - 1);
  const sources = searchResults
    ? searchResults.slice(start, start + extraCount + 1)
    : [];

  const source = sources[activeSubIndex] || sources[0];

  const domain =
    source?.domain?.replace(/^www\./, "") ||
    (() => {
      try {
        return source?.url ? new URL(source.url).hostname.replace(/^www\./, "") : "";
      } catch {
        return source?.url || "";
      }
    })();

  const faviconUrl = domain
    ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
    : "";

  let displayDomain = domain;
  if (domain.includes(".")) {
    const parts = domain.split(".");
    if (parts.length > 1) {
      displayDomain = parts[parts.length - 2];
    }
  }
  if (!displayDomain) displayDomain = `${index}`;

  const badgeLabel = extraCount > 0 ? `${displayDomain} +${extraCount}` : displayDomain;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClickBadge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (source?.url) {
      window.open(source.url, "_blank");
    }
  };

  return (
    <span
      className="relative inline-block mx-1 align-baseline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClickBadge}
        className="inline-flex items-center px-2 py-0.5 rounded-[12px] bg-[#E8EAED] hover:bg-[#dadce0] text-[11px] font-semibold text-[#5F6368] transition cursor-pointer select-none leading-none"
      >
        {badgeLabel}
      </button>

      {isOpen && source && (
        <div
          className="absolute z-50 left-0 top-full mt-2 w-[290px] sm:w-[320px] bg-white text-gray-900 rounded-[14px] border border-[#E8E8E8] shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-3 text-left animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {sources.length > 1 && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F0F0] text-[12px] text-[#7A7A7A]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={activeSubIndex === 0}
                  onClick={() => setActiveSubIndex((prev) => Math.max(0, prev - 1))}
                  className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ‹
                </button>
                <span className="font-medium text-[#6E6B67]">
                  {activeSubIndex + 1}/{sources.length}
                </span>
                <button
                  type="button"
                  disabled={activeSubIndex === sources.length - 1}
                  onClick={() =>
                    setActiveSubIndex((prev) => Math.min(sources.length - 1, prev + 1))
                  }
                  className="w-5 h-5 rounded hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ›
                </button>
              </div>
              <span className="text-[11.5px] text-[#7A7A7A]">
                {sources.length} sources
              </span>
            </div>
          )}

          <div
            className="flex items-center gap-2 mb-2 cursor-pointer group"
            onClick={() => window.open(source.url, "_blank")}
          >
            <div className="w-[18px] h-[18px] rounded bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt={domain}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-[10px] font-bold text-[#5048E5]">
                  {(domain.charAt(0) || "S").toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[12px] font-medium text-[#7A7A7A] group-hover:text-[#5048E5] transition truncate">
              {domain}
            </span>
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[14px] font-semibold text-[#2C2C2C] hover:text-[#5048E5] leading-snug mb-1.5 transition line-clamp-2 no-underline"
          >
            {source.title || domain}
          </a>

          {(source.snippet || source.content) && (
            <p className="text-[12px] text-[#6F6F6F] leading-relaxed line-clamp-3 mb-0">
              {source.snippet || source.content}
            </p>
          )}
        </div>
      )}
    </span>
  );
}

// Markdown with Citations component matching ai-chat's exact Typography & Styles
function FormattedAiResponse({
  content,
  isStreaming,
  searchResults,
}: {
  content: string;
  isStreaming?: boolean;
  searchResults?: SearchResult[];
}) {
  if (!content) {
    if (isStreaming) {
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
    return null;
  }

  if (content === "Stopped") {
    return (
      <div className="py-2 text-sm text-gray-400 italic flex items-center gap-1.5">
        <span>Stopped</span>
      </div>
    );
  }

  // Format thinking tags for DeepSeek
  let formattedContent = content;
  if (formattedContent.includes("<think>") && !formattedContent.includes("</think>")) {
    formattedContent = formattedContent.replace("<think>", "### 🧠 Thinking...\n\n---\n\n");
  } else {
    formattedContent = formattedContent
      .replace(/<think>/g, "### 🧠 Thinking Process\n\n---\n\n")
      .replace(/<\/think>/g, "\n\n---\n\n");
  }

  // Turn [1] or [1][2] citations into our citation tokens
  // Matching Flutter's _linkifyReferences and [cite:X]
  formattedContent = formattedContent.replace(
    /\[(\d+)\]/g,
    "[cite:$1]"
  );

  return (
    <div className="prose prose-invert max-w-none text-[15.5px] leading-[1.7] font-normal text-[#E2E8F0] selection:bg-purple-600/40">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings matching Flutter's typography (h1: 24px bold, h2: 20px w800, h3: 18px w600)
          h1: ({ node, ...props }) => (
            <h1 className="text-[24px] font-bold text-white mt-6 mb-3 tracking-tight leading-snug" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-[20px] font-extrabold text-white mt-5 mb-2.5 tracking-tight leading-snug" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-[18px] font-bold text-white mt-4 mb-2 tracking-tight leading-snug" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-[17px] font-semibold text-white mt-3.5 mb-1.5" {...props} />
          ),
          // Tables matching Flutter's exact Markdown table styling with borders and padding
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-4 rounded-xl border border-[#1B1F30] bg-[#0E101D]">
              <table className="w-full border-collapse text-left text-[14px]" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#121524] border-b border-[#1B1F30] text-white font-semibold" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#1B1F30]/70" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#161A2C]/60 transition" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-white tracking-wide border-r border-[#1B1F30] last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3.5 text-[#E2E8F0] leading-relaxed border-r border-[#1B1F30] last:border-r-0 align-top" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            // Render children with custom citation detection
            return (
              <p className="mb-3.5 leading-[1.7] text-[#E2E8F0]" {...props}>
                {React.Children.map(children, (child) => {
                  if (typeof child === "string") {
                    // Check for [cite:X]
                    const parts = child.split(/(\[cite:\d+\])/g);
                    if (parts.length > 1) {
                      return parts.map((part, pIdx) => {
                        const m = part.match(/\[cite:(\d+)\]/);
                        if (m) {
                          const idx = parseInt(m[1], 10);
                          return (
                            <CitationBadgeHover
                              key={pIdx}
                              index={idx}
                              searchResults={searchResults}
                            />
                          );
                        }
                        return part;
                      });
                    }
                  }
                  return child;
                })}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-3.5 space-y-1.5 text-[#E2E8F0]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 text-[#E2E8F0]" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-[1.7]" {...props}>
              {React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  const parts = child.split(/(\[cite:\d+\])/g);
                  if (parts.length > 1) {
                    return parts.map((part, pIdx) => {
                      const m = part.match(/\[cite:(\d+)\]/);
                      if (m) {
                        const idx = parseInt(m[1], 10);
                        return (
                          <CitationBadgeHover
                            key={pIdx}
                            index={idx}
                            searchResults={searchResults}
                          />
                        );
                      }
                      return part;
                    });
                  }
                }
                return child;
              })}
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[#181C2B] text-[#E0A8FF] font-mono text-[13px] border border-[#252A40]"
                  {...props}
                />
              );
            }
            return (
              <pre className="p-3.5 rounded-xl bg-[#0F111C] border border-[#22273D] overflow-x-auto text-[13px] text-gray-200 my-3 font-mono">
                <code {...props} />
              </pre>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-[#8B5CF6] pl-4 py-1 my-3 bg-[#121522] rounded-r-lg text-gray-300 italic"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9386FF] hover:text-[#B4A8FF] underline font-medium"
            />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
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
    <button onClick={handleCopy} className="p-1.5 rounded-lg bg-[#181C2B] border border-[#252A40] text-gray-400 hover:text-white hover:bg-[#22273D] transition shadow-md cursor-pointer" title="Copy text">
      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CompareAiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Plans & Limits State[cite: 1]
  const [userPlan, setUserPlan] = useState<string>("basic");
  const [requestsUsed, setRequestsUsed] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(50);

  // File Extraction State[cite: 1]
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileContext, setFileContext] = useState<string>(""); 
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // UI State
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const [soloProvider, setSoloProvider] = useState<string | null>(null);
  const [openDropdownProvider, setOpenDropdownProvider] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllersRef = useRef<Record<string, AbortController | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const paneScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasTriggeredRef = useRef(false);

    const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  };
  // State: Default ખાલી રાખો, useEffect માં Cookie માંથી ભરાશે
  const [providerPanes, setProviderPanes] = useState<ActiveProviderState[]>([]);
  useEffect(() => {
    // 1. Cookie માંથી મોડેલ્સ અને પ્રોમ્પ્ટ વાંચો
    let selectedList: string[] = [];
    const modelsCookie = getCookie("compare_selected_models") || (typeof window !== "undefined" ? localStorage.getItem("compare_selected_models") : null);
    const promptCookie = getCookie("compare_initial_prompt") || (typeof window !== "undefined" ? localStorage.getItem("compare_initial_prompt") : null);
    if (modelsCookie) {
      try {
        const parsed = JSON.parse(modelsCookie);
        if (Array.isArray(parsed) && parsed.length > 0) {
          selectedList = parsed;
        }
      } catch (_) {}
    }
    // 2. જો કોઈ ડાયરેક્ટ /compare-ai ખોલે (કોઈ સિલેક્શન કે પ્રોમ્પ્ટ વગર), તો /multi-chat પર મોકલો
    if (!selectedList.length && !promptCookie) {
      if (typeof window !== "undefined") {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        window.location.href = isLocal ? "http://localhost:50505/#/multi-chat" : "/multi-chat";
      }
      return;
    }
    if (!selectedList.length) {
      selectedList = ["ChatGPT","Claude"];
    }
    // 3. ફક્ત સિલેક્ટ થયેલા જ મોડેલ્સ (2 હોય તો ફક્ત 2 જ) સેટ કરો
    const initialPanes: ActiveProviderState[] = selectedList.map((item) => {
      let matchedProvider = item;
      let matchedModel: AIModelItem = PROVIDER_MODELS[item]?.[0] || PROVIDER_MODELS["ChatGPT"][0];
      for (const prov of Object.keys(PROVIDER_MODELS)) {
        if (prov.toLowerCase() === item.toLowerCase()) {
          matchedProvider = prov;
          matchedModel = PROVIDER_MODELS[prov][0];
          break;
        }
        const found = PROVIDER_MODELS[prov]?.find(
          (m) => m.name.toLowerCase() === item.toLowerCase() || m.slug.toLowerCase() === item.toLowerCase()
        );
        if (found) {
          matchedProvider = prov;
          matchedModel = found;
          break;
        }
      }
      return {
        provider: matchedProvider,
        selectedModel: matchedModel,
        isEnabled: true,
        messages: [],
        isStreaming: false,
        openDropdown: false,
      };
    });
    setProviderPanes(initialPanes);
     // 4. Prompt ઓટોમેટિક Generation માટે મોકલો (Analyze Data ની જેમ સીધું સ્ટાર્ટ)
    const promptToTrigger =
      promptCookie ||
      (typeof window !== "undefined"
        ? localStorage.getItem("compare_initial_prompt")
        : "") ||
      searchParams.get("prompt") ||
      "";
    if (promptToTrigger && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      // Cookie અને LocalStorage બંને સાફ કરો
      document.cookie = "compare_initial_prompt=; path=/; max-age=0";
      if (typeof window !== "undefined") {
        localStorage.removeItem("compare_initial_prompt");
      }
      // Analyze Data ની જેમ થોડો 150ms નો સમય આપીને સીધું ફાયર કરો
      setTimeout(() => {
        handleSendPrompt(promptToTrigger, initialPanes);
      }, 150);
    }
  }, []);

   useEffect(() => {
    const fetchPlanData = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        // 🔥 Flutter વાળો exact endpoint: /api/users/me
        const res = await fetch(`${getApiBase()}/api/users/me`, {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        });
        const data = await res.json();
        
        // Flutter format: data?.data?.user અથવા data?.user
        const userData = data?.data?.user || data?.user;
        if (userData) {
          const plan = (userData.plan || "basic").toLowerCase().trim();
          setUserPlan(plan);
          
          const limit = (plan === "pro_max" || plan === "premium") ? 100 : 50;
          setDailyLimit(limit);
          
          const used = userData.todayRequestCount || userData.dailyRequestsUsed || 0;
          setRequestsUsed(used);
        }
      } catch (e) {
        console.error("Failed to fetch plan from /api/users/me:", e);
      }
    };
    fetchPlanData();
  }, []);

  const isModelAccessible = (provider: string, modelName: string) => {
    if (userPlan === "pro_max" || userPlan === "pro" || userPlan === "premium") return true;
    const allowed = BASIC_TEXT_MODELS[provider] || [];
    const defaultModelName = PROVIDER_MODELS[provider]?.[0]?.name;
    if (defaultModelName && defaultModelName.toLowerCase().trim() === modelName.toLowerCase().trim()) {
      return true;
    }
    return allowed.some(
      (m) => m.toLowerCase().trim() === modelName.toLowerCase().trim()
    );
  };

  const isImageFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    return ["png", "jpg", "jpeg", "webp", "gif", "heic"].includes(ext) || file.type.startsWith("image/");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const reprocessFiles = async (files: File[]) => {
    if (files.length === 0) {
      setFileContext("");
      setAttachedImageBase64(null);
      if (attachedImagePreview) {
        URL.revokeObjectURL(attachedImagePreview);
        setAttachedImagePreview(null);
      }
      return;
    }
    setIsProcessingFile(true);
    try {
      let combinedText = "";
      let foundImage = false;
      for (const file of files) {
        if (isImageFile(file)) {
          if (!foundImage) {
            const base64 = await fileToBase64(file);
            setAttachedImageBase64(base64);
            setAttachedImagePreview(URL.createObjectURL(file));
            foundImage = true;
          }
          combinedText += `\n\n--- Attached Image: ${file.name} ---`;
        } else {
          const text = await extractTextFromFile(file);
          combinedText += `\n\n--- Attached File: ${file.name} ---\n${text}`;
        }
      }
      if (!foundImage) {
        setAttachedImageBase64(null);
        if (attachedImagePreview) {
          URL.revokeObjectURL(attachedImagePreview);
          setAttachedImagePreview(null);
        }
      }
      setFileContext(combinedText);
    } catch (e) {
      console.error("Error reprocessing files:", e);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);

    const combinedFiles = [...selectedFiles];
    for (const f of newFiles) {
      if (!combinedFiles.some((existing) => existing.name === f.name && existing.size === f.size)) {
        combinedFiles.push(f);
      }
    }
    setSelectedFiles(combinedFiles);
    await reprocessFiles(combinedFiles);
  };

  // Drag and Drop Handlers[cite: 2]
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (indexToRemove: number) => {
    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);
    reprocessFiles(updated);
  };

  // Ensure Chat ID (Backend History Saving)[cite: 1]
  const ensureChatId = async (provider: string, currentChatId?: string) => {
    if (currentChatId) return currentChatId;
    const token = getAuthToken();
    if (!token) return null;
    try {
      // 🔥 Flutter ApiService.createChatHistory વાળો exact endpoint
      const res = await fetch(`${getApiBase()}/api/chat-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Multi-Chat: ${provider}`,
          tags: ["multi-chat", provider.toLowerCase()],
          ischatehistry: false, // Flutter exact key
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      // Flutter format: data['data']['_id']
      return data?.data?._id || data?._id || null;
    } catch (e) {
      console.error("Chat history creation failed:", e);
      return null;
    }
  };

  // Build Context matching ai-chat's exact format and emojis
  const buildPromptWithContext = (currentPrompt: string, historyMessages: ChatMessage[], fileContent?: string): string => {
    const historyPairs: string[] = [];
    for (let i = 0; i < historyMessages.length; i++) {
      const msg = historyMessages[i];
      if (msg.role === "user" && i + 1 < historyMessages.length) {
        const nextMsg = historyMessages[i + 1];
        if (nextMsg.role === "assistant" && nextMsg.content) {
          historyPairs.push(`User: ${msg.content}\nAI: ${nextMsg.content}`);
        }
      }
    }
    const lines: string[] = [];
    lines.push(currentPrompt.trim());
    lines.push("\n{{historyData}} Please answer casually with emojis, and mention anything about markdown or formatting.");
    if (fileContent && fileContent.trim()) {
      lines.push(`\n---\nFile Content:\n${fileContent.trim()}`);
    }
    if (historyPairs.length > 0) {
      lines.push("\nConversation:");
      const recentPairs = historyPairs.length > 6 ? historyPairs.slice(-6) : historyPairs;
      for (const pair of recentPairs) lines.push(pair);
    }
    return lines.join("\n");
  };

  const streamToPane = async (
    promptText: string,
    paneIndex: number,
    provider: string,
    modelItem: AIModelItem,
    currentChatId?: string,
    promptId?: string,
    imageUrl?: string | null,
    displayContent?: string,
    fileContent?: string
  ) => {
    const token = getAuthToken();
    const base = getApiBase();
    
    // 1. Get/Create Chat ID for history (Safely read currentChatId without accessing state directly)
    let chatId = await ensureChatId(provider, currentChatId);

    const userMsgContent = displayContent || promptText;
    const historyMsgs = providerPanes[paneIndex]?.messages || [];
    const promptWithContext = buildPromptWithContext(promptText, historyMsgs, fileContent);

    setProviderPanes((prev) => {
      if (!prev[paneIndex]) return prev;
      const copy = [...prev];
      copy[paneIndex] = {
        ...copy[paneIndex],
        chatId: chatId,
        isStreaming: true,
        messages: [
          ...copy[paneIndex].messages,
          { role: "user", content: userMsgContent, imageUrl: imageUrl || undefined },
          { role: "assistant", content: "" },
        ],
      };
      return copy;
    });

    const controller = new AbortController();
    abortControllersRef.current[provider] = controller;

    try {
      const payload: Record<string, any> = {
        prompt: promptWithContext,
        modelId: modelItem.id,
        chatId: chatId,
        ischatehistry: false,
        max_tokens: 4000,
        source: "multi-chat-text",
        promptId: promptId || `${Date.now()}_${provider}`,
        system_prompt: "You are a helpful AI assistant in OneChat AI.",
      };
      if (imageUrl) {
        payload.imageUrl = imageUrl;
      }

      const res = await fetch(`${base}/api/tools/ai/general-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `${provider} is temporarily unavailable (${res.status}).`;
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}

        const lowerMsg = errorMsg.toLowerCase();
        if (
          lowerMsg.includes("support image") ||
          lowerMsg.includes("image input") ||
          lowerMsg.includes("filter by image") ||
          lowerMsg.includes("no endpoints found that support image")
        ) {
          errorMsg = "This model does not support image analysis. Please try a vision-supported model like ChatGPT, Gemini, Claude, or Grok.";
        }

        setProviderPanes((prev) => {
          if (!prev[paneIndex]) return prev;
          const copy = [...prev];
          const msgs = [...copy[paneIndex].messages];
          msgs[msgs.length - 1] = { role: "assistant", content: `⚠️ ${errorMsg}` };
          copy[paneIndex] = { ...copy[paneIndex], messages: msgs, isStreaming: false };
          return copy;
        });
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
          if (!trimmed) return;

          // 🔥 Skip SSE keep-alive comments (lines starting with ":")
          if (trimmed.startsWith(":")) return;

          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.replace(/^data:\s*/, "");
            if (dataContent !== "[DONE]") {
              try {
                const parsed = JSON.parse(dataContent);
                let textPiece = parsed.chunk ?? parsed.text ?? parsed.content ?? parsed.message ?? "";
                if (typeof textPiece === "string") {
                  accumulated += textPiece;
                }
              } catch (_) { 
                accumulated += dataContent; 
              }
            }
          }
        });
        
        // Response ના શરુઆતમાં જો કોઈ લીડિંગ કોલન (:) હોય તો તેને ક્લીન કરો
        const cleanedResponse = accumulated.replace(/^:+/, "").trimStart();

        setProviderPanes((prev) => {
          const copy = [...prev];
          const msgs = [...copy[paneIndex].messages];
          msgs[msgs.length - 1] = { role: "assistant", content: cleanedResponse };
          copy[paneIndex] = { ...copy[paneIndex], messages: msgs };
          return copy;
        });

        // 🔥 Auto Scroll to bottom as text streams (Flutter like scrollToBottom)
        if (paneScrollRefs.current[provider]) {
          const el = paneScrollRefs.current[provider];
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        setProviderPanes((prev) => {
          if (!prev[paneIndex]) return prev;
          const copy = [...prev];
          const msgs = [...copy[paneIndex].messages];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
            const lastMsg = msgs[msgs.length - 1];
            if (!lastMsg.content || lastMsg.content.trim() === "") {
              msgs[msgs.length - 1] = { role: "assistant", content: "Stopped" };
              copy[paneIndex] = { ...copy[paneIndex], messages: msgs };
            }
          }
          return copy;
        });
      } else {
        console.error(`Stream error for ${provider}:`, e);
        setProviderPanes((prev) => {
          if (!prev[paneIndex]) return prev;
          const copy = [...prev];
          const msgs = [...copy[paneIndex].messages];
          if (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant" && !msgs[msgs.length - 1].content) {
            msgs[msgs.length - 1] = { role: "assistant", content: `⚠️ Request failed. Please try again.` };
            copy[paneIndex] = { ...copy[paneIndex], messages: msgs };
          }
          return copy;
        });
      }
    } finally {
      setProviderPanes((prev) => {
        const copy = [...prev];
        copy[paneIndex] = { ...copy[paneIndex], isStreaming: false };
        return copy;
      });
      abortControllersRef.current[provider] = null;
    }
  };

   const handleSendPrompt = (promptText: string, targetPanes?: ActiveProviderState[]) => {
    let finalPrompt = promptText.trim();
    const activeImage = attachedImageBase64;
    
    // Auto-prompt when only file or image is sent without text
    if (!finalPrompt && activeImage) {
      finalPrompt = "What is in this image? Please describe and analyze it.";
    } else if (!finalPrompt && fileContext) {
      finalPrompt = "Please analyze the attached file content and provide key insights.";
    }

    if (!finalPrompt && selectedFiles.length === 0 && !activeImage) return;

    const currentFileContent = fileContext;

    // Visual Display for User message bubble
    let displayContent = finalPrompt;
    if (selectedFiles.length > 0) {
      const fileNames = selectedFiles.map((f) => `📎 ${f.name}`).join("\n");
      displayContent = displayContent ? `${fileNames}\n\n${displayContent}` : fileNames;
    }

    const activePanes = targetPanes || providerPanes;
    const activeStreamCount = activePanes.filter(p => p.isEnabled).length;
    const remainingRequests = dailyLimit - requestsUsed;
    if (remainingRequests < activeStreamCount && dailyLimit > 0) {
      alert(`Daily limit reached! You only have ${Math.max(0, remainingRequests)} requests left, but selected ${activeStreamCount} models. Please upgrade your plan.`);
      return;
    }

    setPrompt("");
    setSelectedFiles([]); 
    setFileContext("");
    setAttachedImageBase64(null);
    if (attachedImagePreview) {
      URL.revokeObjectURL(attachedImagePreview);
      setAttachedImagePreview(null);
    }
    setRequestsUsed(prev => prev + activeStreamCount);

    const batchPromptId = Date.now().toString();

    activePanes.forEach((pane, idx) => {
      if (pane.isEnabled) {
        if (isModelAccessible(pane.provider, pane.selectedModel.name)) {
          const modelPromptId = `${batchPromptId}_${pane.provider}`;
          streamToPane(finalPrompt, idx, pane.provider, pane.selectedModel, pane.chatId, modelPromptId, activeImage, displayContent, currentFileContent);
        }
      }
    });
  };

  // Voice Input (Speech to Text)[cite: 2]
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition is not supported in this browser.');
    if (isListening) return setIsListening(false);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          setPrompt(prev => prev + (prev.length > 0 ? ' ' : '') + event.results[i][0].transcript);
        }
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  };

  const isAnyStreaming = providerPanes.some((p) => p.isStreaming);
  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" });

  useEffect(() => {
    const handleOutside = () => setOpenDropdownProvider(null);
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

   
  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#08090E] text-white select-text relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header Bar */}
      <header className="min-h-12 py-2 px-3 sm:px-4 flex items-center justify-between gap-2   shrink-0 relative z-30 mt-2">
        <div className="flex items-center shrink-0">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                if (window.history.length > 1 && document.referrer && document.referrer.startsWith(window.location.origin)) {
                  router.back();
                  return;
                }
                router.push("/");
              }
            }}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#261D5A] border border-[#3B3363] text-[#A78BFA] text-[12px] sm:text-[13px] font-semibold hover:bg-[#322774] transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Back to Home</span>
            <span className="inline xs:hidden sm:hidden">Home</span>
          </button>
        </div>

       <div className="flex-1 text-center px-1 min-w-0">
  <h1 className="text-[16px] sm:text-xl md:text-2xl font-extrabold text-white tracking-wide leading-tight break-words">
    Compare AI Models Side by Side
  </h1>
</div>

        <div className="w-8 sm:w-20 shrink-0" />
      </header>

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#5048E5]/20 backdrop-blur-sm border-4 border-dashed border-[#5048E5] m-4 rounded-3xl">
          <div className="flex flex-col items-center gap-4 bg-[#121522] p-8 rounded-2xl shadow-2xl">
            <Plus className="w-12 h-12 text-[#5048E5] animate-bounce cursor-pointer" />
            <h2 className="text-2xl font-bold">Drop files to attach</h2>
            <p className="text-gray-400 text-sm">Supports Images (PNG, JPG, WebP), PDF, Word, Excel, CSV, TXT, JSON, MD</p>
          </div>
        </div>
      )}

      {/* Main Multi-Chat Area */}
      <div className="flex-1 relative overflow-hidden px-4 pt-3 pb-2">
        {providerPanes.length > 2 && (
          <button onClick={scrollLeft} className="absolute left-1 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#181C2B]/90 hover:bg-[#252A40] text-white shadow-xl transition border border-[#252A40] cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {providerPanes.length > 2 && (
          <button onClick={scrollRight} className="absolute right-1 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-[#181C2B]/90 hover:bg-[#252A40] text-white shadow-xl transition border border-[#252A40]  cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div ref={scrollContainerRef} className="flex h-full gap-2 md:gap-4 overflow-x-auto overflow-y-hidden scrollbar-none transition-all duration-500 ease-in-out">
          {providerPanes.map((pane, index) => {
            const isSolo = soloProvider === pane.provider;
            const isCollapsed = !pane.isEnabled || (soloProvider !== null && !isSolo);

            if (isCollapsed) {
              return (
                <div key={pane.provider + index} style={{ width: "65px", minWidth: "65px", transition: "all 0.45s" }} className="flex flex-col items-center h-full rounded-[12px] bg-[#121522] border border-[#252A40] py-3.5 px-1.5 shrink-0 shadow-xl select-none">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                    <Image src={PROVIDER_ICONS[pane.provider] || "/assets/images/home_chatGPT.png"} alt={pane.provider} width={24} height={24} className="rounded object-contain opacity-70" />
                  </div>
                  <button 
                    onClick={() => {
                      if (soloProvider) setSoloProvider(null);
                      setProviderPanes(prev => { 
                        const copy = [...prev]; 
                        copy[index].isEnabled = true; 
                        return copy; 
                      });
                    }} 
                    className="p-2 rounded-md bg-[#181C2B] hover:bg-[#252A40] text-gray-300 hover:text-white transition shadow-sm cursor-pointer"
                    title={`Add ${pane.provider} to view`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            const isHovered = hoveredProvider === pane.provider;
            const hasActiveHover = hoveredProvider !== null && !soloProvider;
            
            // Flutter Dynamic Width: Mobile ma full width (85vw - 92vw) or Desktop ma dynamic!
            let columnStyle: React.CSSProperties = { 
              minWidth: soloProvider ? "100%" : "88vw", 
              width: soloProvider ? "100%" : "88vw",
              flex: "1 1 0%", 
              transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)" 
            };

            // On larger desktop screens (md and above), use the multi-column width
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
              columnStyle.width = "auto";
              if (soloProvider) {
                columnStyle.minWidth = "100%";
              } else if (hasActiveHover) {
                columnStyle.minWidth = isHovered ? "620px" : "280px";
                columnStyle.flex = isHovered ? "3 1 0%" : "1 1 0%";
              } else {
                columnStyle.minWidth = "340px";
              }
            }

            const accessible = isModelAccessible(pane.provider, pane.selectedModel.name);

            return (
              <div key={pane.provider + index} style={columnStyle} onMouseEnter={() => setHoveredProvider(pane.provider)} onMouseLeave={() => setHoveredProvider(null)} className="flex flex-col h-full rounded-[14px] bg-gradient-to-r from-[#5048E5]/70 to-[#CB6CE6]/70 p-[1.5px] shadow-2xl overflow-hidden relative shrink-0 max-md:w-[88vw] max-md:min-w-[88vw]">
                <div className="flex flex-col h-full rounded-[12px] bg-[#121522] overflow-hidden relative">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#0E101A] border-b border-[#1B1F30] relative z-20 select-none">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        <Image src={PROVIDER_ICONS[pane.provider] || "/assets/images/home_chatGPT.png"} alt={pane.provider} width={26} height={26} className="rounded object-contain" />
                      </div>

                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownProvider(openDropdownProvider === pane.provider ? null : pane.provider);
                          }} 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181C2B] border border-[#252A40] text-xs font-semibold text-white hover:bg-[#22273D] transition shadow-sm truncate max-w-[170px] cursor-pointer"
                        >
                          <span className="truncate">{pane.selectedModel.name}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        </button>
                        
                        {/* Dropdown */}
                        {openDropdownProvider === pane.provider && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-[#121522] border border-[#252A40] rounded-xl shadow-2xl py-1.5 z-50 max-h-80 overflow-y-auto">
                            {(PROVIDER_MODELS[pane.provider] || []).map((m) => {
                              const isLocked = !isModelAccessible(pane.provider, m.name);
                              return (
                                <button 
                                  key={m.id} 
                                  type="button" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProviderPanes(prev => { 
                                      const copy = [...prev]; 
                                      copy[index].selectedModel = m; 
                                      return copy; 
                                    });
                                    setOpenDropdownProvider(null);
                                  }} 
                                  className="w-full text-left px-3 py-2 text-xs transition flex items-center gap-2.5 text-gray-300 hover:bg-[#181C2B] cursor-pointer hover:text-white"
                                >
                                  <Image src={PROVIDER_ICONS[pane.provider]} alt={m.name} width={18} height={18} className="rounded object-contain" />
                                  <span className="truncate flex-1">{m.name}</span>
                                  {isLocked && <Lock className="w-3 h-3 text-[#CB6CE6]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div onClick={() => setProviderPanes(prev => { const copy = [...prev]; copy[index].isEnabled = false; return copy; })} className="w-8 h-4 rounded-full p-0.5 flex items-center transition cursor-pointer shadow-inner shrink-0 bg-[#5A4FF3] justify-end" title="Collapse model">
                        <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                      </div>

                      {/* Flutter Solo Button: Mobile Only (Expand full screen / Exit full screen) */}
                      <button
                        type="button"
                        onClick={() => setSoloProvider(isSolo ? null : pane.provider)}
                        className={`md:hidden p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shrink-0 ${
                          isSolo
                            ? "bg-[#6846FF]/30 border-[#6846FF] text-white"
                            : "bg-[#181C2B] border-[#252A40] text-gray-400 hover:text-white"
                        }`}
                        title={isSolo ? "Show all models" : `Chat with ${pane.provider} only`}
                      >
                        {isSolo ? (
                          <Minimize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Body Messages or Upgrade Card */}
                  {!accessible ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#5A4FF3] flex items-center justify-center shadow-lg shadow-[#5A4FF3]/30 mb-4">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-[15px] font-bold text-white mb-2">{pane.selectedModel.name}</h3>
                      <p className="text-[13px] text-gray-400 mb-5">Upgrade your plan to unlock this model and access the full suite of AI features.</p>
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#5A4FF3] text-white text-sm font-bold shadow-lg shadow-[#5A4FF3]/30 hover:scale-105 transition cursor-pointer">
                        <Zap className="w-4 h-4 fill-white" /> Upgrade Plan
                      </button>
                    </div>
                  ) : (
                    <div 
                      ref={(el) => { paneScrollRefs.current[pane.provider] = el; }}
                      className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1B1F30] relative scroll-smooth select-text"
                    >
                      {pane.messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">Waiting for prompt...</div>
                      ) : (
                        <>
                          {pane.messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col group relative ${msg.role === "user" ? "items-end" : "items-start"}`}>
                              {msg.role === "user" ? (
                                <div className="max-w-[340px] rounded-[18px] px-4 py-2.5 bg-[#181C2B] border border-[#252A40] text-[14.5px] text-white shadow-md whitespace-pre-wrap">
                                  {msg.imageUrl && (
                                    <div className="mb-2.5 overflow-hidden rounded-xl border border-[#252A40] bg-black/40">
                                      <img
                                        src={msg.imageUrl}
                                        alt="Attached preview"
                                        className="max-h-56 w-full object-contain rounded-lg"
                                      />
                                    </div>
                                  )}
                                  {msg.content
                                    .replace(/CURRENT ATTACHED FILE CONTENT[\s\S]*USER INSTRUCTION:\n/g, '')
                                    .replace(/\{\{historyData\}\}[\s\S]*?(?:formatting\.)/i, '')
                                    .trim()}
                                </div>
                              ) : (
                                <div className="w-full text-gray-100 selection:bg-purple-600">
                                  <FormattedAiResponse
                                    content={msg.content}
                                    isStreaming={pane.isStreaming && i === pane.messages.length - 1}
                                    searchResults={msg.searchResults}
                                  />
                                  {/* Hover Action Buttons (Copy) - Niche dekhaadva mate */}
                                  {msg.content && msg.content !== "Stopped" && !pane.isStreaming && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-3">
                                      <CopyButton text={msg.content} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          
                         
                          {pane.isStreaming && (
                            <div className="sticky bottom-0 right-0 flex justify-end mt-4 z-10 w-full bg-gradient-to-t from-[#121522] via-[#121522]/80 to-transparent pt-4 pb-1">
                              <button
                                onClick={() => {
                                  abortControllersRef.current[pane.provider]?.abort();
                                  setProviderPanes((prev) => {
                                    const copy = [...prev];
                                    const msgs = [...copy[index].messages];
                                    if (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
                                      const lastMsg = msgs[msgs.length - 1];
                                      if (!lastMsg.content || lastMsg.content.trim() === "") {
                                        msgs[msgs.length - 1] = { role: "assistant", content: "Stopped" };
                                      }
                                    }
                                    copy[index] = { ...copy[index], messages: msgs, isStreaming: false };
                                    return copy;
                                  });
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181C2B] border border-red-500/30 hover:bg-[#252A40] text-gray-300 transition cursor-pointer shadow-lg"
                                title="Stop generating"
                              >
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                                <span className="text-[12px] font-medium text-gray-300">Stop</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM INPUT BOX */}
      <div className="px-4 pb-3 pt-1 bg-[#08090E] select-none">
        <div className="max-w-[800px] mx-auto rounded-[24px] p-[1.5px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-2xl">
          <div className="bg-[#0E111C] rounded-[22.5px] px-4 py-3 flex flex-col gap-2 border border-[#252A40]">
            
            {/* File Chips */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center">
                {selectedFiles.map((file, idx) => {
                  const isImg = isImageFile(file);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#181C2B] border border-[#252A40] px-3 py-1.5 rounded-xl shrink-0 group hover:border-[#6342E8]/60 transition"
                    >
                      {isImg ? (
                        <div className="w-5 h-5 rounded overflow-hidden relative shrink-0 bg-black/50 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      )}
                      <span className="text-xs text-gray-200 max-w-[130px] truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-gray-400 hover:text-red-400 transition cursor-pointer p-0.5"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {isProcessingFile && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 px-2 py-1 shrink-0 animate-pulse">
                    <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendPrompt(prompt); } }}
              placeholder={isListening ? "Listening..." : "What do you need help with?"}
              className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-gray-400 py-1"
              disabled={isAnyStreaming}
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    handleFileSelect(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.md"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg border border-[#1B1F30] text-gray-400 hover:text-white hover:bg-[#181C2B] transition cursor-pointer"
                  title="Upload attachment (Image, PDF, Word, Excel, CSV, TXT)"
                >
                  <Plus className="w-4 h-4" />
                </button>

               <button 
  type="button" 
  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition bg-[#6342E8] text-white shadow-md shadow-indigo-600/30 cursor-pointer"
>
  Chat
</button>
              </div>

              <div className="flex items-center gap-2">
                {/* Plan Usage Indicator */}
                {/* <div className="text-[10px] text-gray-500 mr-2 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#FBBC05]" /> {requestsUsed} / {dailyLimit}
                </div> */}

                <button type="button" onClick={toggleSpeechRecognition} className={`p-1.5 rounded-lg transition cursor-pointer ${isListening ? "bg-red-500/20 text-red-500 border border-red-500/50" : "text-gray-400 hover:text-white hover:bg-[#181C2B]"}`} title="Voice input">
                  <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleSendPrompt(prompt)}
                  disabled={(!prompt.trim() && selectedFiles.length === 0 && !attachedImageBase64) || isAnyStreaming || isProcessingFile}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    (prompt.trim() || selectedFiles.length > 0 || attachedImageBase64) && !isAnyStreaming && !isProcessingFile
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105"
                      : "bg-[#181C2B] text-gray-500 cursor-not-allowed"
                  }`}
                  title="Send message"
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

export default function CompareAiPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#08090E]" />}>
      <CompareAiContent />
    </Suspense>
  );
}