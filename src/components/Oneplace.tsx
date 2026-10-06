"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";
import { ArrowRight } from "lucide-react";

interface OneplaceProps {
    onOpenAuth?: () => void;
    onCTA?: (attribution: RegistrationCTAInput) => void;
}

interface ModelResponse {
    id: string;
    name: string;
    icon: string;
    image: string;
    fullText: string;
}

const modelResponses: ModelResponse[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        icon: "/assets/landing-page/section-2-chatgpt.png",
        image: "/assets/landing-page/createzeroskillsection/AI_image.png",
        fullText:
            "Japan — for culture, food and incredible city experiences. Portugal and New Zealand are also excellent choices.",
    },
    {
        id: "claude",
        name: "Claude",
        icon: "/assets/landing-page/section-2-claude.png",
        image: "/assets/landing-page/createzeroskillsection/Research.png",
        fullText:
            "For culture, consider Japan. For affordability, Portugal. For nature and adventure, New Zealand stands out.",
    },
    {
        id: "gemini",
        name: "Gemini",
        icon: "/assets/landing-page/section-2-gemini.png",
        image: "/assets/landing-page/createzeroskillsection/And_More.png",
        fullText:
            "Top picks: Japan, Portugal and New Zealand — each offering a very different travel experience.",
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        icon: "/assets/landing-page/section-2-deepSeek.png",
        image: "/assets/landing-page/createzeroskillsection/Templates.png",
        fullText:
            "1. Japan — Culture\n2. Portugal — Value\n3. New Zealand — Adventure",
    },
];

const bottomModels = [
    { name: "ChatGPT", icon: "/assets/landing-page/section-2-chatgpt.png" },
    { name: "Claude", icon: "/assets/landing-page/section-2-claude.png" },
    { name: "Gemini", icon: "/assets/landing-page/section-2-gemini.png" },
    { name: "DeepSeek", icon: "/assets/landing-page/section-2-deepSeek.png" },
    { name: "Grok", icon: "/assets/landing-page/section-2-grok.png" },
    { name: "Llama", icon: "/assets/landing-page/section-2-meta-ai.png" },
    { name: "Qwen", icon: "/assets/landing-page/section-2-qwen.png" },
    { name: "MiniMax", icon: "/assets/landing-page/section-2-minimax.png" },
    { name: "Veo", icon: "/assets/landing-page/section-2-veo.png" },
    { name: "Kling", icon: "/assets/landing-page/section-2-kling.png" },
    { name: "Runway", icon: "/assets/landing-page/section-2-runway.png" },
];


export interface TopNavTab {
    id: string;
    label: string;
    icon?: string;
    isActive?: boolean;
}

export interface SidebarNavTab {
    id: string;
    label: string;
    icon?: string;
    isActive?: boolean;
}

export const defaultTopNavTabs: TopNavTab[] = [
    { id: "chat-compare", label: "Chat & Compare", icon: "/assets/images/copmareai.png", isActive: true },
    { id: "images", label: "Images", icon: "/assets/images/image.png", isActive: false },
    { id: "video", label: "Video", icon: "/assets/images/video.png", isActive: false },
    { id: "writing", label: "Writing", icon: "/assets/images/writing.png", isActive: false },
    { id: "design", label: "Design", icon: "/assets/images/design.png", isActive: false },
    { id: "pdf", label: "PDF", icon: "/assets/images/pdf.png", isActive: false },
    { id: "research", label: "Research", icon: "/assets/images/research.png", isActive: false },
    { id: "templates", label: "Templates", icon: "/assets/images/templates.png", isActive: false },
    { id: "and-more", label: "And More", icon: "/assets/images/left-arrow.png", isActive: false },
];

export const defaultSidebarNavTabs: SidebarNavTab[] = [
    { id: "new-chat", label: "New Chat", icon: "/assets/images/chat_active.png", isActive: false },
    { id: "compare-ai", label: "Compare AI", icon: "/assets/images/copmareai.png", isActive: true },
    { id: "ai-models", label: "AI Models", icon: "/assets/images/aimodel.png", isActive: false },
    { id: "templates", label: "Templates", icon: "/assets/images/templates.png", isActive: false },
    { id: "library", label: "Library", icon: "/assets/images/library.png", isActive: false },
    { id: "projects", label: "Projects", icon: "/assets/images/project.png", isActive: false },
];

