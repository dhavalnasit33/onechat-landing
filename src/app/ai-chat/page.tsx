"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDropzone } from "react-dropzone";
import {
  ChevronDown,
  Copy,
  CheckCheck,
  ArrowUp,
  Brain,
  X,
  Menu,
  Plus,
  Mic,
  MicOff,
  Globe,
  UploadCloud,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft
} from "lucide-react";
import { PROVIDER_MODELS, AIModelItem } from "@/constants/providerModelsHelper";
import { extractTextFromFile } from "@/lib/extractFileText";
import { ModelSpecificSearchInput } from "./ModelSpecificSearchInput";
import { getApiBase } from "@/lib/apiBase";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// 15 Major Models list
export const MAJOR_PROVIDERS = [
  { name: "ChatGPT", route: "/chatgpt", provider: "openai", icon: "/assets/images/home_chatGPT.png", defaultModel: "GPT 5.6 Terra" },
  { name: "Gemini", route: "/gemini", provider: "google", icon: "/assets/images/home_gemini.png", defaultModel: "Gemini 2.5 Flash" },
  { name: "Claude", route: "/claude", provider: "anthropic", icon: "/assets/images/claude1.png", defaultModel: "Claude Sonnet 5" },
  { name: "DeepSeek", route: "/deepseek", provider: "deepseek", icon: "/assets/images/deepseek1.png", defaultModel: "DeepSeek V4 Pro" },
  { name: "Llama", route: "/llama", provider: "meta", icon: "/assets/images/home_meta_ai.png", defaultModel: "Llama 4 Maverick" },
  { name: "Meta Muse", route: "/muse", provider: "muse", icon: "/assets/images/muse-logo.png", defaultModel: "Meta Muse Pro" },
  { name: "Grok", route: "/grok", provider: "xai", icon: "/assets/images/grok-icon.png", defaultModel: "Grok 4.20" },
  { name: "Perplexity", route: "/perplexity", provider: "perplexity", icon: "/assets/images/home_perplexity.png", defaultModel: "Sonar" },
  { name: "Kimi", route: "/kimi", provider: "kimi", icon: "/assets/images/kimi-icon.png", defaultModel: "Kimi K3" },
  { name: "Mistral", route: "/mistral", provider: "mistral", icon: "/assets/images/mistral1.png", defaultModel: "Mistral Small 2603" },
  { name: "Qwen", route: "/qwen", provider: "qwen", icon: "/assets/images/qwen1.png", defaultModel: "Qwen 3.8 27B" },
  { name: "MiniMax", route: "/minimax", provider: "minimax", icon: "/assets/images/minimax1.png", defaultModel: "MiniMax M3" },
  { name: "MiMo", route: "/mimo", provider: "mimo", icon: "/assets/images/mimo1.png", defaultModel: "MiMo V2.5 Pro" },
  { name: "GLM", route: "/glm", provider: "glm", icon: "/assets/images/glm1.png", defaultModel: "GLM 5.3" },
  { name: "Nemotron", route: "/nemotron", provider: "nemotron", icon: "/assets/images/nemotron1.png", defaultModel: "NVIDIA Nemotron 3..." },
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
  followUps?: string[];
  isThinking?: boolean;
}

interface HistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  is_double?: boolean;
  isDouble?: boolean;
}

// Helpers for Auth and Base URL
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
  const keys = ["flutter.user_token", "token", "authToken", "user_token"];
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val && val !== "null" && val !== "undefined") {
      const cleaned = val.replace(/^"+|"+$/g, "").trim();
      if (cleaned.length > 10) return cleaned;
    }
  }
  return "";
}



function resolveProviderAndModel(param: string | null): { providerName: string; modelItem: AIModelItem } {
  const defaultProvider = "ChatGPT";
  const defaultModel = PROVIDER_MODELS["ChatGPT"]?.[0] || { name: "GPT 5.6 Terra", id: "6a756be690ca2618be6d5f91", slug: "gpt-5.6-terra", icon: "assets/images/chatgpt1.png" };
  if (!param) return { providerName: defaultProvider, modelItem: defaultModel };
  
  const p = param.trim().toLowerCase();
  for (const prov of Object.keys(PROVIDER_MODELS)) {
    const list = PROVIDER_MODELS[prov] || [];
    for (const item of list) {
      if (item.slug.toLowerCase() === p || item.name.toLowerCase() === p || item.id.toLowerCase() === p) {
        return { providerName: prov, modelItem: item };
      }
    }
  }
  
  const provMatch = MAJOR_PROVIDERS.find((item) => item.name.toLowerCase() === p || item.provider.toLowerCase() === p);
  if (provMatch) {
    const list = PROVIDER_MODELS[provMatch.name] || [];
    return { providerName: provMatch.name, modelItem: list[0] || defaultModel };
  }
  return { providerName: defaultProvider, modelItem: defaultModel };
}

