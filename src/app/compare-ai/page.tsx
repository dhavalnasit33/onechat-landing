"use client";

import React, { useState, useEffect, useRef, Suspense, DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Square,
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
  Zap
} from "lucide-react";
import {
  PROVIDER_MODELS,
  AIModelItem,
} from "@/constants/providerModelsHelper";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  Perplexity: ['Perplexity Sonar'],
  Grok: ['Grok 4.20 Non-Reasoning'],
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

function getApiBase(): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) return envBase.replace(/\/api\/?$/, "");
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://api.onechatai.ai";
  }
  return "https://api.onechatai.ai";
}

// Custom Markdown Renderer
function FormattedAiResponse({ content }: { content: string }) {
  if (!content) {
    return (
      <div className="flex items-center gap-1.5 py-2 text-gray-400">
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    );
  }
  return (
    <div className="prose prose-invert max-w-none text-[14.5px] leading-relaxed font-normal marker:text-purple-400">
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
    <button onClick={handleCopy} className="p-1.5 rounded-lg bg-[#181C2B] border border-[#252A40] text-gray-400 hover:text-white hover:bg-[#22273D] transition shadow-md cursor-pointer" title="Copy text">
      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CompareAiContent() {
  const searchParams = useSearchParams();

  // Plans & Limits State[cite: 1]
  const [userPlan, setUserPlan] = useState<string>("basic");
  const [requestsUsed, setRequestsUsed] = useState<number>(0);
  const [dailyLimit, setDailyLimit] = useState<number>(50);

  // File Extraction State[cite: 1]
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileContext, setFileContext] = useState<string>(""); 
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
    return allowed.includes(modelName);
  };

  // Extract Text from File (File Parser equivalent to Flutter)[cite: 1, 2]
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);

    let combinedText = "";
    for (const file of newFiles) {
      if (file.name.match(/\.(txt|csv|md|json)$/i)) {
        const text = await extractTextFromFile(file);
        combinedText += `\n\n--- File: ${file.name} ---\n${text}`;
      } else {
        combinedText += `\n\n--- Attached File: ${file.name} (Binary/Image) ---`;
      }
    }
    setFileContext(prev => prev + combinedText);
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
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    // Simple reset for file context (In production, you'd re-parse the remaining files)
    if (selectedFiles.length === 1) setFileContext(""); 
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

  const streamToPane = async (promptText: string, paneIndex: number, provider: string, modelItem: AIModelItem, currentChatId?: string, promptId?: string) => {
    const token = getAuthToken();
    const base = getApiBase();
    
    // 1. Get/Create Chat ID for history (Safely read currentChatId without accessing state directly)
    let chatId = await ensureChatId(provider, currentChatId);

    setProviderPanes((prev) => {
      if (!prev[paneIndex]) return prev;
      const copy = [...prev];
      copy[paneIndex] = {
        ...copy[paneIndex],
        chatId: chatId,
        isStreaming: true,
        messages: [...copy[paneIndex].messages, { role: "user", content: promptText }, { role: "assistant", content: "" }],
      };
      return copy;
    });

    const controller = new AbortController();
    abortControllersRef.current[provider] = controller;

    try {
      const res = await fetch(`${base}/api/tools/ai/general-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: promptText,
          modelId: modelItem.id,
          chatId: chatId, // Attach chatId to payload so backend saves messages[cite: 1]
          ischatehistry: false,
          max_tokens: 4000,
          source: "multi-chat-text",
          promptId: promptId || `${Date.now()}_${provider}`, // 🔥 Flutter exact key to increment checkCombinedChatLimit!
          system_prompt: "You are a helpful AI assistant in OneChat AI.",
        }),
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
      if (e.name !== "AbortError") {
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
    
    // File Context Construction
    if (fileContext) {
      finalPrompt = `CURRENT ATTACHED FILE CONTENT:\n${fileContext}\n\nUSER INSTRUCTION:\n${finalPrompt}\n\n(IMPORTANT: Focus your analysis strictly on the CURRENT ATTACHED FILE CONTENT provided above.)`;
    } else if (selectedFiles.length > 0) {
      const fileNames = selectedFiles.map(f => `📄 ${f.name}`).join("\n");
      finalPrompt = `${fileNames}\n\n${finalPrompt}`;
    }
    if (!finalPrompt) return;
    // 🔥 જે પેન્સ પાસ થયા હોય તે વાપરો, નહિંતર state વાળા
    const activePanes = targetPanes || providerPanes;
    // Check Plan Limits before triggering APIs
    const activeStreamCount = activePanes.filter(p => p.isEnabled).length;
    const remainingRequests = dailyLimit - requestsUsed;
    if (remainingRequests < activeStreamCount && dailyLimit > 0) {
      alert(`Daily limit reached! You only have ${Math.max(0, remainingRequests)} requests left, but selected ${activeStreamCount} models. Please upgrade your plan.`);
      return;
    }
    setPrompt("");
    setSelectedFiles([]); 
    setFileContext("");
    setRequestsUsed(prev => prev + activeStreamCount);

    // 🔥 Flutter exact batchPromptId format so backend checkCombinedChatLimit updates!
    const batchPromptId = Date.now().toString();

    activePanes.forEach((pane, idx) => {
      if (pane.isEnabled) {
        // Skip streaming if model is locked
        if (isModelAccessible(pane.provider, pane.selectedModel.name)) {
          const modelPromptId = `${batchPromptId}_${pane.provider}`;
          streamToPane(finalPrompt, idx, pane.provider, pane.selectedModel, pane.chatId, modelPromptId);
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
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#08090E] text-white select-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#5048E5]/20 backdrop-blur-sm border-4 border-dashed border-[#5048E5] m-4 rounded-3xl">
          <div className="flex flex-col items-center gap-4 bg-[#121522] p-8 rounded-2xl shadow-2xl">
            <Plus className="w-12 h-12 text-[#5048E5] animate-bounce cursor-pointer" />
            <h2 className="text-2xl font-bold">Drop files to attach</h2>
            <p className="text-gray-400 text-sm">Supports txt, csv, md, json</p>
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
                <div key={pane.provider + index} style={{ width: "65px", minWidth: "65px", transition: "all 0.45s" }} className="flex flex-col items-center h-full rounded-[12px] bg-[#121522] border border-[#252A40] py-3.5 px-1.5 shrink-0 shadow-xl">
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
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#0E101A] border-b border-[#1B1F30] relative z-20">
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
                  {!accessible && pane.messages.length > 0 ? (
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
                      className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1B1F30] relative scroll-smooth"
                    >
                      {pane.messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 text-sm">Waiting for prompt...</div>
                      ) : (
                        <>
                          {pane.messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col group relative ${msg.role === "user" ? "items-end" : "items-start"}`}>
                              {msg.role === "user" ? (
                                <div className="max-w-[320px] rounded-[18px] px-4 py-2.5 bg-[#181C2B] border border-[#252A40] text-[14.5px] text-white shadow-md whitespace-pre-wrap">
                                  {msg.content.replace(/CURRENT ATTACHED FILE CONTENT[\s\S]*USER INSTRUCTION:\n/g, '').trim()}
                                </div>
                              ) : (
                               <div className="w-full text-gray-100 selection:bg-purple-600">
  <FormattedAiResponse content={msg.content} />
  {/* Hover Action Buttons (Copy) - Niche dekhaadva mate */}
  {msg.content && !pane.isStreaming && (
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
                                    copy[index] = { ...copy[index], isStreaming: false };
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
      <div className="px-4 pb-3 pt-1 bg-[#08090E]">
        <div className="max-w-[800px] mx-auto rounded-[24px] p-[1.5px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-2xl">
          <div className="bg-[#0E111C] rounded-[22.5px] px-4 py-3 flex flex-col gap-2 border border-[#252A40]">
            
            {/* File Chips */}
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#181C2B] border border-[#252A40] px-3 py-1.5 rounded-xl">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-200 max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
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
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} className="hidden" multiple />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg border border-[#1B1F30] text-gray-400 hover:text-white hover:bg-[#181C2B] transition cursor-pointer" title="Upload attachment">
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

                <button type="button" onClick={() => handleSendPrompt(prompt)} disabled={(!prompt.trim() && selectedFiles.length === 0) || isAnyStreaming} className={`p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer ${ (prompt.trim() || selectedFiles.length > 0) && !isAnyStreaming ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:scale-105" : "bg-[#181C2B] text-gray-500 cursor-not-allowed" }`}>
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