"use client";
import React, { useState } from "react";

interface AIModelItem {
    id: string;
    name: string;
    asset: string;
    fallbackIcon?: React.ReactNode;
}

const ROW_1_MODELS: AIModelItem[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        asset: "/assets/landing-page/section-2-chatgpt.png",
    },
    {
        id: "gemini",
        name: "Gemini",
        asset: "/assets/landing-page/section-2-gemini.png",
    },
    {
        id: "claude",
        name: "Claude",
        asset: "/assets/landing-page/section-2-claude.png",
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        asset: "/assets/landing-page/section-2-deepSeek.png",
    },
    {
        id: "llama",
        name: "Llama",
        asset: "/assets/landing-page/section-2-meta-ai.png",
    },
    {
        id: "meta",
        name: "meta",
        asset: "/assets/landing-page/section-2-meta.png",
    },
    {
        id: "grok",
        name: "Grok",
        asset: "/assets/landing-page/section-2-grok.png",
    },
    {
        id: "perplexity",
        name: "Perplexity",
        asset: "/assets/landing-page/section-2-perplexity.png",
    },
];

const ROW_2_MODELS: AIModelItem[] = [
    {
        id: "mistral",
        name: "Mistral",
        asset: "/assets/landing-page/section-2-mistral.png",
    },
    {
        id: "qwen",
        name: "Qwen",
        asset: "/assets/landing-page/section-2-qwen.png",
    },
    {
        id: "minimax",
        name: "MiniMax",
        asset: "/assets/landing-page/section-2-minimax.png",
    },
    {
        id: "glm",
        name: "GLM",
        asset: "/assets/landing-page/section-2-glm.png",
        fallbackIcon: (
            <svg className="w-8 h-8 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4" />
            </svg>
        ),
    },
    {
        id: "nemotron",
        name: "Nemotron",
        asset: "/assets/landing-page/section-2-nemotron.png",
        fallbackIcon: (
            <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-white">
                <span className="text-[#00FF88]">Z</span>
            </div>
        ),
    },
    {
        id: "kimi-k2",
        name: "Kimi K2",
        asset: "/assets/landing-page/section-2-kimi.png",
        fallbackIcon: (
            <div className="flex items-baseline font-bold text-xl text-white">
                <span>K</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5"></span>
            </div>
        ),
    },
    {
        id: "muse-spark",
        name: "Muse Spark",
        asset: "/assets/landing-page/section-2-muse-spark.png",
        fallbackIcon: (
            <div className="w-8 h-8 rounded-md bg-[#76B900] flex items-center justify-center shadow-[0_0_12px_rgba(118,185,0,0.5)]">
                <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11.5H5.5L12 6.5z" />
                </svg>
            </div>
        ),
    },
    {
        id: "and-more",
        name: "And More",
        asset: "",
        fallbackIcon: (
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            </div>
        ),
    },
];

