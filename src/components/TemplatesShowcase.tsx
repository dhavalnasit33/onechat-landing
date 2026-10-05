"use client";
import React, { useRef } from "react";

interface TemplatesShowcaseProps {
  onOpenAuth?: () => void;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  image: string;
  isVideo?: boolean;
  hasSocialBadges?: boolean;
}

const categories = [
  "Trending",
  "AI Videos",
  "Social Media",
  "YouTube",
  "Business & Marketing",
  "Images",
  "Design",
  "Presentations",
  "Documents",
  "Just for Fun",
];

const topRowTemplates: TemplateItem[] = [
  {
    id: "step-into-history",
    title: "Step into History",
    category: "AI Video Template",
    image: "/assets/landing-page/templates_show_case/Roman Warrior at Sunset Colosseum.png",
    isVideo: true,
  },
  {
    id: "talking-pets",
    title: "Talking Pets",
    category: "AI Video Template",
    image: "/assets/landing-page/templates_show_case/Cool Tabby in Golden Garden Light.png",
    isVideo: true,
  },
  {
    id: "product-showcase",
    title: "Product Showcase",
    category: "AI Video Template",
    image: "/assets/landing-page/templates_show_case/Neon Red and Black Sneaker Ad.png",
    isVideo: true,
  },
  {
    id: "youtube-thumbnail",
    title: "YouTube Thumbnail",
    category: "Design Template",
    image: "/assets/landing-page/templates_show_case/Viral Thumbnails Creator Studio.png",
    isVideo: true,
  },
  {
    id: "social-media-post",
    title: "Social Media Post",
    category: "Design Template",
    image: "/assets/landing-page/templates_show_case/Neon Social Media Influencer Glow.png",
    hasSocialBadges: true,
  },
];

const bottomRowTemplates: TemplateItem[] = [
  {
    id: "photo-to-anime",
    title: "Photo to Anime",
    category: "Image Template",
    image: "/assets/landing-page/templates_show_case/Photo to Anime Cherry Blossom Transformation.png",
  },
  {
    id: "cinematic-landscapes",
    title: "Cinematic Landscapes",
    category: "AI Video Template",
    image: "/assets/landing-page/templates_show_case/Sunset Reflections in an Alpine Lake.png",
    isVideo: true,
  },
  {
    id: "dream-house",
    title: "Dream House",
    category: "AI Video Template",
    image: "/assets/landing-page/templates_show_case/Modern Villa at Sunset by the Pool.png",
    isVideo: true,
  },
];

export default function TemplatesShowcase({ onOpenAuth }: TemplatesShowcaseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleClick = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      window.location.href = "/generate-ai-videos";
    }
  };

  const renderCard = (template: TemplateItem) => (
    <div
      key={template.id}
      onClick={handleClick}
      className="group rounded-2xl bg-[#090D22] border border-[#1E293B]/80 hover:border-[#8B5CF6]/80 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(108,86,229,0.35)] flex flex-col min-w-[220px] sm:min-w-[240px] md:min-w-0"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#101633]">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D22] via-transparent to-transparent opacity-85" />

        {/* Video Play Button */}
        {template.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-black/45 border border-white/40 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-[#6C56E5]/80 group-hover:border-white transition-all duration-300 shadow-lg">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Social Badges */}
        {template.hasSocialBadges && (
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 pointer-events-none">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div className="w-6 h-6 rounded-lg bg-black/80 border border-white/20 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.52z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info Bottom Bar */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-center bg-[#090D22]">
        <h3 className="font-poppins font-bold text-white text-xs sm:text-[13.5px] group-hover:text-[#8B5CF6] transition-colors line-clamp-1">
          {template.title}
        </h3>
        <p className="mt-0.5 font-sans text-[11px] text-[#94A3B8] font-normal">
          {template.category}
        </p>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-[#050711] pt-16 pb-20 md:pt-24 md:pb-28 px-4 text-white">
      {/* Decorative Wave Backgrounds */}
      <div className="absolute top-0 left-0 w-[400px] md:w-[600px] h-auto pointer-events-none z-0 opacity-80 mix-blend-screen">
        <img
          src="/assets/landing-page/templates_show_case/left_side.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain"
        />
      </div>
      <div className="absolute top-0 right-0 w-[600px] md:w-[850px] lg:w-[1050px] h-auto pointer-events-none z-0 opacity-90 mix-blend-screen">
        <img
          src="/assets/landing-page/templates_show_case/right_side.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto object-contain"
        />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Section Header (Left-aligned matching Image 2) */}
        <div className="text-left flex flex-col items-start max-w-3xl mb-10 px-2 sm:px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C56E5]/15 border border-[#6C56E5]/30 mb-3.5">
            <span className="text-[11px] font-bold text-[#D946EF] tracking-[1.54px] uppercase font-sans">
              READY-TO-USE TEMPLATES
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12]">
            Start With What <br />
            You{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              Want to Make.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-3.5 font-sans text-sm sm:text-base md:text-lg text-[#94A3B8] font-normal max-w-xl leading-relaxed">
            You don't have to start from scratch. Choose from hundreds of templates across videos, images, social media, business, design and more.
          </p>

          {/* CTA Button */}
          <div className="mt-6">
            <button
              onClick={handleClick}
              className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base sm:text-lg font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_4px_24px_rgba(0,163,255,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_32px_rgba(255,46,217,0.45)] active:scale-[0.98]"
            >
              <span>Browse All Templates</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        {/* Carousel Outer Container with Left & Right Floating Arrows */}
        <div className="relative px-2 sm:px-6">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-2 lg:-left-4 top-[50%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#090D22] border border-white/20 text-white items-center justify-center hover:bg-[#6C56E5] hover:border-[#6C56E5] transition-all duration-200 cursor-pointer shadow-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-2 lg:-right-4 top-[50%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#090D22] border border-white/20 text-white items-center justify-center hover:bg-[#6C56E5] hover:border-[#6C56E5] transition-all duration-200 shadow-xl cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main Card Panel (Matches 2nd Image Layout) */}
          <div className="w-full bg-[#070A1E]/80 border border-[#1E293B]/70 rounded-[28px] p-4 sm:p-6 md:p-7 backdrop-blur-xl shadow-2xl">
            {/* Category Filter Bar */}
            <div className="w-full mb-6">
              <div
                className="flex items-center gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((category) => {
                  const isActive = category === "Trending";
                  return (
                    <div
                      key={category}
                      className={`flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-default select-none ${
                        isActive
                          ? "bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] text-white shadow-[0_0_20px_rgba(0,163,255,0.4)] font-bold"
                          : "text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      {category}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Templates Cards Grid (5 on Top Row, 3 on Bottom Row) */}
            <div
              ref={scrollContainerRef}
              className="flex flex-col gap-4 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Top Row: 5 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 min-w-[720px] md:min-w-0">
                {topRowTemplates.map(renderCard)}
              </div>

              {/* Bottom Row: 3 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 min-w-[720px] md:min-w-0">
                {bottomRowTemplates.map(renderCard)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
