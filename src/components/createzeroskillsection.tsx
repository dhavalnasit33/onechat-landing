"use client";
import React from "react";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";
import { ArrowRight } from "lucide-react";

interface CreateZeroSkillProps {
  onOpenAuth?: () => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
}

export interface ZeroSkillCardItem {
  id: string;
  title: string;
  badge: string;
  image: string;
  badgeBg?: string;
  badgeIconLetter?: string;
  desktopClass: string;
  chatText?: string;
  borderColor: string;
  glowColor: string;
}

export const waveBgPath = "/assets/landing-page/createzeroskillsection/wav.png";

export const zeroSkillItemsData: ZeroSkillCardItem[] = [
  {
    id: "ai-video",
    title: "AI Video",
    badge: "AI Video",
    image: "/assets/landing-page/createzeroskillsection/AI_video.png",
    badgeBg: "bg-rose-500",
    badgeIconLetter: "A",
    desktopClass: "top-[-2%] left-[10%] w-[45%] h-[170px] xl:h-[200px] rotate-[5deg] z-[12]",
    borderColor: "border-rose-500/50 hover:border-rose-400",
    glowColor: "shadow-[0_0_25px_rgba(244,63,94,0.4)]",
  },
  {
    id: "ai-image",
    title: "AI Image",
    badge: "AI Image",
    image: "/assets/landing-page/createzeroskillsection/AI_image.png",
    badgeBg: "bg-blue-500",
    badgeIconLetter: "A",
    desktopClass: "top-[-5%] right-[0%] w-[40%] h-[170px] xl:h-[200px] -rotate-[4deg] z-[8]",
    borderColor: "border-blue-500/50 hover:border-blue-400",
    glowColor: "shadow-[0_0_25px_rgba(59,130,246,0.45)]",
  },
  {
    id: "templates",
    title: "Templates",
    badge: "Templates",
    image: "/assets/landing-page/createzeroskillsection/Templates.png",
    badgeBg: "bg-amber-500",
    badgeIconLetter: "T",
    desktopClass: "top-[33%] left-[0%] w-[27%] h-[190px] xl:h-[215px] rotate-[3deg] z-[14]",
    borderColor: "border-amber-500/50 hover:border-amber-400",
    glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
  },
  {
    id: "design",
    title: "Design",
    badge: "Design",
    image: "/assets/landing-page/createzeroskillsection/Design.png",
    badgeBg: "bg-pink-500",
    badgeIconLetter: "D",
    desktopClass: "top-[37%] left-[28%] w-[30%] h-[135px] xl:h-[150px] rotate-[0.5deg] z-[15]",
    borderColor: "border-pink-500/50 hover:border-pink-400",
    glowColor: "shadow-[0_0_25px_rgba(236,72,153,0.4)]",
  },
  {
    id: "ai-chat",
    title: "AI Chat",
    badge: "AI Chat",
    image: "/assets/landing-page/createzeroskillsection/AI_Chat.png",
    badgeBg: "bg-indigo-500",
    badgeIconLetter: "⚡",
    desktopClass: "top-[30%] right-[0%] w-[40%] h-[130px] xl:h-[140px] rotate-[4deg] z-[16]",
    chatText: "Help me create a marketing plan for my business",
    borderColor: "border-indigo-500/50 hover:border-indigo-400",
    glowColor: "shadow-[0_0_25px_rgba(99,102,241,0.4)]",
  },
  {
    id: "writing",
    title: "Writing",
    badge: "Writing",
    image: "/assets/landing-page/createzeroskillsection/Writing.png",
    badgeBg: "bg-sky-500",
    badgeIconLetter: "W",
    desktopClass: "top-[65%] left-[6%] w-[29%] h-[145px] xl:h-[165px] rotate-[3deg] z-[17]",
    borderColor: "border-sky-500/50 hover:border-sky-400",
    glowColor: "shadow-[0_0_25px_rgba(14,165,233,0.4)]",
  },
  {
    id: "research",
    title: "Research",
    badge: "Research",
    image: "/assets/landing-page/createzeroskillsection/Research.png",
    badgeBg: "bg-blue-600",
    badgeIconLetter: "R",
    desktopClass: "top-[67%] left-[37%] w-[31%] h-[135px] xl:h-[150px] -rotate-[1deg] z-[18]",
    borderColor: "border-blue-600/50 hover:border-blue-500",
    glowColor: "shadow-[0_0_25px_rgba(37,99,235,0.4)]",
  },
  {
    id: "and-more",
    title: "And More...",
    badge: "And More...",
    image: "/assets/landing-page/createzeroskillsection/And_More.png",
    badgeBg: "bg-teal-500",
    badgeIconLetter: "A",
    desktopClass: "top-[60%] right-[0%] w-[30%] h-[145px] xl:h-[165px] -rotate-[4deg] z-[20]",
    borderColor: "border-teal-500/50 hover:border-teal-400",
    glowColor: "shadow-[0_0_25px_rgba(20,184,166,0.4)]",
  },
];

