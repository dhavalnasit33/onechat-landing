"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  ChevronDown,
  Brain,
  Globe,
  X,
  FileText,
  Search,
  SlidersHorizontal,
  Activity,
  Edit3,
  GraduationCap,
  Code2,
  Coffee,
  Lightbulb,
} from "lucide-react";
import { AIModelItem, PROVIDER_MODELS } from "@/constants/providerModelsHelper";

interface SearchInputProps {
  selectedProvider: string;
  selectedModel: AIModelItem;
  onModelSelect: (model: AIModelItem) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  onAddFiles: (files: File[]) => void;
  isStreaming: boolean;
  onSendMessage: (overridePrompt?: string) => void;
  // DeepThink state
  isDeepThinkActive: boolean;
  setIsDeepThinkActive: (val: boolean) => void;
  // Speech Recognition
  isListening: boolean;
  toggleListening: () => void;
  // Toast Notification callback
  onShowToast?: (msg: string) => void;
}

export const ModelSpecificSearchInput: React.FC<SearchInputProps> = ({
  selectedProvider,
  selectedModel,
  onModelSelect,
  prompt,
  setPrompt,
  selectedFiles,
  onRemoveFile,
  onAddFiles,
  isStreaming,
  onSendMessage,
  isDeepThinkActive,
  setIsDeepThinkActive,
  isListening,
  toggleListening,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [openModelDropdown, setOpenModelDropdown] = useState(false);
  const [geminiMode, setGeminiMode] = useState<"default" | "write" | "plan" | "research" | "learn">("default");
  const [isPerplexityDeep, setIsPerplexityDeep] = useState(false);
  const [activeClaudeCategory, setActiveClaudeCategory] = useState<string | null>(null);

  const availableModels: AIModelItem[] = PROVIDER_MODELS[selectedProvider] || [];

  // =========================================================================
  // ⚡ FLUTTER EXACT LOGIC SYNCS
  // 1. DeepSeek: sync isDeepThinkActive with selectedModel (Pro vs Flash)
  // 2. Perplexity: sync isPerplexityDeep with selectedModel (Deep Research vs Sonar)
  // =========================================================================
  useEffect(() => {
    if (selectedProvider.toLowerCase() === "deepseek") {
      if (
        selectedModel.id === "6a756dfd90ca2618be6d83f5" ||
        selectedModel.name.toLowerCase().includes("pro")
      ) {
        setIsDeepThinkActive(true);
      } else {
        setIsDeepThinkActive(false);
      }
    }
  }, [selectedModel.id, selectedModel.name, selectedProvider, setIsDeepThinkActive]);

  useEffect(() => {
    if (selectedProvider.toLowerCase() === "perplexity") {
      if (
        selectedModel.id === "685a28bb6f7240cc72297ee1" ||
        selectedModel.name.toLowerCase().includes("deep research")
      ) {
        setIsPerplexityDeep(true);
      } else {
        setIsPerplexityDeep(false);
      }
    }
  }, [selectedModel.id, selectedModel.name, selectedProvider]);

  const handleDeepThinkToggle = () => {
    const nextState = !isDeepThinkActive;
    setIsDeepThinkActive(nextState);

    // Exact Flutter logic: find Pro or Flash in available models and select it
    if (nextState) {
      const proModel =
        availableModels.find((m) => m.id === "6a756dfd90ca2618be6d83f5") ||
        availableModels.find((m) => m.name.toLowerCase().includes("pro"));
      if (proModel) onModelSelect(proModel);
    } else {
      const flashModel =
        availableModels.find((m) => m.id === "6a756dc990ca2618be6d839c") ||
        availableModels.find((m) => m.name.toLowerCase().includes("flash"));
      if (flashModel) onModelSelect(flashModel);
    }
  };

  const handlePerplexityToggle = (deep: boolean) => {
    setIsPerplexityDeep(deep);

    // Exact Flutter logic: switch between sonarDeepResearchId and sonarId
    if (deep) {
      const deepModel =
        availableModels.find((m) => m.id === "685a28bb6f7240cc72297ee1") ||
        availableModels.find((m) => m.name.toLowerCase().includes("deep research"));
      if (deepModel) onModelSelect(deepModel);
    } else {
      const standardModel =
        availableModels.find((m) => m.id === "685a29a06f7240cc72297ee9") ||
        availableModels.find((m) => m.name.toLowerCase() === "perplexity sonar");
      if (standardModel) onModelSelect(standardModel);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      if (selectedFiles.length + filesArr.length > 10) {
        if (onShowToast) {
          onShowToast("You can only upload up to 10 files at once");
        }
        return;
      }
      onAddFiles(filesArr);
      if (!prompt.trim()) setPrompt("Analyze these files");
    }
  };

  const hasText = prompt.trim().length > 0;
  const canSend = (hasText || selectedFiles.length > 0) && !isStreaming;

  // Selected Files Strip
  const renderFilesStrip = () => {
    if (selectedFiles.length === 0) return null;
    return (
      <div className="w-full flex gap-2 overflow-x-auto pb-2 mb-2">
        {selectedFiles.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-[#181C2B] border border-[#252A40] px-3 py-1.5 rounded-full text-xs text-gray-200 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[120px]">{file.name}</span>
            <button
              type="button"
              onClick={() => onRemoveFile(idx)}
              className="text-gray-400 hover:text-red-400 ml-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Shared Hidden File Input
  const renderHiddenFileInput = () => (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      multiple
      className="hidden"
      accept="image/*,application/pdf,text/*,.csv,.docx"
    />
  );

  // Model Selector Dropdown Pill
  const renderModelDropdown = (customBtnClass?: string, customTextClass?: string) => {
    if (!availableModels || availableModels.length === 0) return null;
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpenModelDropdown(!openModelDropdown)}
          className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition py-1.5 px-3 rounded-xl border border-transparent ${
            customBtnClass || "hover:bg-white/5"
          } ${customTextClass || "text-gray-300 hover:text-white"}`}
        >
          <span className="max-w-[130px] md:max-w-[170px] truncate font-medium">
            {selectedModel?.name || "Select Model"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>

        {openModelDropdown && (
          <div
            className="absolute bottom-full right-0 mb-2 w-60 bg-[#121524] border border-[#252A40] rounded-xl shadow-2xl py-2 z-50 max-h-64 overflow-y-auto"
            onMouseLeave={() => setOpenModelDropdown(false)}
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Select Model
            </div>
            {availableModels.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onModelSelect(m);
                  setOpenModelDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition hover:bg-[#1D2237] ${
                  m.id === selectedModel?.id ? "text-purple-400 bg-purple-500/10 font-medium" : "text-gray-200"
                }`}
              >
                <span className="truncate">{m.name}</span>
                {m.id === selectedModel?.id && <span className="text-[10px] text-purple-400">●</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const providerKey = selectedProvider.toLowerCase().trim();

  // ==========================================
  // 1. GEMINI SPECIFIC UI (_buildGeminiUI)
  // ==========================================
  if (providerKey === "gemini") {
    const geminiConfigs = {
      default: { hint: "Ask Gemini 3", prompts: [] },
      write: {
        hint: "What do you want to write?",
        prompts: [
          "Summarize my notes in bullet points",
          "Rewrite a message in five different tones",
          "Write a caption for my post in my style",
          "Strengthen my first draft",
        ],
      },
      plan: {
        hint: "What do you want to plan?",
        prompts: [
          "Create a study schedule for my exam",
          "Develop a 5-year financial plan for my family",
          "Find must-see spots for my next trip",
          "Help me reach a fitness goal",
        ],
      },
      research: {
        hint: "What do you want to research?",
        prompts: [
          "Help me decide between competing products",
          "Analyze what experts are saying about fad diets",
          "Break down a complex topic",
          "Find ways for AI to boost my business",
        ],
      },
      learn: {
        hint: "What do you want to learn?",
        prompts: [
          "Give me an easy trick to memorize a concept",
          "Help me brush up on another language",
          "Turn my flashcards into trivia",
          "Coach me through learning a new skill",
        ],
      },
    };

    const currentConf = geminiConfigs[geminiMode] || geminiConfigs.default;

    return (
      <div className="w-full max-w-[720px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col">
          {renderFilesStrip()}

          <textarea
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder={currentConf.hint}
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none min-h-[44px]"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between mt-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              title="Add photos & files"
            >
              <Plus className="w-5 h-5 stroke-[1.75]" />
            </button>

            <div className="flex items-center gap-2">
              {renderModelDropdown()}

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition cursor-pointer ${
                  isListening ? "text-red-400" : "text-white/60 hover:text-white"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  canSend ? "bg-[#4285F4] text-white hover:bg-[#3367D6]" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Gemini Mode Chips */}
        {geminiMode === "default" ? (
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {(["write", "plan", "research", "learn"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setGeminiMode(mode)}
                className="px-4 py-1.5 rounded-full bg-[#141726] border border-[#252A40] text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1D2237] transition capitalize cursor-pointer"
              >
                {mode}
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full mt-3 flex flex-col gap-1.5 px-2">
            <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
              <span className="capitalize font-semibold text-blue-400">{geminiMode} suggestions</span>
              {/* Flutter uses close icon button instead of text */}
              <button
                type="button"
                onClick={() => setGeminiMode("default")}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {currentConf.prompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(p);
                  onSendMessage(p);
                  setGeminiMode("default");
                }}
                className="text-left text-xs bg-[#121524] hover:bg-[#1D2237] border border-[#202538] px-3 py-2 rounded-xl text-gray-300 hover:text-white transition cursor-pointer truncate"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. CLAUDE SPECIFIC UI (_buildClaudeUI matching 1st Image)
  // Input Card: "How can I help you today?"
  // Bottom Row: [+] on left, [Claude Sonnet 5 v] in terracotta pill and [^] terracotta square send button on right
  // Under the card: 5 prompt chips (Write, Learn, Code, Life stuff, Claude's choice) with expandable options!
  // ==========================================
  if (providerKey === "claude") {
    const claudeChips = [
      {
        label: "Write",
        icon: Edit3,
        options: [
          "Help me develop a unique voice for an audience",
          "Edit my content",
          "Develop character profiles",
          "Develop instructional content",
          "Create blog article series",
        ],
      },
      {
        label: "Learn",
        icon: GraduationCap,
        options: [
          "Explain quantum computing simply",
          "History of the Roman Empire",
          "How does a car engine work?",
          "Teach me basic Spanish phrases",
        ],
      },
      {
        label: "Code",
        icon: Code2,
        options: [
          "Write a Python script to parse CSV",
          "Create a React button component",
          "Explain this error message",
          "Optimize this SQL query",
        ],
      },
      {
        label: "Life stuff",
        icon: Coffee,
        options: [
          "Give me a morning routine",
          "Suggest a healthy dinner recipe",
          "Plan a weekend trip itinerary",
          "Meditation tips for beginners",
        ],
      },
      {
        label: "Claude's choice",
        icon: Lightbulb,
        options: [
          "Tell me a fun fact",
          "Roast my coding style",
          "Give me a riddle",
          "Suggest a book to read",
        ],
      },
    ];

    const activeChipObj = claudeChips.find((c) => c.label === activeClaudeCategory);

    return (
      <div className="w-full max-w-[760px] flex flex-col items-center">
        {renderHiddenFileInput()}

        {/* 1. Main Claude Card Container */}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col min-h-[125px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="How can I help you today?"
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-3 mt-2">
            {/* [+] Button (Square with rounded corners, dark chip style) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              title="Add photos & files"
            >
              <Plus className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Right: Model Selector Pill + Terracotta Send Button */}
            <div className="flex items-center gap-2.5">
              {renderModelDropdown(
                "bg-[#151928] hover:bg-[#1D2237] border border-[#252A40] px-3.5 py-1.5 rounded-xl",
                "text-[#D97757] font-semibold"
              )}

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  canSend
                    ? "bg-[#D97757] text-white hover:bg-[#C26547]"
                    : "bg-[#181C2B] text-white/35 cursor-not-allowed border border-[#252A40]"
                }`}
                title="Send"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Claude Chips Row / Expanded Options */}
        {activeClaudeCategory && activeChipObj ? (
          <div className="w-full mt-3 bg-[#111422] border border-[#252A40] rounded-2xl p-3 shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-[#1C2033]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D97757]">
                <activeChipObj.icon className="w-4 h-4" />
                <span>{activeChipObj.label}</span>
              </div>
              {/* Flutter uses exact _ClaudeHeader close icon button: 28x28 circular with terracotta hover */}
              <button
                type="button"
                onClick={() => setActiveClaudeCategory(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#2A1B18] border border-transparent hover:border-[#E2A490] text-white/60 hover:text-[#D97757] cursor-pointer transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {activeChipObj.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(opt);
                    onSendMessage(opt);
                    setActiveClaudeCategory(null);
                  }}
                  className="text-left text-xs bg-[#161A2C] hover:bg-[#20253B] border border-[#23283E] px-3 py-2 rounded-xl text-gray-200 hover:text-white transition cursor-pointer truncate"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5 mt-4 flex-wrap">
            {claudeChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setActiveClaudeCategory(chip.label)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111422] border border-[#252A40] text-xs font-medium text-gray-200 hover:text-white hover:bg-[#1A1F33] transition cursor-pointer shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-300" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. DEEPSEEK SPECIFIC UI (_buildDeepSeekUI)
  // DeepThink R1 toggle + Search icon + Blue send #4D6BFE
  // Exact Flutter Logic:
  // - Clicking DeepThink toggles model between 'DeepSeek V4 Pro' and 'DeepSeek V4 Flash'
  // - Changing dropdown to Flash deselects DeepThink; selecting Pro activates DeepThink!
  // ==========================================
  if (providerKey === "deepseek") {
    return (
      <div className="w-full max-w-[720px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col min-h-[140px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Message DeepSeek..."
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-3 mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-full bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                title="Add photos & files"
              >
                <Plus className="w-5 h-5 stroke-[1.75]" />
              </button>

              {/* DeepThink (R1) Button */}
              <button
                type="button"
                onClick={handleDeepThinkToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                  isDeepThinkActive
                    ? "bg-[#4D6BFE]/20 text-[#6D87FE] border-[#4D6BFE]"
                    : "bg-[#181C2B] text-white/70 border-[#252A40] hover:text-white"
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>DeepThink (R1)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {renderModelDropdown()}

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition cursor-pointer ${
                  isListening ? "text-red-400" : "text-white/60 hover:text-white"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  canSend ? "bg-[#4D6BFE] text-white hover:bg-[#3D5BEE]" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. LLAMA SPECIFIC UI (_buildMetaAIUI)
  // Exact Flutter Design matching 1st Image:
  // - Rounded pill container (rounded-[28px])
  // - Padding: horizontal 12, vertical 8
  // - Left: circular [+] button
  // - Center: "Ask Anything..." text input
  // - Right: Model selector dropdown (e.g. Maverick ⌄) + circular Send button
  // ==========================================
  if (providerKey === "llama") {
    return (
      <div className="w-full max-w-[720px] flex flex-col items-center">
        {renderHiddenFileInput()}
        {renderFilesStrip()}

        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[28px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] px-3 py-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer shrink-0"
            title="Add photos & files"
          >
            <Plus className="w-5 h-5 stroke-[1.75]" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Ask Anything..."
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-[#8E92A4]"
            disabled={isStreaming}
          />

          {renderModelDropdown(
            "hover:bg-[#181C2B] px-2 py-1 rounded-lg",
            "text-white font-medium"
          )}

          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!canSend}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
              canSend
                ? "bg-gradient-to-r from-[#0064E0] via-[#6B4EFF] to-[#D62F7F] text-white shadow-md hover:opacity-90"
                : "bg-[#181C2B] text-white/35 cursor-not-allowed"
            }`}
            title="Send"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. RAINBOW GRADIENT BORDER CARD (Matching 2nd Image)
  // Shared by: Meta Muse, MiMo, Nemotron
  // Design:
  // - Rounded card (~22px) wrapped in smooth rainbow gradient border
  // - Placeholder: "What do you need help with?"
  // - Multiline input
  // - Bottom left: [+] button and [Model Selector Dropdown]
  // - Bottom right: Send button (white on active)
  // ==========================================
  if (
    providerKey === "meta muse" ||
    providerKey === "mimo" ||
    providerKey === "nemotron"
  ) {
    return (
      <div className="w-full max-w-[760px] flex flex-col items-center">
        {renderHiddenFileInput()}
        {renderFilesStrip()}

        {/* Rainbow gradient border wrapper */}
        <div className="w-full p-[1.5px] rounded-[22px] bg-gradient-to-r from-[#FF5050] via-[#F4B400] via-[#0F9D58] via-[#4285F4] to-[#A855F7] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="w-full bg-[#0B0E18] rounded-[20.5px] p-4 flex flex-col min-h-[120px] justify-between">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="What do you need help with?"
              className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#6E738A] resize-none"
              disabled={isStreaming}
            />

            <div className="flex items-center justify-between pt-3 mt-2">
              <div className="flex items-center gap-2.5">
                {/* [+] Button (dark rounded-lg container) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-lg bg-[#141829] border border-[#22273F] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                  title="Add photos & files"
                >
                  <Plus className="w-5 h-5 stroke-[1.75]" />
                </button>

                {/* Model Selector Pill (dark pill with subtle border and chevron) */}
                {renderModelDropdown(
                  "bg-[#141829] hover:bg-[#1D223B] border border-[#22273F] px-3.5 py-1.5 rounded-xl",
                  "text-gray-200 font-medium"
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition cursor-pointer ${
                    isListening ? "text-red-400" : "text-white/50 hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => onSendMessage()}
                  disabled={!canSend}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    canSend
                      ? "bg-white text-black hover:bg-gray-200 shadow-md"
                      : "bg-[#141829] text-white/30 border border-[#22273F] cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. PERPLEXITY SPECIFIC UI (_buildPerplexityUI)
  // Exact Flutter Implementation:
  // - Rounded card container (rounded-[26px]) with AppThemeColors.chatInputBg
  // - "Ask anything..." placeholder
  // - Left: Joint toggle with Search (lens) and Deep Research (auto_awesome / layers icon)
  // - Right: Model selector pill + Attach file clip + Mic + Circular Send button
  // ==========================================
  if (providerKey === "perplexity") {
    return (
      <div className="w-full max-w-[720px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[26px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-3.5 flex flex-col min-h-[120px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Ask anything..."
            className="w-full bg-transparent border-none outline-none text-white text-[15.5px] placeholder-[#8E92A4] resize-none px-2 pt-1 min-h-[46px]"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-2 mt-1 flex-wrap gap-2">
            {/* Left: Joint icon toggle matching Flutter's _buildJointToggle */}
            <div className="flex items-center h-[34px] p-0.5 bg-[#141829] border border-[#22273F] rounded-[10px]">
              {/* 1. Search Icon */}
              <button
                type="button"
                onClick={() => handlePerplexityToggle(false)}
                className={`w-8 h-[28px] rounded-[7px] flex items-center justify-center transition cursor-pointer ${
                  !isPerplexityDeep
                    ? "bg-[#20808D] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Search: Get fast answers to everyday questions"
              >
                <Search className="w-4 h-4 stroke-[2]" />
              </button>

              {/* 2. Reasoning / Deep Research Icon (Layers / auto_awesome_motion icon) */}
              <button
                type="button"
                onClick={() => handlePerplexityToggle(true)}
                className={`w-8 h-[28px] rounded-[7px] flex items-center justify-center transition cursor-pointer ml-0.5 ${
                  isPerplexityDeep
                    ? "bg-[#20808D] text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Deep research: Create in-depth reports with more sources and reasoning"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m2 9 10-5 10 5-10 5Z" />
                  <path d="m2 14 10 5 10-5" />
                  <path d="m2 19 10 5 10-5" />
                </svg>
              </button>
            </div>

            {/* Right: Model Dropdown + Paperclip Attach + Mic + Send */}
            <div className="flex items-center gap-2">
              {renderModelDropdown(
                "bg-[#141829] hover:bg-[#1D223B] border border-[#22273F] px-3 py-1.5 rounded-full text-xs font-semibold max-w-[200px]",
                "text-gray-200 truncate"
              )}

              {/* Attach File Clip matching Flutter's attach_file */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-full text-white/70 hover:text-white transition cursor-pointer"
                title="Attach files"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  isListening ? "text-red-400" : "text-white/60 hover:text-white"
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  canSend
                    ? "bg-[#20808D] text-white hover:bg-[#186670] shadow-md"
                    : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
                title="Send"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 7. KIMI SPECIFIC UI (_buildKimiUI)
  // Card container, minLines 2, "Ask Anything...", circular + and white send
  // ==========================================
  if (providerKey === "kimi") {
    return (
      <div className="w-full max-w-[750px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col min-h-[130px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Ask Anything..."
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1C2033]/50">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              title="Add photos & files"
            >
              <Plus className="w-4 h-4 stroke-[1.75]" />
            </button>

            <div className="flex items-center gap-3">
              {renderModelDropdown()}

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                  canSend ? "bg-white text-black hover:bg-gray-200" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 8. MISTRAL SPECIFIC UI (_buildMistralUI)
  // Single row rounded-2xl, Mistral orange send button #FF5000, "Type / for quick access"
  // ==========================================
  if (providerKey === "mistral") {
    return (
      <div className="w-full max-w-[750px] flex flex-col items-center">
        {renderHiddenFileInput()}
        {renderFilesStrip()}

        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] px-3 py-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-lg bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer shrink-0"
            title="Add photos & files"
          >
            <Plus className="w-4 h-4 stroke-[1.75]" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Type / for quick access"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-[#8E92A4]"
            disabled={isStreaming}
          />

          {renderModelDropdown()}

          <button
            type="button"
            onClick={() => {
              if (hasText) {
                onSendMessage();
              } else {
                toggleListening();
              }
            }}
            className="w-9 h-9 rounded-lg bg-[#FF5000] hover:bg-[#E04600] flex items-center justify-center text-white transition cursor-pointer shrink-0"
            title={hasText ? "Send" : isListening ? "Stop listening" : "Voice input"}
          >
            {hasText ? (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            ) : isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 9. QWEN SPECIFIC UI (_buildQwenUI)
  // Rounded pill 30px, purple brand circle #6B52D6, mic + arrow/soundwave
  // ==========================================
  if (providerKey === "qwen") {
    return (
      <div className="w-full max-w-[750px] flex flex-col items-center">
        {renderHiddenFileInput()}
        {renderFilesStrip()}

        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[30px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] px-3 py-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer shrink-0"
            title="Add photos & files"
          >
            <Plus className="w-5 h-5 stroke-[1.75]" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="How can I help you today?"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-[#8E92A4]"
            disabled={isStreaming}
          />

          {renderModelDropdown()}

          <button
            type="button"
            onClick={toggleListening}
            className={`p-1.5 rounded-full transition cursor-pointer shrink-0 ${
              isListening ? "text-red-400" : "text-white/60 hover:text-white"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!canSend}
            className={`w-10 h-10 rounded-full bg-[#6B52D6] hover:bg-[#5B42C6] flex items-center justify-center text-white transition cursor-pointer shrink-0 ${
              canSend ? "opacity-100" : "opacity-80"
            }`}
            title="Send"
          >
            {hasText ? <ArrowUp className="w-4 h-4 stroke-[2.5]" /> : <Activity className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 10. MINIMAX SPECIFIC UI (_buildMiniMaxUI)
  // Card container rounded-20, "Enter your task and submit it to MiniMax Agent.", sliders icon, white send button
  // ==========================================
  if (providerKey === "minimax") {
    return (
      <div className="w-full max-w-[700px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col min-h-[140px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Enter your task and submit it to MiniMax Agent."
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1C2033]/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-lg bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                title="Attach files"
              >
                <Plus className="w-4 h-4 stroke-[1.75]" />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-lg bg-[#181C2B] border border-[#252A40] flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                title="MiniMax Parameters"
              >
                <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {renderModelDropdown()}

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  canSend ? "bg-white text-black hover:bg-gray-200" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 11. GLM SPECIFIC UI (_buildGLMUI)
  // Card container rounded-20, "How can I help you today?", globe icon, white arrow
  // ==========================================
  if (providerKey === "glm") {
    return (
      <div className="w-full max-w-[750px] flex flex-col items-center">
        {renderHiddenFileInput()}
        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.3)] p-4 flex flex-col min-h-[140px] justify-between">
          {renderFilesStrip()}

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="How can I help you today?"
            className="w-full bg-transparent border-none outline-none text-white text-[16px] placeholder-[#8E92A4] resize-none"
            disabled={isStreaming}
          />

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1C2033]/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-white/70 hover:text-white transition cursor-pointer"
                title="Add photos & files"
              >
                <Plus className="w-5 h-5 stroke-[1.75]" />
              </button>
              <button
                type="button"
                className="text-white/70 hover:text-white transition cursor-pointer"
                title="Web Search"
              >
                <Globe className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {renderModelDropdown()}

              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!canSend}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  canSend ? "bg-white text-black hover:bg-gray-200" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 12. GROK SPECIFIC UI (_buildGrokUI)
  // Single row rounded-24, upload icon, white rounded-18 send
  // ==========================================
  if (providerKey === "grok") {
    return (
      <div className="w-full max-w-[700px] flex flex-col items-center">
        {renderHiddenFileInput()}
        {renderFilesStrip()}

        <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.3)] px-3.5 py-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70 hover:text-white transition cursor-pointer shrink-0"
            title="Attach files"
          >
            <Plus className="w-5 h-5 stroke-[1.75]" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="How can I help you today?"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-[#8E92A4]"
            disabled={isStreaming}
          />

          {renderModelDropdown()}

          <button
            type="button"
            onClick={toggleListening}
            className={`p-1.5 rounded-full transition cursor-pointer shrink-0 ${
              isListening ? "text-red-400" : "text-white/60 hover:text-white"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!canSend}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
              canSend ? "bg-white text-black hover:bg-gray-200" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 13. DEFAULT (CHATGPT & Major Other Models)
  // Exact Flutter Pill Shape (isModelTab style)
  // ==========================================
  return (
    <div className="w-full max-w-[700px] flex flex-col items-center">
      {renderHiddenFileInput()}
      {renderFilesStrip()}

      <div className="w-full bg-[#0E111C] border border-[#252A40] rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.3)] px-4 py-1.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer shrink-0"
          title="Add photos & files"
        >
          <Plus className="w-6 h-6 stroke-[1.75]" />
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSendMessage();
            }
          }}
          placeholder="Ask anything"
          className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-[#8E92A4] py-1.5"
          disabled={isStreaming}
        />

        {renderModelDropdown()}

        <button
          type="button"
          onClick={toggleListening}
          className={`${isListening ? "text-red-400" : "text-white/60 hover:text-white"} transition cursor-pointer shrink-0`}
          title="Speech to text"
        >
          {isListening ? <MicOff className="w-5 h-5 stroke-[1.75]" /> : <Mic className="w-5 h-5 stroke-[1.75]" />}
        </button>

        <button
          type="button"
          onClick={() => onSendMessage()}
          disabled={!canSend}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
            canSend ? "bg-[#5A4FF3] text-white hover:bg-[#4F46E5]" : "bg-[#181C2B] text-white/35 cursor-not-allowed"
          }`}
        >
          <ArrowUp className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
