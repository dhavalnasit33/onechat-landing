"use client";
import React from "react";
import Image from "next/image";

interface WanttocreateProps {
  onOpenAuth?: () => void;
}

interface CreateItem {
  title: string;
  image: string;
}

const createItemsData: CreateItem[] = [
  {
    title: "AI Videos",
    image: "/assets/landing-page/image/AI_Videos.png",
  },
  {
    title: "AI Images",
    image: "/assets/landing-page/image/AI_Images.png",
  },
  {
    title: "Social Media Posts",
    image: "/assets/landing-page/image/Social_Media_Posts.png",
  },
  {
    title: "YouTube Content",
    image: "/assets/landing-page/image/YouTube_Content.png",
  },
  {
    title: "Product & Ads",
    image: "/assets/landing-page/image/Product_Ads.png",
  },
  {
    title: "Presentations",
    image: "/assets/landing-page/image/Presentations.png",
  },
  {
    title: "AI Design",
    image: "/assets/landing-page/image/AI_Design.png",
  },
  {
    title: "Documents",
    image: "/assets/landing-page/image/Documents.png",
  },
  {
    title: "AI Writing",
    image: "/assets/landing-page/image/AI_Writing.png",
  },
  {
    title: "Websites",
    image: "/assets/landing-page/image/Websites.png",
  },
  {
    title: "Research",
    image: "/assets/landing-page/image/Research.png",
  },
  {
    title: "Just for Fun",
    image: "/assets/landing-page/image/Just_for_Fun.png",
  },
];

export default function Wanttocreate({ onOpenAuth }: WanttocreateProps) {
  return (
    <section className="relative w-full bg-[#070913] py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(108,86,229,0.2),transparent)] pointer-events-none" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            What do you {" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              want to create?
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn your ideas into amazing content with ready-to-use templates and powerful AI tools.
          </p>
        </div>

        {/* Cards Grid: 2 columns on mobile, 3 on sm, 4 on md, 6 on lg */}
        <div className="w-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4.5">
          {createItemsData.map((item, index) => (
            <div
              key={index}
              onClick={onOpenAuth}
              className="group cursor-pointer relative flex flex-col rounded-2xl bg-[#0F1426] border border-white/10 overflow-hidden shadow-md transform transition-all duration-200 ease-out hover:scale-[1.04] hover:border-purple-500/50 hover:shadow-[0_8px_25px_rgba(108,86,229,0.25)] active:scale-[0.97]"
            >
              {/* Image Preview Container */}
              <div className="relative w-full aspect-[16/11] sm:aspect-[4/3] bg-[#141A32] overflow-hidden flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1426] via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Title / Label */}
              <div className="p-3 sm:p-3.5 bg-[#0F1426] flex items-center justify-start">
                <span className="font-sans text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-200 truncate">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