export default function CreateZeroSkillSection({ onOpenAuth, onCTA }: CreateZeroSkillProps) {
  const videoItem = zeroSkillItemsData[0];
  const imageItem = zeroSkillItemsData[1];
  const templatesItem = zeroSkillItemsData[2];
  const designItem = zeroSkillItemsData[3];
  const chatItem = zeroSkillItemsData[4];
  const writingItem = zeroSkillItemsData[5];
  const researchItem = zeroSkillItemsData[6];
  const moreItem = zeroSkillItemsData[7];

  const handleButtonClick = () => {
    const attribution: RegistrationCTAInput = {
      cta_id: "create_anything_start_creating",
      cta_label: "Start Creating Free",
      section_id: "create_anything",
      section_label: "Create Anything With AI",
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
    <section className="relative w-full bg-[#050711] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-24 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.28),rgba(14,165,233,0.20),transparent_70%)] rounded-full blur-[90px] pointer-events-none z-0" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

        {/* Left Side: Typography & Action Button with Left Blue Glow */}
        <div className="w-full lg:w-5/12 flex flex-col items-start z-10 relative">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#00A3FF]/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Create Anything <br className="sm:hidden md:hidden lg:block" />
            With AI. <br />
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#0EA5E9] to-[#38BDF8] bg-clip-text text-transparent">
              Zero Skills{" "}
            </span>
            <span className="bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#FF2ED9] bg-clip-text text-transparent">
              Required.
            </span>
          </h2>

          <p className="mt-4 sm:mt-6 font-sans text-sm sm:text-base md:text-lg text-slate-300  leading-relaxed">
            Chat, create images, make videos, write, design, research and more — all with the world&apos;s leading AI models in one place.
          </p>

          <button
            onClick={handleButtonClick}
            className="mt-6 sm:mt-8 w-full max-w-[400px] group cursor-pointer inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-xl font-sans font-bold text-sm sm:text-base text-white 
            bg-gradient-to-r  from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] 
            transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-[0.98]"
          >
            <span>Start Creating Free</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1 inline-flex items-center">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </button>
        </div>

        {/* Right Side: Exact Overlapping Collage with wav.png */}
        <div className="w-full lg:w-7/12 relative">

          {/* Wave Background Graphic */}
          <div className="absolute -inset-10 lg:-inset-16 pointer-events-none flex items-center justify-center z-0 overflow-visible">
            <img
              src={waveBgPath}
              alt="Wave Glow Threads"
              className="w-full h-full object-contain mix-blend-screen scale-250 lg:scale-120 "
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Ambient fallback glow rings */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,163,255,0.22),rgba(255,46,217,0.18),transparent_70%)] blur-2xl pointer-events-none" />
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP VIEW (lg and up) - Exact Overlapping Floating Collage             */}
          <div className="hidden lg:block relative w-full h-[520px] xl:h-[580px] z-10">
            {zeroSkillItemsData.map((item) => (
              <div
                key={item.id}
                onClick={handleButtonClick}
                className={`absolute group rounded-2xl bg-[#0D1226]/90 border ${item.borderColor} ${item.glowColor} overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:rotate-0 hover:z-30 shadow-xl ${item.desktopClass}`}
              >
                {/* Badge Chip */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold pointer-events-none shadow-md">
                  <span className={`w-3.5 h-3.5 rounded-full ${item.badgeBg} flex items-center justify-center text-[8px] font-bold`}>
                    {item.badgeIconLetter}
                  </span>
                  <span>{item.badge}</span>
                </div>

                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />

                {/* Bottom dark vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* MOBILE VIEW (< lg) - Clean Stacked Collage Grid with Glow & Wave          */}
          <div className="flex lg:hidden flex-col gap-3 relative z-10 w-full mt-4">

            {/* Mobile Row 1: AI Video (Full Width) */}
            <div
              onClick={handleButtonClick}
              className={`group relative w-full h-48 sm:h-56 rounded-2xl bg-[#0D1226]/90 border ${videoItem.borderColor} ${videoItem.glowColor} overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl`}
            >
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                <span className={`w-3.5 h-3.5 rounded-full ${videoItem.badgeBg} flex items-center justify-center text-[8px] font-bold`}>
                  {videoItem.badgeIconLetter}
                </span>
                <span>{videoItem.badge}</span>
              </div>

              <img
                src={videoItem.image}
                alt={videoItem.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Mobile Row 2: AI Image (Left) & Templates (Right) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={handleButtonClick}
                className={`group relative h-36 rounded-2xl bg-[#0D1226]/90 border ${imageItem.borderColor} ${imageItem.glowColor} overflow-hidden rotate-[1.5deg] cursor-pointer transition-all duration-300 hover:scale-105 hover:rotate-0 shadow-xl`}
              >
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                  <span className={`w-3 h-3 rounded-full ${imageItem.badgeBg} flex items-center justify-center text-[7px] font-bold`}>
                    {imageItem.badgeIconLetter}
                  </span>
                  <span>{imageItem.badge}</span>
                </div>
                <img
                  src={imageItem.image}
                  alt={imageItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={handleButtonClick}
                className={`group relative h-36 rounded-2xl bg-[#0D1226]/90 border ${templatesItem.borderColor} ${templatesItem.glowColor} overflow-hidden -rotate-[2deg] cursor-pointer transition-all duration-300 hover:scale-105 hover:rotate-0 shadow-xl`}
              >
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                  <span className={`w-3 h-3 rounded-full ${templatesItem.badgeBg} flex items-center justify-center text-[7px] font-bold`}>
                    {templatesItem.badgeIconLetter}
                  </span>
                  <span>{templatesItem.badge}</span>
                </div>
                <img
                  src={templatesItem.image}
                  alt={templatesItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Mobile Row 3: Design (Left) & AI Chat (Right) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={handleButtonClick}
                className={`group relative h-32 rounded-2xl bg-[#0D1226]/90 border ${designItem.borderColor} ${designItem.glowColor} overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl`}
              >
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                  <span className={`w-3 h-3 rounded-full ${designItem.badgeBg} flex items-center justify-center text-[7px] font-bold`}>
                    {designItem.badgeIconLetter}
                  </span>
                  <span>{designItem.badge}</span>
                </div>
                <img
                  src={designItem.image}
                  alt={designItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* AI Chat Card */}
              <div
                onClick={handleButtonClick}
                className={`group relative h-32 rounded-2xl bg-[#0D1226]/90 border ${chatItem.borderColor} ${chatItem.glowColor} overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl`}
              >
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                  <span className={`w-3 h-3 rounded-full ${chatItem.badgeBg} flex items-center justify-center text-[7px] font-bold`}>
                    {chatItem.badgeIconLetter}
                  </span>
                  <span>{chatItem.badge}</span>
                </div>
                <img
                  src={chatItem.image}
                  alt={chatItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Mobile Row 4: Writing (Left), Research (Middle), And More... (Right) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div
                onClick={handleButtonClick}
                className={`group relative h-28 rounded-2xl bg-[#0D1226]/90 border ${writingItem.borderColor} ${writingItem.glowColor} overflow-hidden rotate-[2deg] cursor-pointer transition-all duration-300 hover:scale-105 hover:rotate-0 shadow-xl`}
              >
                <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${writingItem.badgeBg} flex items-center justify-center text-[6px] font-bold`}>
                    {writingItem.badgeIconLetter}
                  </span>
                  <span className="truncate">{writingItem.badge}</span>
                </div>
                <img
                  src={writingItem.image}
                  alt={writingItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={handleButtonClick}
                className={`group relative h-28 rounded-2xl bg-[#0D1226]/90 border ${researchItem.borderColor} ${researchItem.glowColor} overflow-hidden rotate-[1deg] cursor-pointer transition-all duration-300 hover:scale-105 hover:rotate-0 shadow-xl`}
              >
                <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${researchItem.badgeBg} flex items-center justify-center text-[6px] font-bold`}>
                    {researchItem.badgeIconLetter}
                  </span>
                  <span className="truncate">{researchItem.badge}</span>
                </div>
                <img
                  src={researchItem.image}
                  alt={researchItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={handleButtonClick}
                className={`group relative h-28 rounded-2xl bg-[#0D1226]/90 border ${moreItem.borderColor} ${moreItem.glowColor} overflow-hidden rotate-[0deg] cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl`}
              >
                <div className="absolute top-1.5 left-1.5 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${moreItem.badgeBg} flex items-center justify-center text-[6px] font-bold`}>
                    {moreItem.badgeIconLetter}
                  </span>
                  <span className="truncate">{moreItem.badge}</span>
                </div>
                <img
                  src={moreItem.image}
                  alt={moreItem.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
