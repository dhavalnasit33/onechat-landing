"use client";
import React from "react";
import {
    Video,
    ImageIcon,
    Share2,
    Flame,
    Landmark,
    ShoppingBag,
    Palette,
    CheckCircle2,
    ArrowRight,
    ArrowDown
} from "lucide-react";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface HastheskillsectionProps {
    onOpenAuth?: () => void;
    onCTA?: (attribution: RegistrationCTAInput) => void;
}

export interface CreationTypeItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive?: boolean;
}

export const defaultCreationTypes: CreationTypeItem[] = [
    {
        id: "video",
        label: "Video",
        icon: <Video className="w-5 h-5 text-white" />,
        isActive: true,
    },
    {
        id: "image",
        label: "Image",
        icon: <ImageIcon className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
    {
        id: "social-media",
        label: "Social Media",
        icon: <Share2 className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
    {
        id: "viral-video",
        label: "Viral Video",
        icon: <Flame className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
    {
        id: "history-video",
        label: "History Video",
        icon: <Landmark className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
    {
        id: "ad-product",
        label: "Ad Product",
        icon: <ShoppingBag className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
    {
        id: "graphic-design",
        label: "Graphic Design",
        icon: <Palette className="w-5 h-5 text-slate-300" />,
        isActive: false,
    },
];

export const defaultSkillBenefits = [
    "No technical skills",
    "Ready-to-use templates",
    "AI handles the complexity",
    "Professional results in minutes",
];

export default function Hastheskillsection({ onOpenAuth, onCTA }: HastheskillsectionProps) {
    const handleSeeHowClick = () => {
        const attribution: RegistrationCTAInput = {
            cta_id: "zero_skills_see_how",
            cta_label: "See How It Works",
            section_id: "zero_skills",
            section_label: "The AI Has the Skills. So You Don't Need Them.",
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
      <section className="relative w-full bg-[#030614] py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
            <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="absolute -top-10 sm:-top-20 -right-16 sm:-right-4 w-[550px] sm:w-[750px] md:w-[900px] h-[550px] sm:h-[750px] pointer-events-none z-0 mix-blend-screen select-none flex items-center justify-center opacity-70 md:opacity-80">
                <img
                    src="/assets/landing-page/hastheskill/hastheskillwav.png"
                    alt="Wave Glow Overlay"
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="relative max-w-[1400px] mx-auto z-10 flex flex-col gap-10 sm:gap-12 lg:gap-14">
                <div className="flex flex-col items-start text-left relative z-10">
                    <div className="inline-flex w-fit items-center gap-2 px-3 py-1 mb-3.5">
                        <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#E879F9] uppercase">
                            ZERO SKILLS REQUIRED
                        </span>
                    </div>
                    <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.15]">
                        The AI Has the{" "}
                        <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] bg-clip-text text-transparent">
                            Skills.
                        </span>
                        <br />
                        So You Don&apos;t Need{" "}
                        <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] bg-clip-text text-transparent">
                            Them.
                        </span>
                    </h2>

                    <p className="mt-3.5 sm:mt-4 font-sans text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                        You don&apos;t need to learn complicated prompting, design software or video editing. Just choose what you want to create, provide a few details, and let OneChat AI do the rest.
                    </p>

                    <div className="mt-5 sm:mt-7">
                        <button
                            onClick={handleSeeHowClick}
                            className="group cursor-pointer inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-sans font-bold text-xs sm:text-sm md:text-base text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-95"
                        >
                            <span>See How It Works</span>
                            <span className="transition-transform duration-300 group-hover:translate-x-1 inline-flex items-center">
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </span>
                        </button>
                    </div>
                    <div className="w-full mt-8 sm:mt-10">
                        <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 lg:gap-x-8 gap-y-3 sm:gap-y-3.5">
                            {defaultSkillBenefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-2 select-none whitespace-nowrap">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 text-emerald-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-slate-200">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3 Steps Process Container */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 items-stretch relative z-10">

                    <div className="hidden lg:flex absolute top-1/2 left-[33.33%] -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-gradient-to-r from-[#00A3FF] to-[#6366F1] border border-blue-300 shadow-[0_0_20px_rgba(0,163,255,0.7)] items-center justify-center text-white font-bold pointer-events-none">
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="hidden lg:flex absolute top-1/2 left-[66.66%] -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-gradient-to-r from-[#00A3FF] to-[#6366F1] border border-blue-300 shadow-[0_0_20px_rgba(0,163,255,0.7)] items-center justify-center text-white font-bold pointer-events-none">
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    {/* Step 1: Choose what you want to create */}
                    <div className="w-full lg:col-span-4 rounded-3xl bg-[#080D24]/90 border border-indigo-500/20 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-200 mb-4 px-1 flex items-center gap-2">
                                <span>1. Choose what you want to create</span>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {defaultCreationTypes.slice(0, 4).map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl cursor-default select-none text-center ${item.isActive
                                            ? "bg-gradient-to-br from-[#6366F1] to-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-300/40"
                                            : "bg-[#0D132D] border border-white/10 text-slate-300"
                                            }`}
                                    >
                                        <div className="mb-1.5 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-semibold truncate w-full">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {defaultCreationTypes.slice(4).map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl cursor-default select-none text-center ${item.isActive
                                            ? "bg-gradient-to-br from-[#6366F1] to-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-300/40"
                                            : "bg-[#0D132D] border border-white/10 text-slate-300"
                                            }`}
                                    >
                                        <div className="mb-1.5 flex items-center justify-center">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-semibold truncate w-full">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Down Arrow between Step 1 and Step 2 */}
                    <div className="flex lg:hidden justify-center items-center py-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#00A3FF] to-[#6366F1] border border-blue-300 shadow-[0_0_18px_rgba(0,163,255,0.7)] flex items-center justify-center text-white text-sm font-bold">
                            <ArrowDown className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Step 2: Add a few details */}
                    <div className="w-full lg:col-span-4 rounded-3xl bg-[#080D24]/90 border border-indigo-500/20 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-200 mb-3 px-1 flex items-center gap-2">
                                <span>2. Add a few details</span>
                            </div>

                            <div className="rounded-2xl bg-[#0B1028] border border-white/10 p-3 sm:p-3.5 mb-3 shadow-inner">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                                    <span className="text-sm">💬</span>
                                    <span>Create a YouTube thumbnail</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[#080C20] border border-white/5 text-xs text-slate-300 font-sans leading-relaxed">
                                    A cinematic thumbnail of ancient Egypt with pyramids, dramatic lighting and bold title text.
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 flex-wrap sm:flex-nowrap">
                                    <div className="px-1.5 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap">
                                        <span className="text-slate-500">Style: </span>
                                        <span className="text-slate-200 font-medium">Cinematic</span>
                                    </div>
                                    <div className="px-1.5 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap">
                                        <span className="text-slate-500">Ratio: </span>
                                        <span className="text-slate-200 font-medium">16:9</span>
                                    </div>
                                    <div className="px-1.5 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap">
                                        <span className="text-slate-500">Model: </span>
                                        <span className="text-slate-200 font-medium">Veo</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#00A3FF] to-[#D946EF] shadow-[0_0_15px_rgba(0,163,255,0.4)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
                                >
                                    <span>Create</span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Down Arrow between Step 2 and Step 3 */}
                    <div className="flex lg:hidden justify-center items-center py-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#00A3FF] to-[#6366F1] border border-blue-300 shadow-[0_0_18px_rgba(0,163,255,0.7)] flex items-center justify-center text-white text-sm font-bold">
                            <ArrowDown className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Step 3: Get amazing results */}
                    <div className="w-full lg:col-span-4 rounded-3xl bg-[#080D24]/90 border border-indigo-500/20 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
                        <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-200 mb-3 px-1 flex items-center gap-2">
                                <span>3. Get amazing results</span>
                            </div>
                            <div className="relative w-full h-[190px] sm:h-[210px] rounded-2xl overflow-hidden border border-blue-500/40 shadow-[0_0_30px_rgba(0,163,255,0.35)] group bg-[#0D132D]">
                                <img
                                    src="/assets/landing-page/hastheskill/Ancient_Egypt_Golden.png"
                                    alt="Generated Ancient Egypt Thumbnail"
                                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/landing-page/createzeroskillsection/Design.png";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