const FEATURES_DATA = [
    {
        title: "All Major AI Models",
        description: "Access ChatGPT, Claude, Gemini, DeepSeek, Grok, and more.",
        icon: (

            <svg xmlns="http://www.w3.org/2000/svg"
                width="40" height="40" viewBox="0 0 64 64" fill="none">
                <defs>
                    <linearGradient id="brainGradient"
                        x1="10" y1="12" x2="54" y2="50"
                        gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#35D5FF" />
                        <stop offset="45%" stop-color="#5575FF" />
                        <stop offset="100%" stop-color="#D52BFF" />
                    </linearGradient>

                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g stroke="url(#brainGradient)"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    filter="url(#glow)">

                    <path d="M30 14
      C27 10 21 11 19 16
      C13 15 10 21 13 26
      C8 30 10 36 15 39
      C13 44 18 49 24 47
      C26 51 29 49 30 46 Z"/>

                    <path d="M34 14
      C37 10 43 11 45 16
      C51 15 54 21 51 26
      C56 30 54 36 49 39
      C51 44 46 49 40 47
      C38 51 35 49 34 46 Z"/>

                    <path d="M32 12 V51" />

                    <path d="M23 18 C27 18 29 22 29 26" />
                    <path d="M15 26 C21 25 26 28 27 32" />
                    <path d="M19 39 C24 38 27 41 28 44" />

                    <path d="M41 18 C37 18 35 22 35 26" />
                    <path d="M49 26 C43 25 38 28 37 32" />
                    <path d="M45 39 C40 38 37 41 36 44" />
                </g>
            </svg>

        ),
    },
    {
        title: "Switch AI Models",
        description: "Choose and switch between leading AI models anytime.",
        icon: (
            <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 32 32" fill="none">
                <defs>
                    <linearGradient id="switchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00F0FF" />
                        <stop offset="100%" stopColor="#D946EF" />
                    </linearGradient>
                </defs>
                <path
                    d="M6 11H23M23 11L18 6M23 11L18 16"
                    stroke="url(#switchGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M26 21H9M9 21L14 16M9 21L14 26"
                    stroke="url(#switchGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
    {
        title: "AI for Every Task",
        description: "Write, research, code, brainstorm, and solve problems.",
        icon: (
            <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 32 32" fill="none">
                <defs>
                    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="50%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                </defs>
                <path
                    d="M16 3C16 10 10 16 3 16C10 16 16 22 16 29C16 22 22 16 29 16C22 16 16 10 16 3Z"
                    fill="url(#starGrad)"
                    opacity="0.85"
                />
                <path
                    d="M25 4C25 6.5 23 8.5 20.5 8.5C23 8.5 25 10.5 25 13C25 10.5 27 8.5 29.5 8.5C27 8.5 25 6.5 25 4Z"
                    fill="#38BDF8"
                    opacity="0.9"
                />
            </svg>
        ),
    },
    {
        title: "One Unified Workspace",
        description: "All your favorite AI models in one convenient place.",
        icon: (
            <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 32 32" fill="none">
                <defs>
                    <linearGradient id="layerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C084FC" />
                        <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                </defs>
                <path
                    d="M16 4L4 10L16 16L28 10L16 4Z"
                    stroke="url(#layerGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M4 16L16 22L28 16"
                    stroke="url(#layerGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M4 22L16 28L28 22"
                    stroke="url(#layerGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];

export default function AccessEveryMajorSection() {
    const renderModelCard = (model: AIModelItem) => {
        return (
            <div
                key={model.id}
                className="group flex flex-col items-center justify-center cursor-pointer select-none"
            >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-[74px] md:h-[74px] lg:w-[82px] lg:h-[82px] rounded-2xl bg-[#0B1024]/90 border border-white/10 p-2.5 sm:p-3 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-purple-500/60 group-hover:scale-105 group-hover:shadow-[0_0_22px_rgba(147,51,234,0.35)] shadow-md">
                    <img
                        src={model.asset}
                        alt={model.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                        }}
                    />
                    <div className="absolute inset-0 hidden items-center justify-center p-2 bg-[#0B1024]">
                        {model.fallbackIcon || (
                            <span className="font-bold text-sm text-purple-300">
                                {model.name[0]}
                            </span>
                        )}
                    </div>
                </div>
                <span className="mt-2 text-[11px] sm:text-xs md:text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
                    {model.name}
                </span>
            </div>
        );
    };

    return (
        <section className="relative w-full bg-[#050711] py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,rgba(108,86,229,0.18),rgba(0,163,255,0.08),transparent)] pointer-events-none" />
            <div className="absolute top-16 left-6 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-6 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-16 left-1/3 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-[1380px] mx-auto flex flex-col items-center z-10">
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                    <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-extrabold text-white tracking-tight leading-tight mb-4">
                        Access All Major {" "}
                        <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
                            AI Models
                        </span>
                    </h2>
                    <p className="font-sans text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Chat with ChatGPT, Claude, Gemini, DeepSeek, Grok, and more — all
                        from one powerful platform. Switch between leading AI models and
                        get the answers you need without juggling multiple apps or
                        subscriptions.
                    </p>
                </div>

                <div className="w-full max-w-[1020px] mx-auto rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-[#0B0F24]/60 p-1 sm:p-1.5 md:p-2 shadow-[0_0_60px_rgba(108,86,229,0.22)] backdrop-blur-xl mb-12 sm:mb-16">
                    <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#030614]">
                        <img
                            src="/assets/landing-page/Access_Every_major_section.png"
                            alt="OneChat AI bringing major AI models together in one chat interface"
                            loading="eager"
                            className="w-full h-auto block object-cover"
                        />
                    </div>
                </div>

                <div className="w-full max-w-[1140px] mx-auto mb-14 sm:mb-20 flex flex-col gap-6 sm:gap-8">
                    {/* Row 1 */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 md:gap-5 justify-items-center">
                        {ROW_1_MODELS.map((model) => renderModelCard(model))}
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 md:gap-5 justify-items-center">
                        {ROW_2_MODELS.map((model) => renderModelCard(model))}
                    </div>
                </div>

                <div className="relative w-full max-w-[1240px] mx-auto rounded-2xl sm:rounded-3xl border border-purple-500/30 overflow-hidden bg-gradient-to-b from-[#1C0E38]/90 via-[#0E0C26]/90 to-[#070918]/95 shadow-[0_0_60px_rgba(147,51,234,0.18)] p-6 sm:p-8 md:p-10 backdrop-blur-xl">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-44 bg-purple-600/30 blur-[75px] pointer-events-none rounded-full" />

                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/10">
                        {FEATURES_DATA.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center text-center px-4 sm:px-6"
                            >
                                <div className="mb-3.5 flex items-center justify-center p-2 rounded-xl bg-purple-950/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    {item.icon}
                                </div>
                                <h3 className="font-poppins text-sm sm:text-base md:text-lg font-bold text-white mb-1.5 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-xs sm:text-[13px] text-slate-400 leading-relaxed max-w-[220px]">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

