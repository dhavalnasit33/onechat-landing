"use client";
import React from "react";
import Image from "next/image";
import {
    ScanSquare,
    MonitorOff,
    Settings,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface AllthebestProps {
    onOpenAuth?: () => void;
    onCTA?: (attribution: RegistrationCTAInput) => void;
}

export interface AIModelItem {
    name: string;
    icon: string;
    isMore?: boolean;
}

export interface ShowcaseCardItem {
    id: string;
    title: string;
    image: string; // Default image path
    glowColor: string; // Tailwind glow color
    borderColor: string;
    rotation: string; // Tailwind rotation class
    hasPlayButton?: boolean;
}

export interface FeatureBadge {
    id: string;
    label: string;
    icon: React.ReactNode; // Image path, SVG, or emoji
}

// 1. Default Text & Chat Models
export const defaultTextChatModels: AIModelItem[] = [
    { name: "ChatGPT", icon: "/assets/landing-page/section-2-chatgpt.png" },
    { name: "Claude", icon: "/assets/landing-page/section-2-claude.png" },
    { name: "Gemini", icon: "/assets/landing-page/section-2-gemini.png" },
    { name: "DeepSeek", icon: "/assets/landing-page/section-2-deepSeek.png" },
    { name: "Grok", icon: "/assets/landing-page/section-2-grok.png" },
    { name: "Llama", icon: "/assets/landing-page/section-2-meta-ai.png" },
    { name: "Qwen", icon: "/assets/landing-page/section-2-qwen.png" },
    { name: "Kimi", icon: "/assets/landing-page/section-2-kimi.png" },
    { name: "Mistral", icon: "/assets/landing-page/section-2-mistral.png" },
    { name: "And more...", icon: "/assets/images/left-arrow.png", isMore: true },
];

// 2. Default Image Generation Models
export const defaultImageModels: AIModelItem[] = [
    { name: "GPT Image", icon: "/assets/landing-page/section-2-chatgpt.png" },
    { name: "Nano Banana", icon: "/assets/landing-page/section-2-nano-banana.png" },
    { name: "FLUX", icon: "/assets/landing-page/section-2-flux.png" },
    { name: "Seedream", icon: "/assets/landing-page/section-2-seedream.png" },
    { name: "Ideogram", icon: "/assets/landing-page/section-2-ideogram.png" },
    { name: "Recraft", icon: "/assets/landing-page/section-2-recraft.png" },
    { name: "Krea", icon: "/assets/landing-page/section-2-kling.png" },
    { name: "Stable Diffusion", icon: "/assets/landing-page/section-2-stable-diffusion.png" },
    { name: "Qwen Image", icon: "/assets/landing-page/section-2-qwen.png" },
    { name: "And more...", icon: "/assets/images/left-arrow.png", isMore: true },
];

// 3. Default Video Generation Models
export const defaultVideoModels: AIModelItem[] = [
    { name: "Veo", icon: "/assets/landing-page/section-2-veo.png" },
    { name: "Kling", icon: "/assets/landing-page/section-2-kling.png" },
    { name: "Runway", icon: "/assets/landing-page/section-2-runway.png" },
    { name: "Seedance", icon: "/assets/landing-page/section-2-seedream.png" },
    { name: "MiniMax", icon: "/assets/landing-page/section-2-minimax.png" },
    { name: "Wan", icon: "/assets/landing-page/section-2-qwen.png" },
    { name: "Luma", icon: "/assets/landing-page/section-2-mimo.png" },
    { name: "PixVerse", icon: "/assets/landing-page/section-2-pix-verse.png" },
    { name: "Pika", icon: "/assets/landing-page/section-2-pika.png" },
    { name: "And more...", icon: "/assets/images/left-arrow.png", isMore: true },
];

// 4. Default Showcase Floating Cards (Right Side)
export const defaultShowcaseCards: ShowcaseCardItem[] = [
    {
        id: "card-1",
        title: "AI Portrait Art",
        image: "/assets/landing-page/allthebest/girls.png",
        glowColor: "shadow-[0_0_25px_rgba(236,72,153,0.4)]",
        borderColor: "border-pink-500/50 hover:border-pink-400",
        rotation: "rotate-0 lg:rotate-[6deg]",
    },
    {
        id: "card-2",
        title: "Cyberpunk City Video",
        image: "/assets/landing-page/allthebest/fantastic.png",
        glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
        borderColor: "border-amber-500/50 hover:border-amber-400",
        rotation: "rotate-0 lg:-rotate-[3deg]",
        hasPlayButton: true,
    },
    {
        id: "card-3",
        title: "Astronaut Cat in Space",
        image: "/assets/landing-page/allthebest/cat.png",
        glowColor: "shadow-[0_0_25px_rgba(59,130,246,0.45)]",
        borderColor: "border-blue-500/50 hover:border-blue-400",
        rotation: "rotate-0 lg:rotate-[4deg]",
    },
    {
        id: "card-4",
        title: "Futuristic Sneaker",
        image: "/assets/landing-page/allthebest/shose.png",
        glowColor: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
        borderColor: "border-purple-500/50 hover:border-purple-400",
        rotation: "rotate-0 lg:-rotate-[4deg]",
    },
];

// 5. Default Feature Badges (Bottom Left)
export const defaultFeatures: FeatureBadge[] = [
    {
        id: "feat-1",
        label: "Latest models",
        // icon: "/assets/landing-page/createzeroskillsection/Design.png",
        icon: <ScanSquare />,

    },
    {
        id: "feat-2",
        label: "No multiple logins",
        icon: <MonitorOff />,
    },
    {
        id: "feat-3",
        label: "Always updated",
        icon: <Settings />,
    },
    {
        id: "feat-4",
        label: "Great value",
        icon: <ShieldCheck />,
    },
];

// Helper to render model item (purely static, calm, easy to scan)
const renderModelCard = (model: AIModelItem, idx: number) => {
    return (
        <div
            key={idx}
            className="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl cursor-default select-none min-w-0 w-full overflow-hidden"
        >
            <div className="w-6 h-6 min-[380px]:w-7 min-[380px]:h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-1 relative shrink-0">
                {model.isMore ? (
                    <div className="w-6 h-6 min-[380px]:w-7 min-[380px]:h-7 p-1.5 sm:p-2 rounded-full bg-white/10 flex items-center justify-center text-slate-400 text-[9px] sm:text-[10px] font-bold">
                        •••
                    </div>
                ) : (
                    <img
                        src={model.icon}
                        alt={model.name}
                        className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}
            </div>
            <span
                title={model.name}
                className="text-[9px] min-[380px]:text-[10px] sm:text-[11px] font-medium text-slate-300 text-center truncate w-full block px-0.5"
            >
                {model.name}
            </span>
        </div>
    );
};

export default function Allthebest({ onOpenAuth, onCTA }: AllthebestProps) {
    const handleButtonClick = () => {
        const attribution: RegistrationCTAInput = {
            cta_id: "models_explore_all",
            cta_label: "Explore All AI Models",
            section_id: "all_best_ai",
            section_label: "All the Best AI. One Place.",
            page: "landing_page",
        };
        if (onCTA) {
            onCTA(attribution);
        } else if (onOpenAuth) {
            handleRegistrationCTA(attribution, onOpenAuth);
        } else {
            handleRegistrationCTA(attribution);
        }
    };

    return (
        <section className="relative w-full bg-[#030614] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
            {/* Ambient Background Glows & Electric Wave Effects */}
            <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(99,102,241,0.12),transparent)] pointer-events-none" />

            {/* 1. Left Bottom Flowing Wave Overlay */}
            <div className="absolute top-1/2 -left-16 sm:-left-8 w-[600px] sm:w-[850px] md:w-[1050px] max-w-none pointer-events-none z-0 mix-blend-screen opacity-70 md:opacity-80 select-none">
                <img
                    src="/assets/landing-page/allthebest/left_side_wav.png"
                    alt="Left Wave Glow"
                    className="w-full h-auto object-contain"
                />
            </div>

            <div className="relative max-w-[1400px] mx-auto z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center">

                    {/* ================= COLUMN 1 (Left - 4 cols): Headline, CTA, 4 Badges ================= */}
                    <div className="lg:col-span-4 flex flex-col justify-center text-left relative z-10">

                        <div className="inline-flex w-fit items-center gap-2 px-3 py-1 mb-3.5">
                            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#E879F9] uppercase">
                                LEADING AI MODELS
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h2 className="font-poppins text-3xl sm:text-4xl md:text-[44px] lg:text-[48px] font-extrabold text-white tracking-tight leading-[1.15]">
                            All the Best AI. <br />
                        
                            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
                               One Place.
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="mt-3.5 sm:mt-4 font-sans text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-md">
                            Access the world&apos;s leading AI models for chat, image, video, writing, design, research and more — all in one account, one workspace and one subscription.
                        </p>

                        {/* CTA Button */}
                        <div className="mt-5 sm:mt-7">
                            <button
                                onClick={handleButtonClick}
                                className="group cursor-pointer inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm md:text-base text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-95"
                            >
                                <span>Explore All AI Models</span>
                                <span className="transition-transform duration-300 group-hover:translate-x-1 font-bold"><ArrowRight /></span>
                            </button>
                        </div>

                        {/* 4 Feature Badges in a Row */}
                        {/* <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"> */}
                        <div className="flex flex-row justify-between mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 gap-3 sm:gap-4">
                            {defaultFeatures.map((feat) => (
                                <div key={feat.id} className="flex flex-col items-center justify-center sm:items-center gap-1.5 text-center">

                                    <span className="bg-[#061742] rounded-full p-2">{feat.icon}</span>

                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
                                        {feat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ================= COLUMN 2 (Middle - 5 cols): 3 AI Model Category Cards ================= */}
                    <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 relative z-20">

                        {/* 1. Text & Chat Card */}
                        <div className="rounded-2xl bg-[#090D24]/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-md">
                            <div className="text-xs font-bold text-slate-200 mb-2 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                <span>Text & Chat</span>
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-1.5">
                                {defaultTextChatModels.map(renderModelCard)}
                            </div>
                        </div>

                        {/* 2. Image Generation Card */}
                        <div className="rounded-2xl bg-[#090D24]/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-md">
                            <div className="text-xs font-bold text-slate-200 mb-2 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                                <span>Image Generation</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                                {defaultImageModels.map(renderModelCard)}
                            </div>
                        </div>

                        {/* 3. Video Generation Card */}
                        <div className="rounded-2xl bg-[#090D24]/90 border border-white/10 p-3 sm:p-4 shadow-xl backdrop-blur-md">
                            <div className="text-xs font-bold text-slate-200 mb-2 px-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" />
                                <span>Video Generation</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                                {defaultVideoModels.map(renderModelCard)}
                            </div>
                        </div>

                    </div>

                    {/* ================= COLUMN 3 (Right - 3 cols on desktop, 2x2 grid below 1024px): 4 Showcase Cards ================= */}
                    <div className="lg:col-span-3 relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-3.5 py-4 sm:py-6 w-full">
                      
                        {/* Wave Glow Background Effect */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-0 sm:lg:-right-4 w-[320px] sm:w-[500px] md:w-[600px] lg:w-[460px] h-[400px] sm:h-[550px] lg:h-[680px] pointer-events-none z-0 mix-blend-screen opacity-70 md:opacity-80 select-none flex items-center justify-center">
                            <img
                                src="/assets/landing-page/allthebest/right_side_wav.png"
                                alt="Right Wave Glow"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Background Aura */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-blue-600/10 to-transparent blur-2xl pointer-events-none" />

                    
                        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full sm:max-w-full lg:flex lg:flex-col lg:items-center lg:gap-3.5">
                            {defaultShowcaseCards.map((card, idx) => (
                                <div
                                    key={card.id || idx}
                                    className={`relative w-full aspect-[16/10] lg:aspect-auto lg:w-[260px] lg:h-[145px] xl:h-[150px] rounded-xl sm:rounded-2xl overflow-hidden border ${card.borderColor} ${card.glowColor} ${card.rotation} transition-all duration-300 hover:scale-105 hover:rotate-0 hover:z-20 shadow-xl bg-[#0E132D]`}
                                >
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.style.opacity = "0.7";
                                        }}
                                    />

                                    {card.hasPlayButton && (
                                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 border border-white/50 backdrop-blur-sm text-white flex items-center justify-center shadow-lg">
                                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-black flex items-center justify-center text-[9px] sm:text-[10px] font-bold pl-0.5 shadow">
                                                    ▶
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