// Helper to render either an Image/SVG path or an Emoji/Text icon
const renderIcon = (icon?: string, label?: string, className = "w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain shrink-0") => {
    if (!icon) return null;
    const isImagePath = icon.startsWith("/") || icon.startsWith("http") || icon.includes(".");
    if (isImagePath) {
        return (
            <img
                src={icon}
                alt={label || "icon"}
                className={className}
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
        );
    }
    return <span className="text-xs leading-none shrink-0">{icon}</span>;
};

export default function Oneplace({ onOpenAuth, onCTA }: OneplaceProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    // Streaming text state
    const [displayedTexts, setDisplayedTexts] = useState<Record<string, string>>({
        chatgpt: "",
        claude: "",
        gemini: "",
        deepseek: "",
    });
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!inView) return;

        // Check prefers-reduced-motion
        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
            setDisplayedTexts({
                chatgpt: modelResponses[0].fullText,
                claude: modelResponses[1].fullText,
                gemini: modelResponses[2].fullText,
                deepseek: modelResponses[3].fullText,
            });
            setIsThinking(false);
            return;
        }

        let isCancelled = false;

        const runLoop = async () => {
            while (!isCancelled) {
                // Step 1: Start cycle (0.0s) -> show question, trigger thinking state (~0.4s)
                setDisplayedTexts({ chatgpt: "", claude: "", gemini: "", deepseek: "" });
                setIsThinking(true);
                await new Promise((r) => setTimeout(r, 600));
                if (isCancelled) break;
                setIsThinking(false);

                // Step 2: Stream responses in natural small chunks (~0.8s - 3.5s)
                const chunks: Record<string, string[]> = {
                    chatgpt: modelResponses[0].fullText.match(/.{1,4}/g) || [],
                    claude: modelResponses[1].fullText.match(/.{1,4}/g) || [],
                    gemini: modelResponses[2].fullText.match(/.{1,4}/g) || [],
                    deepseek: modelResponses[3].fullText.match(/.{1,3}/g) || [],
                };

                const maxChunks = Math.max(
                    chunks.chatgpt.length,
                    chunks.claude.length,
                    chunks.gemini.length,
                    chunks.deepseek.length
                );

                let currentTexts = { chatgpt: "", claude: "", gemini: "", deepseek: "" };

                for (let i = 0; i < maxChunks; i++) {
                    if (isCancelled) break;

                    if (i < chunks.chatgpt.length) currentTexts.chatgpt += chunks.chatgpt[i];
                    if (i >= 1 && i - 1 < chunks.claude.length) currentTexts.claude += chunks.claude[i - 1];
                    if (i >= 2 && i - 2 < chunks.gemini.length) currentTexts.gemini += chunks.gemini[i - 2];
                    if (i >= 1 && i - 1 < chunks.deepseek.length) currentTexts.deepseek += chunks.deepseek[i - 1];

                    setDisplayedTexts({ ...currentTexts });
                    await new Promise((r) => setTimeout(r, 110));
                }

                if (isCancelled) break;

                await new Promise((r) => setTimeout(r, 2500));

                if (isCancelled) break;
                await new Promise((r) => setTimeout(r, 500));
            }
        };

        runLoop();

        return () => {
            isCancelled = true;
        };
    }, [inView]);

    return (
        <section
            ref={sectionRef}
            id="features"
            className="relative w-full bg-[#050711] py-16 sm:py-20 md:py-24 px-3 sm:px-6 lg:px-8 overflow-hidden text-white"
        >
            {/* Background Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[700px] bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(108,86,229,0.2),rgba(0,163,255,0.12),transparent)] pointer-events-none" />
            <div className="absolute top-10 left-5 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-5 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Main Enclosing Frame (Outer Dashboard Box) */}
            <div className="relative max-w-[1380px] mx-auto rounded-3xl bg-[#0E0E24] border border-indigo-500/25 p-4 sm:p-7 md:p-9 lg:p-10 shadow-[0_0_80px_rgba(59,130,246,0.18)] backdrop-blur-2xl">

                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-tight">
                        One Place.{" "}
                        <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
                            Every Way{" "}
                            You Use AI.
                        </span>
                    </h2>
                    <p className="mt-2.5 sm:mt-3 font-sans text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Hundreds of tools, the best AI models, and ready-to-use templates — all in one platform.
                    </p>
                </div>

                <div className="w-full bg-[#0C1126]/90 border border-white/10 rounded-2xl p-1.5 sm:p-2 mb-6 sm:mb-8 shadow-inner">

                    {/* First Row */}
                    <div className="flex items-center justify-center gap-1.5 gap-x-3 md:gap-x-10 sm:gap-y-4  flex-wrap">
                        {defaultTopNavTabs.slice(0, 5).map((tab) => {
                            if (tab.isActive) {
                                return (
                                    <div
                                        key={tab.id}
                                        className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B4FE1] via-[#7B59EC] to-[#A855F7] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(123,89,236,0.45)] cursor-default select-none"
                                    >
                                        {renderIcon(tab.icon, tab.label)}
                                        <span>{tab.label}</span>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={tab.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 text-xs sm:text-sm font-medium hover:text-white transition-colors cursor-default select-none"
                                >
                                    {renderIcon(tab.icon, tab.label)}
                                    <span>{tab.label}</span>
                                </div>
                            );
                        })}

                        {/* Second Row */}
                        {defaultTopNavTabs.slice(5).map((tab) => (
                            <div
                                key={tab.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 text-xs sm:text-sm font-medium hover:text-white transition-colors cursor-default select-none"
                            >
                                {renderIcon(tab.icon, tab.label)}
                                <span>{tab.label}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Center Main Split Area: Left Demo Frame + Right Explanation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                    <div className="lg:col-span-8 rounded-2xl bg-[#090E26] border border-white/15 p-3.5 sm:p-5 flex flex-col md:flex-row gap-4 relative overflow-hidden shadow-2xl">
                        <div className="hidden md:flex flex-col w-36 shrink-0 border-r border-white/10 pr-3 justify-between">
                            <div>
                                <div className="flex items-center gap-1 px-1.5 py-1 mb-3.5">
                                    <span className="font-poppins font-extrabold text-sm text-white">OneChat</span>
                                    <span className="text-xs font-extrabold text-[#A855F7]">AI</span>
                                </div>

                                <div className="space-y-1 text-xs">
                                    {defaultSidebarNavTabs.map((item) => {
                                        if (item.isActive) {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-200 font-semibold shadow-sm cursor-default select-none"
                                                >
                                                    {renderIcon(item.icon, item.label)}
                                                    <span>{item.label}</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-default select-none"
                                            >
                                                {renderIcon(item.icon, item.label)}
                                                <span>{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Compare Content Area */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="mb-3">
                                    <h3 className="font-poppins font-bold text-base sm:text-lg text-white">Compare AI</h3>
                                    <p className="text-xs text-slate-400">Get multiple perspectives on any question.</p>
                                </div>

                                {/* Pre-filled Search/Prompt Input Bar */}
                                <div className="p-2.5 sm:p-3 rounded-xl bg-[#0D1226] border border-white/15 flex items-center justify-between gap-2 shadow-inner mb-3.5">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 truncate">


                                        <Image
                                            src="/assets/images/search.png"
                                            alt="search"
                                            height={20}
                                            width={20}
                                        />
                                        <span className="font-normal italic truncate">Tell me the best travel destinations for 2026</span>
                                    </div>
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-r from-[#00A3FF] to-[#6366F1] flex items-center justify-center text-white shrink-0 text-xs shadow-md font-bold">
                                        <Image src="/assets/images/left-arrow.png"
                                            width={20}
                                            height={20}
                                            alt="arrow"
                                            className="rotate-[180deg]"
                                        />
                                    </div>
                                </div>

                                {/* 4 Models Comparison Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                                    {modelResponses.map((model) => (
                                        <div
                                            key={model.id}
                                            className="rounded-xl bg-[#0E1326] border border-white/10 p-2 sm:p-2.5 flex flex-col justify-between h-[215px] sm:h-[235px] shadow-md relative overflow-hidden"
                                        >
                                            {/* Model Badge */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <img
                                                    src={model.icon}
                                                    alt={model.name}
                                                    className="w-4 h-4 object-contain rounded-full"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                                <span className="text-xs font-bold text-white truncate">{model.name}</span>
                                            </div>

                                            {/* AI Response Text Box */}
                                            <div className="flex-1 overflow-hidden flex flex-col justify-start mb-2">
                                                {isThinking ? (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-100" />
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse delay-200" />
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-4 whitespace-pre-line">
                                                        {displayedTexts[model.id] || "..."}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Card Bottom Image Preview */}
                                            <div className="w-full h-16 sm:h-18 rounded-lg overflow-hidden bg-[#161C36] relative shrink-0">
                                                <img
                                                    src={model.image}
                                                    alt={model.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.opacity = "0.6";
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right: Explanation & Feature Bullets Panel (4 cols on desktop) */}
                    <div className="lg:col-span-4 flex flex-col justify-between p-2 sm:p-4">
                        <div>
                            <h3 className="font-poppins text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                Don&apos;t Ask{" "}
                                <span className="text-[#00A3FF]">One AI.</span> <br />
                                Ask Them All.
                            </h3>

                            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                Compare responses from multiple leading AI models side by side. Get better answers, faster.
                            </p>

                            {/* 4 Feature Checklist Points */}
                            <div className="mt-5 sm:mt-6 space-y-3">
                                {[
                                    "Multiple AI models, one question",
                                    "Compare different perspectives",
                                    "Find the best answer for your needs",
                                    "Save time and get more accurate results",
                                ].map((bullet, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center shrink-0 mt-0.5 text-purple-300 text-xs font-bold shadow-sm">
                                            ✓
                                        </div>
                                        <span className="text-xs sm:text-sm text-slate-200 font-medium">
                                            {bullet}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Try Compare AI CTA Button */}
                        <div className="mt-6 sm:mt-8 pt-2">
                            <button
                                onClick={() => {
                                    const attribution: RegistrationCTAInput = {
                                        cta_id: "compare_try_compare",
                                        cta_label: "Try Compare AI",
                                        section_id: "compare_ai",
                                        section_label: "One Place. Every Way You Use AI.",
                                        item_id: "compare_ai",
                                        item_label: "Compare AI",
                                        page: "landing_page",
                                    };
                                    if (onCTA) {
                                        onCTA(attribution);
                                    } else if (onOpenAuth) {
                                        handleRegistrationCTA(attribution, onOpenAuth);
                                    } else {
                                        handleRegistrationCTA(attribution);
                                    }
                                }}
                                className="w-full group cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl font-sans font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-95"
                            >
                                <span>Try Compare AI</span>
                                <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Row: Leading AI Models Logo Strip */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="text-xs font-semibold text-slate-400 mb-3.5 tracking-wide">
                        Leading AI Models, All in One Platform
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-2.5 items-center">
                        {bottomModels.map((model, idx) => (
                            <div
                                key={idx}
                                title={model.name}
                                className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-lg bg-[#0C1022] border border-white/10 shadow-sm justify-center hover:border-white/20 transition-colors min-w-0 w-full overflow-hidden"
                            >
                                <img
                                    src={model.icon}
                                    alt={model.name}
                                    className="w-3.5 h-3.5 object-contain shrink-0"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                                <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center block px-0.5">
                                    {model.name}
                                </span>
                            </div>
                        ))}

                        {/* "And many more..." Pill */}
                        <div
                            title="And many more..."
                            className="flex items-center justify-center px-1.5 py-3 sm:py-3.5 rounded-lg bg-[#0C1022]/60 border border-white/10 text-[10px] text-slate-400 font-medium col-span-1 min-w-0 w-full overflow-hidden text-center"
                        >
                            <span className="truncate w-full block px-0.5">
                                And many more...
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
