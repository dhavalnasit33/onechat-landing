"use client";
import React from "react";

interface CreateZeroSkillProps {
  onOpenAuth?: () => void;
}

export interface ZeroSkillCardItem {
  id: string;
  title: string;
  badge: string;
  image: string;
  badgeBg?: string;
  badgeIconLetter?: string;
//   borderGlowClass: string;
  desktopClass: string;
  isVideo?: boolean;
  isChat?: boolean;
  chatText?: string;
}

// Background wave image path
export const waveBgPath = "/assets/landing-page/createzeroskillsection/wav.png";

// 8 Items array with exact overlay positions, overlaps, and rotation degrees matching design 1
export const zeroSkillItemsData: ZeroSkillCardItem[] = [
  {
    id: "ai-video",
    title: "AI Video",
    badge: "AI Video",
    image: "/assets/landing-page/createzeroskillsection/AI_video.png",
    badgeBg: "bg-rose-500",
    badgeIconLetter: "A",
    // borderGlowClass: "border-cyan-400/60 shadow-[0_0_30px_rgba(0,163,255,0.45)]",
    desktopClass: "top-[-2%] left-[10%] w-[45%] h-[170px] xl:h-[200px] rotate-[5deg] z-[12]",
    isVideo: false,
  },
  {
    id: "ai-image",
    title: "AI Image",
    badge: "AI Image",
    image: "/assets/landing-page/createzeroskillsection/AI_image.png",
    badgeBg: "bg-blue-500",
    badgeIconLetter: "A",
    // borderGlowClass: "border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.4)]",
    desktopClass: "top-[-5%] right-[0%] w-[40%] h-[170px] xl:h-[200px] -rotate-[4deg] z-[8]",
  },
  {
    id: "templates",
    title: "Templates",
    badge: "Templates",
    image: "/assets/landing-page/createzeroskillsection/Templates.png",
    badgeBg: "bg-amber-500",
    badgeIconLetter: "T",
    // borderGlowClass: "border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.4)]",
    desktopClass: "top-[33%] left-[0%] w-[27%] h-[190px] xl:h-[215px] rotate-[3deg] z-[14]",
  },
  {
    id: "design",
    title: "Design",
    badge: "Design",
    image: "/assets/landing-page/createzeroskillsection/Design.png",
    badgeBg: "bg-pink-500",
    badgeIconLetter: "D",
    // borderGlowClass: "border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.4)]",
    desktopClass: "top-[37%] left-[28%] w-[30%] h-[135px] xl:h-[150px] rotate-[0.5deg] z-[15]",
  },
  {
    id: "ai-chat",
    title: "AI Chat",
    badge: "AI Chat",
    image: "/assets/landing-page/createzeroskillsection/AI_Chat.png",
    badgeBg: "bg-indigo-500",
    badgeIconLetter: "⚡",
    // borderGlowClass: "border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.4)]",
    desktopClass: "top-[30%] right-[0%] w-[40%] h-[130px] xl:h-[140px] rotate-[4deg] z-[16]",
    isChat: true,
    chatText: "Help me create a marketing plan for my business",
  },
  {
    id: "writing",
    title: "Writing",
    badge: "Writing",
    image: "/assets/landing-page/createzeroskillsection/Writing.png",
    badgeBg: "bg-sky-500",
    badgeIconLetter: "W",
    // borderGlowClass: "border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.4)]",
    desktopClass: "top-[65%] left-[6%] w-[29%] h-[145px] xl:h-[165px] rotate-[3deg] z-[17]",
  },
  {
    id: "research",
    title: "Research",
    badge: "Research",
    image: "/assets/landing-page/createzeroskillsection/Research.png",
    badgeBg: "bg-blue-600",
    badgeIconLetter: "R",
    // borderGlowClass: "border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.4)]",
    desktopClass: "top-[67%] left-[37%] w-[31%] h-[135px] xl:h-[150px] -rotate-[1deg] z-[18]",
  },
  {
    id: "and-more",
    title: "And More...",
    badge: "And More...",
    image: "/assets/landing-page/createzeroskillsection/And_More.png",
    badgeBg: "bg-teal-500",
    badgeIconLetter: "A",
    // borderGlowClass: "border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.4)]",
    desktopClass: "top-[60%] right-[0%] w-[30%] h-[145px] xl:h-[165px] -rotate-[4deg] z-[20]",
  },
];