// Chain Link SVG matching Flutter's _kSourcesChainLinkSvg
const SourcesChainLinkSvg = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9386FF"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// Sources Pill Button matching Flutter's _buildSourcesPillButton
function SourcesPillButton({
  sources,
  onClick,
}: {
  sources: SearchResult[];
  onClick: () => void;
}) {
  const count = sources.length;
  const sourceColors = ["#E07C54", "#3B82F6", "#EF4444"];
  const displaySources = sources.slice(0, 3);

  const getDomain = (url: string, domain?: string) => {
    if (domain) return domain.replace(/^www\./, "");
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url || "";
    }
  };

  const getInitial = (s: SearchResult, i: number) => {
    const dom = getDomain(s.url, s.domain);
    if (dom) return dom.charAt(0).toUpperCase();
    if (s.title) return s.title.charAt(0).toUpperCase();
    return ["C", "S", "M"][i] || "S";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-transparent hover:bg-[#181C2B] border border-transparent hover:border-[#252A40] transition cursor-pointer group"
    >
      {/* 3 Overlapping Favicon / Initial Circles */}
      <div className="relative w-[34px] h-[18px] flex items-center">
        {displaySources.map((s, i) => {
          const dom = getDomain(s.url, s.domain);
          const initial = getInitial(s, i);
          const color = sourceColors[i % sourceColors.length];
          const faviconUrl = dom
            ? `https://www.google.com/s2/favicons?sz=64&domain=${dom}`
            : "";

          return (
            <div
              key={i}
              className="absolute w-[18px] h-[18px] rounded-full bg-white border border-[#121522] overflow-hidden flex items-center justify-center shadow-sm"
              style={{ left: `${i * 8}px`, zIndex: 10 - i }}
            >
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt={dom}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to letter circle on error
                    (e.target as HTMLElement).style.display = "none";
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<span style="font-size:11px;font-weight:700;color:${color}">${initial}</span>`;
                    }
                  }}
                />
              ) : (
                <span
                  style={{ color }}
                  className="text-[11px] font-bold leading-none select-none"
                >
                  {initial}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <span className="text-[13px] font-medium text-[#B0B0B0] group-hover:text-white transition">
        {count} sources
      </span>
    </button>
  );
}

// Copy Button Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-[#181C2B] transition cursor-pointer" title="Copy">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// Citation Badge and Hover Popup Card (matching Flutter's CitationBadge & _InteractiveCitationHoverCard)
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
      {/* 1. Citation Pill matching Flutter's CitationBadge: bg-[#E8EAED] text-[#5F6368] rounded-[12px] */}
      <button
        type="button"
        onClick={handleClickBadge}
        className="inline-flex items-center px-2 py-0.5 rounded-[12px] bg-[#E8EAED] hover:bg-[#dadce0] text-[11px] font-semibold text-[#5F6368] transition cursor-pointer select-none leading-none"
      >
        {badgeLabel}
      </button>

      {/* 2. White Hover Card Popup matching 1st uploaded image & Flutter's _CitationHoverCard */}
      {isOpen && source && (
        <div
          className="absolute z-50 left-0 top-full mt-2 w-[290px] sm:w-[320px] bg-white text-gray-900 rounded-[14px] border border-[#E8E8E8] shadow-[0_10px_30px_rgba(0,0,0,0.18)] p-3 text-left animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Multiple sources navigation header if extraCount > 0 */}
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

          {/* Favicon + Domain row */}
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

          {/* Title / Headline (Purple/Blue on hover) */}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[14px] font-semibold text-[#2C2C2C] hover:text-[#5048E5] leading-snug mb-1.5 transition line-clamp-2 no-underline"
          >
            {source.title || domain}
          </a>

          {/* Snippet / Content */}
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
            <div className="w-full overflow-x-auto my-3 rounded-xl border border-[#2D3352] bg-[#0E101D] shadow-md scrollbar-thin scrollbar-thumb-[#252A40]">
              <table className="w-full min-w-full border-collapse text-left text-[13px]" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#181C30] border-b border-[#2D3352] text-white font-bold" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#2D3352]/70" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#161A2C]/80 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-bold text-white tracking-wide border-r border-[#2D3352] last:border-r-0 whitespace-nowrap" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 text-[#E2E8F0] leading-snug border-r border-[#2D3352] last:border-r-0 align-middle" {...props} />
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
            <strong className="font-bold text-white tracking-wide" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-white" {...props} />
          ),
          pre: ({ children }: any) => <>{children}</>,
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[#181C2B] text-[#C4B5FD] font-mono text-[13px] border border-[#2D3352]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3.5 rounded-xl bg-[#0F111C] border border-[#2D3352] overflow-x-auto text-[13px] text-gray-200 my-3 font-mono scrollbar-thin scrollbar-thumb-[#252A40]">
                <code className={className} {...props}>
                  {children}
                </code>
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

function AiChatInner() {
  const searchParams = useSearchParams();
    const router = useRouter();

  // State to track if current session is specifically Deep Research tab
  const [isDeepResearchMode, setIsDeepResearchMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const provParam = searchParams.get("model") || searchParams.get("provider");
    const cookieMode = getCookie("chat_deep_research_mode");
    return (
      provParam?.toLowerCase() === "sonar-deep-research" ||
      provParam?.toLowerCase() === "deep_research" ||
      provParam?.toLowerCase() === "deep-research" ||
      cookieMode === "true"
    );
  });

  const initialResolved = (() => {
    if (typeof window === "undefined") return resolveProviderAndModel(null);
    const provParam = searchParams.get("model") || searchParams.get("provider");
    // Deep Research redirect support
    if (
      provParam?.toLowerCase() === "sonar-deep-research" ||
      provParam?.toLowerCase() === "deep_research" ||
      provParam?.toLowerCase() === "deep-research" ||
      (typeof document !== "undefined" && getCookie("chat_deep_research_mode") === "true")
    ) {
      const perplexityModels = PROVIDER_MODELS["Perplexity"] || [];
      const deepModel = perplexityModels.find(
        (m) => m.slug === "sonar-deep-research" || m.name.toLowerCase().includes("deep research")
      ) || perplexityModels[0];
      return { providerName: "Perplexity", modelItem: deepModel };
    }
    return resolveProviderAndModel(provParam);
  })();

  const [selectedProvider, setSelectedProvider] = useState<string>(initialResolved.providerName);
  const [selectedModel, setSelectedModel] = useState<AIModelItem>(initialResolved.modelItem);
  const [openSubModelDropdown, setOpenSubModelDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDeepThinkActive, setIsDeepThinkActive] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [activeSourcesDrawer, setActiveSourcesDrawer] = useState<SearchResult[] | null>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Files & Drag Drop
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const provParam = searchParams.get("model") || searchParams.get("provider");
    const isDeep =
      provParam?.toLowerCase() === "sonar-deep-research" ||
      provParam?.toLowerCase() === "deep_research" ||
      provParam?.toLowerCase() === "deep-research" ||
      getCookie("chat_deep_research_mode") === "true";

    if (isDeep) {
      setIsDeepResearchMode(true);
      const perplexityModels = PROVIDER_MODELS["Perplexity"] || [];
      const deepModel = perplexityModels.find(
        (m) => m.slug === "sonar-deep-research" || m.name.toLowerCase().includes("deep research")
      ) || perplexityModels[0];
      setSelectedProvider("Perplexity");
      setSelectedModel(deepModel);
    } else if (provParam) {
      setIsDeepResearchMode(false);
      const resolved = resolveProviderAndModel(provParam);
      setSelectedProvider(resolved.providerName);
      setSelectedModel(resolved.modelItem);
    }
    const chatIdParam = searchParams.get("chatId");
    if (chatIdParam) {
      setCurrentChatId(chatIdParam);
      loadChatById(chatIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasAutoTriggeredRef.current) return;

    // 1. Initial Prompt (LocalStorage / Cookie / Query)
    const storagePrompt = typeof window !== "undefined" ? localStorage.getItem("chat_initial_prompt") : null;
    const cookiePrompt = getCookie("chat_initial_prompt");
    const queryPrompt = searchParams.get("prompt");
    const promptToTrigger = (storagePrompt || cookiePrompt || queryPrompt || "").trim();

    // 2. Initial Image (LocalStorage for Live Production, Hash fallback for local port testing)
    let initialImage = typeof window !== "undefined" ? localStorage.getItem("chat_initial_image") : null;
    if (!initialImage && typeof window !== "undefined" && window.location.hash.includes("img=")) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        initialImage = hashParams.get("img");
      } catch (_) {}
    }

    // 3. Initial Extracted File Content & Filenames (LocalStorage)
    const initialFileContent = typeof window !== "undefined" ? localStorage.getItem("chat_initial_file_content") : null;
    const initialFilenames = typeof window !== "undefined" ? localStorage.getItem("chat_initial_filenames") : null;

    if (promptToTrigger || initialImage || initialFileContent) {
      hasAutoTriggeredRef.current = true;

      // 🔥 IMMEDIATE REMOVAL: Clear from localStorage and Cookie as soon as retrieved!
      deleteCookie("chat_initial_prompt");
      deleteCookie("chat_initial_image_url");
      if (typeof window !== "undefined") {
        localStorage.removeItem("chat_initial_prompt");
        localStorage.removeItem("chat_initial_image");
        localStorage.removeItem("chat_initial_file_content");
        localStorage.removeItem("chat_initial_filenames");
      }

      // Clean URL: Replace messy long URL with clean /ai-chat
      try {
        window.history.replaceState({}, "", "/ai-chat");
      } catch (_) {}

      setTimeout(() => {
        handleSendMessage(promptToTrigger, initialImage, initialFileContent, initialFilenames);
      }, 300);
    }
  }, [selectedModel]);

  const loadProviderHistory = async (provName: string) => {
    const token = getAuthToken();
    if (!token) return;
    setIsLoadingHistory(true);
    const providerObj = MAJOR_PROVIDERS.find((p) => p.name.toLowerCase() === provName.toLowerCase());
    const apiProvider = providerObj ? providerObj.provider : provName.toLowerCase();

    try {
      const res = await fetch(`${getApiBase()}/api/chat-history?ischatehistry=true&provider=${apiProvider}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const rawList: HistoryItem[] = data?.data || data?.chats || [];
        const singleModelChats = rawList.filter((item) => item.is_double !== true && item.isDouble !== true);
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

  useEffect(() => {
    const closeDropdown = () => setOpenSubModelDropdown(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const handleModelSidebarClick = (item: (typeof MAJOR_PROVIDERS)[0]) => {
    setIsDeepResearchMode(false);
    deleteCookie("chat_deep_research_mode");
    if (item.name.toLowerCase() === selectedProvider.toLowerCase()) {
      setCurrentChatId(null);
      setMessages([]);
      setPrompt("");
      setSelectedFiles([]);
      if (window.innerWidth < 768) setIsSidebarOpen(false); // <-- AA LINE UMARO
      return;
    }
    setSelectedProvider(item.name);
    const models = PROVIDER_MODELS[item.name] || [];
    if (models.length > 0) setSelectedModel(models[0]);
    setCurrentChatId(null);
    setMessages([]);
    setPrompt("");
    setSelectedFiles([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false); // <-- AA LINE UMARO
    const targetRoute = item.route || `/${item.name.toLowerCase().replace(/\s+/g, "-")}`;
    window.location.href = targetRoute;
  };

  const ensureChatId = async (provider: string, chatId?: string | null, firstMessageTitle?: string) => {
    if (chatId) return chatId;
    const token = getAuthToken();
    if (!token) return null;
    const providerObj = MAJOR_PROVIDERS.find((p) => p.name.toLowerCase() === provider.toLowerCase());
    const apiProvider = providerObj ? providerObj.provider : provider.toLowerCase();
    const title = "starting new chat";

    try {
      const res = await fetch(`${getApiBase()}/api/chat-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title,
          tags: ["is_model_chat", apiProvider],
          provider: apiProvider,
          ischatehistry: true,
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
            const isUser = roleStr === "user" || roleStr === "me" || roleStr === "human";
            
            // Reconstruct search results & followups if saved in metadata
            let savedSearchResults = [];
            let savedFollowUps = [];
            if (m.metadata?.search_results) {
              savedSearchResults = m.metadata.search_results;
            }
            if (m.metadata?.follow_ups) {
              savedFollowUps = m.metadata.follow_ups;
            }

            const rawContent = m.content || m.text || m.message || "";
            return {
              role: isUser ? "user" : "assistant",
              content: isUser ? sanitizeUserMessage(rawContent) : rawContent,
              imageUrl: m.imageUrl || m.image_url || m.metadata?.imageUrl || m.metadata?.image_url,
              searchResults: savedSearchResults.length > 0 ? savedSearchResults : undefined,
              followUps: savedFollowUps.length > 0 ? savedFollowUps : undefined
            };
          });
          setMessages(msgs);
        }
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  const sanitizeUserMessage = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/CURRENT ATTACHED FILE CONTENT[\s\S]*USER INSTRUCTION:\n/g, "")
      .replace(/\{\{historyData\}\}[\s\S]*?(?:formatting\.)/i, "")
      .replace(/\{\{historyData\}\}[^\n]*/gi, "")
      .replace(/\n*Conversation:[\s\S]*/i, "")
      .trim();
  };

  const sanitizeChatTitle = (title?: string | null, fallback = "New Chat") => {
    if (!title || !title.trim()) return fallback;
    let out = title.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<think>/gi, "").replace(/<\/think>/gi, "").replace(/[#*`"']/g, "").replace(/\n+/g, " ").trim();
    if (out.length > 25) out = out.substring(0, 25).trim();
    return out.length > 0 ? out : fallback;
  };

  const generateAndUpdateTitle = async (chatId: string, userPrompt: string, modelId: string) => {
    const token = getAuthToken();
    if (!token || !chatId) return;
    try {
      const prompt = `${userPrompt} Generate a perfect title for this chat (max 20 characters) from the given chat history. In any case, do not give or mention Markdown format.`;
      const res = await fetch(`${getApiBase()}/api/tools/ai/title-generate-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, modelId }),
      });
      if (!res.ok) return;
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulatedRaw = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.replace(/^data:\s*/, "");
            if (dataContent === "[DONE]") return;
            try {
              const parsed = JSON.parse(dataContent);
              const piece = parsed.chunk ?? parsed.content ?? parsed.text ?? parsed.message ?? "";
              if (typeof piece === "string") accumulatedRaw += piece;
            } catch (_) {
              if (!dataContent.startsWith("{")) accumulatedRaw += dataContent;
            }
          }
        });
      }
      const cleanTitle = sanitizeChatTitle(accumulatedRaw, "");
      if (cleanTitle && cleanTitle.length > 1 && cleanTitle !== "starting new chat") {
        await fetch(`${getApiBase()}/api/chat-history/${chatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: cleanTitle, ischatehistry: true }),
        });
        setHistoryList((prev) => prev.map((item) => (item._id === chatId ? { ...item, title: cleanTitle } : item)));
        loadProviderHistory(selectedProvider);
      }
    } catch (e) {
      console.error("Failed to generate title:", e);
    }
  };

  // Generate Follow-up questions for Perplexity (matching Flutter's lines 3699-3810)
  const fetchPerplexityFollowUps = async (userPrompt: string, aiLastAnswer: string, chatId?: string | null) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      // Find fast Flash model dynamically from PROVIDER_MODELS helper instead of hardcoded ID
      const deepSeekModels = PROVIDER_MODELS["DeepSeek"] || [];
      const flashModel = deepSeekModels.find((m) => m.slug?.includes("flash") || m.name.toLowerCase().includes("flash")) || deepSeekModels[0];
      const fastModelId = flashModel?.id || "6a756dc990ca2618be6d839c";
      const followUpPrompt = `System:
You are an AI assistant. Return ONLY a valid JSON array of 5 concise follow-up questions.
Format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
Do NOT include any introduction, explanations, or thinking process.

User:
Generate 5 follow-up questions for:
${userPrompt}
Context:
${aiLastAnswer.substring(0, 500)}`;

      const res = await fetch(`${getApiBase()}/api/tools/ai/title-generate-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: followUpPrompt, modelId: fastModelId }),
      });

      if (!res.ok) return;
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let followUpBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.replace(/^data:\s*/, "");
            if (dataContent === "[DONE]") return;
            try {
              const parsed = JSON.parse(dataContent);
              const piece = parsed.chunk ?? parsed.content ?? parsed.text ?? parsed.message ?? "";
              if (typeof piece === "string") followUpBuffer += piece;
            } catch (_) {
              if (!dataContent.startsWith("{")) followUpBuffer += dataContent;
            }
          }
        });

        // Fast opportunistic parsing so questions appear as soon as JSON array closes
        if (followUpBuffer.includes("]") && followUpBuffer.includes("[")) {
          try {
            const cleanCandidate = followUpBuffer
              .replace(/<think>[\s\S]*?<\/think>/gi, "")
              .replace(/```json|```/gi, "")
              .trim();
            const startIdx = cleanCandidate.indexOf("[");
            const endIdx = cleanCandidate.lastIndexOf("]");
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
              const arrayCandidate = JSON.parse(cleanCandidate.substring(startIdx, endIdx + 1));
              if (Array.isArray(arrayCandidate) && arrayCandidate.length > 0) {
                setMessages((prev) => {
                  const copy = [...prev];
                  if (copy.length > 0 && copy[copy.length - 1].role === "assistant") {
                    copy[copy.length - 1] = {
                      ...copy[copy.length - 1],
                      followUps: arrayCandidate.map((q) => String(q)),
                    };
                  }
                  return copy;
                });
              }
            }
          } catch (_) {}
        }
      }

      let cleanJson = followUpBuffer.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/```json|```/gi, "").trim();
      const startIdx = cleanJson.indexOf("[");
      const endIdx = cleanJson.lastIndexOf("]");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanJson = cleanJson.substring(startIdx, endIdx + 1);
      }
      const parsedArray = JSON.parse(cleanJson);
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        setMessages((prev) => {
          const copy = [...prev];
          if (copy.length > 0 && copy[copy.length - 1].role === "assistant") {
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              followUps: parsedArray.map((q) => String(q)),
            };
          }
          return copy;
        });
      }
    } catch (e) {
      console.error("Error generating sequential follow-ups:", e);
    }
  };

  // Build Context exactly like Flutter
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
    lines.push("\n{{historyData}} Please answer casually with emojis, and don't mention anything about markdown or formatting.");
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

  const handleSendMessage = async (
    textToSend?: string,
    overrideImage?: string | null,
    overrideFileContent?: string | null,
    overrideFilenames?: string | null
  ) => {
    let promptText = (textToSend || prompt).trim();
    if (!promptText && selectedFiles.length === 0 && !overrideImage && !overrideFileContent) return;

    let attachedFileContent = overrideFileContent || "";
    let activeImage: string | null = overrideImage || null;
    const filesToProcess = [...selectedFiles];

    if (filesToProcess.length > 0) {
      try {
        let combinedText = "";
        for (const file of filesToProcess) {
          if (isImageFile(file)) {
            if (!activeImage) {
              activeImage = await fileToBase64(file);
            }
            combinedText += `\n\n--- Attached Image: ${file.name} ---`;
          } else {
            try {
              const text = await extractTextFromFile(file);
              combinedText += `\n\n--- Attached File: ${file.name} ---\n${text}`;
            } catch (err: any) {
              combinedText += `\n\n=== File: ${file.name} (Error extracting text: ${err?.message || err}) ===\n`;
            }
          }
        }
        attachedFileContent = (attachedFileContent ? attachedFileContent + "\n" : "") + combinedText.trim();
      } catch (e) {
        console.error("Error reading attached file:", e);
      }
    }

    // Auto-clean Flutter prefix "📄 filenames" if present
    if (activeImage) {
      const cleanPrompt = promptText.replace(/^📄[^\n]+\n*/, "").trim();
      promptText = cleanPrompt || "What is in this image? Please describe and analyze it.";
    } else if (attachedFileContent) {
      const cleanPrompt = promptText.replace(/^📄[^\n]+\n*/, "").trim();
      promptText = cleanPrompt || "Analyze these files";
    }

    // Visual Display for User message bubble
    let displayUserMessage = promptText;
    if (overrideFilenames) {
      displayUserMessage = `📎 ${overrideFilenames}\n\n${promptText}`;
    } else if (filesToProcess.length > 0) {
      const fileNames = filesToProcess.map((f) => `📎 ${f.name}`).join("\n");
      displayUserMessage = displayUserMessage ? `${fileNames}\n\n${displayUserMessage}` : fileNames;
    }

    setPrompt("");
    setSelectedFiles([]);

    const chatId = await ensureChatId(selectedProvider, currentChatId, promptText);
    const promptWithContext = buildPromptWithContext(promptText, messages, attachedFileContent);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: displayUserMessage, imageUrl: activeImage || undefined },
      { role: "assistant", content: "", searchResults: [], followUps: [] },
    ]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const token = getAuthToken();
    const deepSeekModels = PROVIDER_MODELS["DeepSeek"] || [];
    const proModel = deepSeekModels.find((m) => m.slug?.includes("pro") || m.name.toLowerCase().includes("pro")) || deepSeekModels[0];
    const flashModel = deepSeekModels.find((m) => m.slug?.includes("flash") || m.name.toLowerCase().includes("flash")) || deepSeekModels[1] || selectedModel;
    const activeModelId = isDeepThinkActive ? proModel.id : selectedModel.id;

    try {
      const payload: Record<string, any> = {
        prompt: promptWithContext,
        modelId: activeModelId,
        chatId: chatId,
        ischatehistry: true,
        max_tokens: 4000,
        source: "model-chat-text",
        promptId: `${Date.now()}_${selectedProvider}`,
        system_prompt: "You are a helpful AI assistant in OneChat AI. Follow the user's instructions and provide accurate, helpful, and relevant responses.",
      };
      if (activeImage) {
        payload.imageUrl = activeImage;
      }

      const res = await fetch(`${getApiBase()}/api/tools/ai/general-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `${selectedProvider} is temporarily unavailable (${res.status}).`;
        try {
          const errData = await res.json();
          if (errData && errData.message) errorMsg = errData.message;
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

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${errorMsg}` };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulated = "";
      let parsedSearchResults: SearchResult[] = [];
      let parsedFollowUps: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Stream parsing exactly matching Flutter's structure
        if (chunk.includes("||SEARCH_RESULTS||")) {
          const parts = chunk.split("||SEARCH_RESULTS||");
          if (parts[0]) accumulated += parts[0];
          try {
            parsedSearchResults = JSON.parse(parts[1].trim());
          } catch (e) {
            console.error("Error parsing search results", e);
          }
          break; // Usually ends stream
        }

        if (chunk.includes("||FOLLOW_UPS||")) {
          const parts = chunk.split("||FOLLOW_UPS||");
          if (parts[0]) accumulated += parts[0];
          try {
            parsedFollowUps = JSON.parse(parts[1].trim());
          } catch (e) {
            console.error("Error parsing follow ups", e);
          }
          break; 
        }

        chunk.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) return;

          if (trimmed.startsWith("data:")) {
            const dataContent = trimmed.replace(/^data:\s*/, "");
            if (dataContent !== "[DONE]") {
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.type === "search_results" && parsed.search_results) {
                  parsedSearchResults = parsed.search_results;
                } else if (parsed.type === "follow_ups" && parsed.follow_ups) {
                  parsedFollowUps = parsed.follow_ups;
                } else {
                  let piece = parsed.chunk ?? parsed.text ?? parsed.content ?? parsed.message ?? "";
                  if (typeof piece === "string") accumulated += piece;
                }
              } catch (_) {
                accumulated += dataContent;
              }
            }
          }
        });

        const cleaned = accumulated.replace(/^:+/, "").trimStart();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { 
            role: "assistant", 
            content: cleaned,
            searchResults: parsedSearchResults,
            followUps: parsedFollowUps
          };
          return copy;
        });
      }

      if (chatId) {
        generateAndUpdateTitle(chatId, promptText, activeModelId);
      }

      // Sequential Follow-ups generation for Perplexity (matching Flutter's lines 3699-3810)
      if (selectedProvider.toLowerCase() === "perplexity" && parsedFollowUps.length === 0) {
        fetchPerplexityFollowUps(promptText, accumulated, chatId);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Stream generation error:", e);
        setMessages((prev) => {
          const copy = [...prev];
          if (copy.length > 0 && copy[copy.length - 1].role === "assistant" && !copy[copy.length - 1].content) {
            copy[copy.length - 1] = { role: "assistant", content: "⚠️ Request failed. Please try again." };
          }
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Drag and Drop using react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (selectedFiles.length + acceptedFiles.length > 10) {
      showToast("You can only upload up to 10 files at once");
      return;
    }
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    if (!prompt.trim() || prompt.trim() === "Analyze these files") {
      const hasImg = acceptedFiles.some(isImageFile);
      setPrompt(hasImg ? "Analyze these files" : "Analyze these files");
    }
  }, [selectedFiles.length, prompt, showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  // Web Speech API for Mic Input
  const toggleListening = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setPrompt(prev => prev + (prev ? " " : "") + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090E] text-white font-sans relative" {...getRootProps()}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-xl bg-[#1E1B38] border border-[#3B3363] text-white text-[13px] font-medium shadow-2xl animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}
      
      {/* DRAG AND DROP OVERLAY */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-[#5A4FF3]/10 border-2 border-[#5A4FF3] rounded-2xl flex items-center justify-center pointer-events-none m-4">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-xl">
             <UploadCloud className="w-12 h-12 text-[#5A4FF3] mb-3" />
             <p className="text-[#5A4FF3] font-bold text-lg">Drop files here to upload</p>
             <p className="text-gray-500 text-sm mt-1">Release to attach</p>
          </div>
        </div>
      )}

     {/* MOBILE BACKDROP - Ahiya navu umeryu chhe */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* 1. LEFT SIDEBAR - Classes change karya chhe */}
     <div 
        className={`transition-all duration-300 bg-[#090B14] border-r border-[#1B1F30]/80 flex flex-col shrink-0 z-50 overflow-hidden
          fixed md:relative h-full top-0 left-0
          ${isSidebarOpen ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0 md:w-[68px]"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1B1F30]/60">
          {/* Ahiya thi hidden md:block nikali didhu che */}
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

          <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#181C2B] transition cursor-pointer ml-auto md:ml-auto md:ml-0">
            <Menu className="w-4 h-4" />
          </button>
        </div>

       <div className="px-2 pt-2 space-y-0.5">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#151928] hover:text-white transition">
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <img src="/assets/images/onechat.png" alt="Home" className="w-full h-full object-contain" />
            </div>
            {/* Ahiya thi hidden md:block nikali didhu che */}
            {isSidebarOpen && <span className="block text-[13.5px] whitespace-nowrap">Home</span>}
          </a>
          <a href="/multi-chat" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#151928] hover:text-white transition">
            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[#6366F1]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></svg>
            </div>
            {/* Ahiya thi hidden md:block nikali didhu che */}
            {isSidebarOpen && <span className="block text-[13.5px] whitespace-nowrap">Compare AIs</span>}
          </a>
        </div>

       <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-[#1B1F30]">
          {MAJOR_PROVIDERS.map((item) => {
            const isSelected = !isDeepResearchMode && selectedProvider.toLowerCase() === item.name.toLowerCase();
            return (
              <button key={item.name} type="button" onClick={() => handleModelSidebarClick(item)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition cursor-pointer ${isSelected ? "bg-[#6342E8]/25 border border-[#8B5CF6]/40 text-[#C4B5FD] font-semibold" : "text-gray-300 hover:bg-[#151928] hover:text-white border border-transparent"}`}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                  <Image src={item.icon} alt={item.name} width={20} height={20} className="object-contain" />
                </div>
                {/* Ahiya thi hidden md:block nikali didhu che */}
                {isSidebarOpen && <span className="block text-[13.5px] truncate">{item.name}</span>}
              </button>
            );
          })}
         {isSidebarOpen && (
            <div className="block pt-4 mt-3 border-t border-[#1B1F30]/70">
              {/* History div mathi pan hidden md:block nikali didhu che jethi mobile ma dekhay */}
              <div className="px-2 mb-2">
                <span className="text-[12px] font-bold text-white tracking-wide truncate block">Your {selectedProvider} History</span>
              </div>
              {isLoadingHistory ? (
                <div className="px-3 py-2 text-xs text-gray-500">Loading history...</div>
              ) : historyList.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500">No recent chats</div>
              ) : (
                <div className="space-y-0.5">
                  {historyList.map((hist) => {
                    const isCurrent = currentChatId === hist._id;
                    return (
                      <button key={hist._id} type="button" onClick={() => { setCurrentChatId(hist._id); loadChatById(hist._id); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition truncate cursor-pointer ${isCurrent ? "bg-[#181C2B] text-white font-medium" : "text-gray-400 hover:bg-[#121522] hover:text-gray-200"}`}>
                        <span className="truncate block">{sanitizeChatTitle(hist.title, "Untitled Chat")}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#08090E] relative overflow-hidden w-full md:w-auto">
        
        {/* MOBILE HEADER - Navu umeryu chhe */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090B14] border-b border-[#1B1F30]/60 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#181C2B]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-[16px] text-white tracking-wide">OneChat AI</span>
          <div className="w-8"></div> {/* Right side spacing mate */}
        </div>

        {/* Aa div pachi normal em j rakhvo */}
        <div className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-28 py-8 space-y-6 scrollbar-thin scrollbar-thumb-[#1B1F30]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#121522] border border-[#252A40] flex items-center justify-center mb-4 shadow-xl">
                <Image src={PROVIDER_ICONS[selectedProvider] || "/assets/images/deepseek1.png"} alt={selectedProvider} width={38} height={38} className="object-contain" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedProvider}</h2>
              <p className="text-sm text-gray-400 mb-6">Start chatting with {selectedModel.name}.</p>
            </div>
          ) : (
            <div className="w-full flex flex-col space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`w-full flex ${isUser ? "justify-end" : "justify-center"} group relative`}>
                    {isUser ? (
                      <div className="max-w-[70%] rounded-[18px] px-4 py-2 bg-[#1E1B38] text-[14.5px] text-white shadow-md whitespace-pre-wrap leading-relaxed">
                       {msg.imageUrl && (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-[#252A40] bg-black/40">
      <img
        src={msg.imageUrl}
        alt="Attached preview"
        className="max-h-56 w-full object-contain rounded-lg"
      />
    </div>
  )}
  {sanitizeUserMessage(msg.content)}
                      </div>
                    ) : (
                      <div className="w-full max-w-[850px] flex flex-col gap-2">
                        {/* Main Response Content */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            {(() => {
                              const isDeepResearch =
                                isDeepResearchMode ||
                                (selectedProvider.toLowerCase() === "perplexity" &&
                                  (selectedModel.slug === "sonar-deep-research" ||
                                    selectedModel.name.toLowerCase().includes("deep research")));
                              
                              const iconPath = isDeepResearch
                                ? "/assets/images/onechat.png"
                                : PROVIDER_ICONS[selectedProvider] || "/assets/images/deepseek1.png";

                              const headerLabel = isDeepResearch
                                ? "Deep Research"
                                : selectedProvider;

                              return (
                                <>
                                  <Image
                                    src={iconPath}
                                    alt={headerLabel}
                                    width={18}
                                    height={18}
                                    className="object-contain"
                                  />
                                  <span className="text-xs font-semibold text-gray-300">
                                    {headerLabel}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <FormattedAiResponse 
                            content={msg.content} 
                            isStreaming={isStreaming && idx === messages.length - 1}
                            searchResults={msg.searchResults} 
                          />
                          
                          {/* Message Action Bar matching Flutter: Copy + Workspace Save + Sources Pill (for Perplexity / searchResults) */}
                          {msg.content && !isStreaming && (
                            <div className="flex items-center gap-2 mt-3 pt-1">
                              <CopyButton text={msg.content} />

                              {/* Perplexity Sources Pill Button (matching Flutter's _buildSourcesPillButton & Image 2) */}
                              {selectedProvider.toLowerCase() === "perplexity" && msg.searchResults && msg.searchResults.length > 0 && (
                                <SourcesPillButton
                                  sources={msg.searchResults}
                                  onClick={() => setActiveSourcesDrawer(msg.searchResults || null)}
                                />
                              )}
                            </div>
                          )}

                          {/* Follow-ups rendering exactly like Flutter's _buildFollowUpsList & _buildFollowUpItem */}
                          {msg.followUps && msg.followUps.length > 0 && !isStreaming && (
                            <div className="mt-6 mb-2 border border-[#1B1F30] bg-[#121522] rounded-xl overflow-hidden shadow-md">
                              {/* Header matching Flutter _buildFollowUpsList: question icon + 'Follow-ups' */}
                              <div className="flex items-center px-4 py-3 border-b border-[#1B1F30] bg-[#121522]">
                                <span className="text-[#8B5CF6] text-base mr-2 select-none">❓</span>
                                <span className="text-[14px] font-semibold text-white tracking-wide">
                                  Follow-ups
                                </span>
                              </div>

                              {/* Follow-up Items matching Flutter's exact hover, arrow_forward_rounded, north_east_rounded on hover */}
                              <div className="divide-y divide-[#1B1F30]">
                                {msg.followUps.map((q, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      setPrompt(q);
                                      handleSendMessage(q);
                                    }}
                                    className="w-full text-left flex items-center justify-between px-4 py-3 bg-transparent hover:bg-[#22273D] transition-colors duration-150 cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      {/* Left Arrow: Icons.arrow_forward_rounded (textSecondary -> primaryPurpleLight on hover) */}
                                      <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#8B5CF6] shrink-0 transition-colors duration-150" />
                                      {/* Question Text: 14px font-medium (textSecondary -> textPrimary on hover) */}
                                      <span className="text-[14px] font-medium text-[#94A3B8] group-hover:text-white transition-colors duration-150 leading-snug line-clamp-2">
                                        {q}
                                      </span>
                                    </div>

                                    {/* Right Arrow: Icons.north_east_rounded (fades in on hover) */}
                                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 ml-2" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 3. SEARCH INPUT CONTAINER (Model Specific - Matches Flutter search_Input_widget.dart) */}
        <div className="px-4 pb-6 pt-2 bg-[#08090E] flex flex-col items-center">
          <input {...getInputProps()} />
          <ModelSpecificSearchInput
            selectedProvider={isDeepResearchMode ? "deep_research" : selectedProvider}
            selectedModel={selectedModel}
            onModelSelect={(m) => setSelectedModel(m)}
            prompt={prompt}
            setPrompt={setPrompt}
            selectedFiles={selectedFiles}
            onRemoveFile={(idx) =>
              setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
            }
            onAddFiles={(files) => setSelectedFiles((prev) => [...prev, ...files])}
            isStreaming={isStreaming}
            onSendMessage={(overridePrompt) => handleSendMessage(overridePrompt)}
            isDeepThinkActive={isDeepThinkActive}
            setIsDeepThinkActive={setIsDeepThinkActive}
            isListening={isListening}
            toggleListening={toggleListening}
            onShowToast={showToast}
          />
        </div>

        {/* 4. SLIDING SOURCES DRAWER (Matching Image 3 and Flutter's SourcesDrawer / SourcesPanelContent) */}
        {activeSourcesDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity cursor-pointer"
              onClick={() => setActiveSourcesDrawer(null)}
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-full max-w-[420px] h-full bg-[#0E101D] border-l border-[#1C2033] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2033] bg-[#0E101D]">
                <div className="flex items-center gap-2.5">
                  <SourcesChainLinkSvg />
                  <span className="text-[17px] font-semibold text-white tracking-tight">
                    Sources
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1E2130] text-[12px] font-medium text-[#8E95A5]">
                    {activeSourcesDrawer.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSourcesDrawer(null)}
                  className="p-1 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#1A1F33] transition cursor-pointer"
                  title="Close sources"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#1C2033]">
                {activeSourcesDrawer.map((source, idx) => {
                  const domain =
                    source.domain?.replace(/^www\./, "") ||
                    (() => {
                      try {
                        return new URL(source.url).hostname.replace(/^www\./, "");
                      } catch {
                        return source.url || "";
                      }
                    })();
                  const faviconUrl = domain
                    ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
                    : "";

                  return (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3.5 rounded-xl bg-[#121422] border border-[#1C2033] hover:bg-[#171A2A] hover:border-[#2D334D] transition group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Index Badge (1, 2, 3...) */}
                        <div className="w-[22px] h-[22px] rounded-[6px] bg-[#1F2233] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[11px] font-semibold text-[#8E95A5]">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Favicon + Domain + External Link Icon */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-[18px] h-[18px] rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                                {faviconUrl ? (
                                  <img
                                    src={faviconUrl}
                                    alt={domain}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                      const parent = (e.target as HTMLElement).parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<span style="font-size:10px;font-weight:700;color:#9386FF">${(domain.charAt(0) || "S").toUpperCase()}</span>`;
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-[#9386FF]">
                                    {(domain.charAt(0) || "S").toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-[12px] text-[#8E95A5] truncate font-normal">
                                {domain}
                              </span>
                            </div>

                            <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#9386FF] transition shrink-0" />
                          </div>

                          {/* Row 2: Headline / Title in Purple #9386FF */}
                          <h4 className="text-[13.5px] font-medium text-[#9386FF] group-hover:text-[#B4A8FF] leading-snug line-clamp-2 transition mb-1">
                            {source.title}
                          </h4>

                          {/* Row 3: Description / Snippet */}
                          {(source.snippet || (source as any).content) && (
                            <p className="text-[12px] text-[#7E8494] line-clamp-3 leading-relaxed">
                              {source.snippet || (source as any).content}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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