export default function CreateZeroSkillSection({ onOpenAuth }: CreateZeroSkillProps) {
  const videoItem = zeroSkillItemsData[0];
  const imageItem = zeroSkillItemsData[1];
  const templatesItem = zeroSkillItemsData[2];
  const designItem = zeroSkillItemsData[3];
  const chatItem = zeroSkillItemsData[4];
  const writingItem = zeroSkillItemsData[5];
  const researchItem = zeroSkillItemsData[6];
  const moreItem = zeroSkillItemsData[7];

  return (
    <section className="relative w-full bg-[#050711] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
      {/* Ambient background glows */}

       <div className="absolute top-1/4 -left-24 w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.28),rgba(14,165,233,0.20),transparent_70%)] rounded-full blur-[90px] pointer-events-none z-0" />
       
      {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(ellipse_80%_60%_at_60%_50%,rgba(108,86,229,0.2),rgba(0,163,255,0.1),transparent)] pointer-events-none" /> */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Left Side: Typography & Action Button with Left Blue Glow */}
        <div className="w-full lg:w-5/12 flex flex-col items-start z-10 relative">
          {/* Subtle localized glow behind headline */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#00A3FF]/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Create Anything <br className="sm:hidden md:hidden lg:block"/>
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
            onClick={onOpenAuth}
            className="mt-6 sm:mt-8 w-full max-w-[400px] group cursor-pointer inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-xl font-sans font-bold text-sm sm:text-base text-white 
            bg-gradient-to-r  from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] 
            transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-[0.98]"
          >
            <span>Start Creating Free</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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
          {/* ========================================================================= */}
          <div className="hidden lg:block relative w-full h-[520px] xl:h-[580px] z-10">
            {zeroSkillItemsData.map((item) => (
              <div
                key={item.id}
                onClick={onOpenAuth}
                className={`absolute group cursor-pointer rounded-2xl bg-[#0D1226]/90 border overflow-hidden  ${item.desktopClass}`}
              >
                {/* Badge Chip */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold pointer-events-none shadow-md">
                  <span className={`w-3.5 h-3.5 rounded-full ${item.badgeBg} flex items-center justify-center text-[8px] font-bold`}>
                    {item.badgeIconLetter}
                  </span>
                  <span>{item.badge}</span>
                </div>

                {/* Center Play Button for Video */}
                {/* {item.isVideo && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )} */}

                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />

                {/* Bottom dark vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* MOBILE VIEW (< lg) - Clean Stacked Collage Grid with Glow & Wave          */}
          {/* ========================================================================= */}
          <div className="flex lg:hidden flex-col gap-3 relative z-10 w-full mt-4">
            
            {/* Mobile Row 1: AI Video (Full Width) */}
            <div
              onClick={onOpenAuth}
            //   className={`group cursor-pointer relative w-full h-48 sm:h-56 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${videoItem.borderGlowClass}`}
              className={`group cursor-pointer relative w-full h-48 sm:h-56 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98]`}
            >
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                <span className={`w-3.5 h-3.5 rounded-full ${videoItem.badgeBg} flex items-center justify-center text-[8px] font-bold`}>
                  {videoItem.badgeIconLetter}
                </span>
                <span>{videoItem.badge}</span>
              </div>

              {/* <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div> */}

              <img
                src={videoItem.image}
                alt={videoItem.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Mobile Row 2: AI Image (Left) & Templates (Right) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-36 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${imageItem.borderGlowClass} rotate-[1.5deg]`}
                className={`group cursor-pointer relative h-36 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] rotate-[1.5deg]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-36 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${templatesItem.borderGlowClass} -rotate-[2deg]`}
                className={`group cursor-pointer relative h-36 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] -rotate-[2deg]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Mobile Row 3: Design (Left) & AI Chat (Right) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-32 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${designItem.borderGlowClass}`}
                className={`group cursor-pointer relative h-32 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* AI Chat Card */}
              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-32 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${chatItem.borderGlowClass}`}
                className={`group cursor-pointer relative h-32 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Mobile Row 4: Writing (Left), Research (Middle), And More... (Right) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${writingItem.borderGlowClass} rotate-[2deg]`}
                className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] rotate-[2deg]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${researchItem.borderGlowClass} rotate-[1deg]`}
                className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] rotate-[1deg]`}
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
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              <div
                onClick={onOpenAuth}
                // className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] ${moreItem.borderGlowClass} rotate-[0deg]`}
                className={`group cursor-pointer relative h-28 rounded-2xl bg-[#0D1226]/90 border overflow-hidden active:scale-[0.98] rotate-[0deg]`}
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
                  className="w-full h-full object-cover"
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
