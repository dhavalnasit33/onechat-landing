"use client";
import React from "react";

interface AIModel {
  name: string;
  asset: string;
  isLarge: boolean;
}

const row1Models: AIModel[] = [
  { name: "ChatGPT", asset: "/assets/landing-page/section-2-chatgpt.png", isLarge: true },
  { name: "Flux", asset: "/assets/landing-page/section-2-flux.png", isLarge: false },
  { name: "Gemini", asset: "/assets/landing-page/section-2-gemini.png", isLarge: true },
  { name: "GLM", asset: "/assets/landing-page/section-2-glm.png", isLarge: false },
  { name: "Grok", asset: "/assets/landing-page/section-2-grok.png", isLarge: false },
  { name: "DeepSeek", asset: "/assets/landing-page/section-2-deepSeek.png", isLarge: true },
  { name: "Ideogram", asset: "/assets/landing-page/section-2-ideogram.png", isLarge: false },
  { name: "Kimi", asset: "/assets/landing-page/section-2-kimi.png", isLarge: false },
];

const row2Models: AIModel[] = [
  { name: "Kling", asset: "/assets/landing-page/section-2-kling.png", isLarge: false },
  { name: "Meta AI", asset: "/assets/landing-page/section-2-meta-ai.png", isLarge: false },
  { name: "Claude", asset: "/assets/landing-page/section-2-claude.png", isLarge: true },
  { name: "Mimo", asset: "/assets/landing-page/section-2-mimo.png", isLarge: false },
  { name: "Minimax", asset: "/assets/landing-page/section-2-minimax.png", isLarge: false },
  { name: "Mistral", asset: "/assets/landing-page/section-2-mistral.png", isLarge: false },
  { name: "Nano Banana", asset: "/assets/landing-page/section-2-nano-banana.png", isLarge: true },
  { name: "Nvidia", asset: "/assets/landing-page/section-2-nvidia.png", isLarge: false },
  { name: "Perplexity", asset: "/assets/landing-page/section-2-perplexity.png", isLarge: true },
  { name: "Pika", asset: "/assets/landing-page/section-2-pika.png", isLarge: false },
  { name: "Qwen", asset: "/assets/landing-page/section-2-qwen.png", isLarge: false },
  { name: "Recraft", asset: "/assets/landing-page/section-2-recraft.png", isLarge: false },
  { name: "Stable Diffusion", asset: "/assets/landing-page/section-2-stable-diffusion.png", isLarge: true },
  { name: "Runway", asset: "/assets/landing-page/section-2-runway.png", isLarge: false },
  { name: "SeeDream", asset: "/assets/landing-page/section-2-seedream.png", isLarge: false },
  { name: "Sora", asset: "/assets/landing-page/section-2-sora.png", isLarge: false },
  { name: "Veo", asset: "/assets/landing-page/section-2-veo.png", isLarge: true },
];

export default function ModelMarquee() {
  // Triplicate the lists to make the scrolling seamless
  const triplicatedRow1 = [...row1Models, ...row1Models, ...row1Models];
  const triplicatedRow2 = [...row2Models, ...row2Models, ...row2Models];

  const renderModelItem = (model: AIModel, idx: number) => {
    return (
      <div
        key={`${model.name}-${idx}`}
        className="flex flex-col items-center justify-center mx-6 sm:mx-10 shrink-0 select-none group transition-all duration-300 transform hover:-translate-y-2.5 cursor-pointer"
      >
        <div
          className={`relative rounded-full shadow-md bg-white border border-brand-border overflow-hidden transition-all duration-300 group-hover:shadow-xl ${
            model.isLarge
              ? "w-[52px] h-[52px] md:w-[76px] md:h-[76px]"
              : "w-[40px] h-[40px] md:w-[58px] md:h-[58px]"
          }`}
        >
          <img
            src={model.asset}
            alt={model.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextSibling as HTMLDivElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="absolute inset-0 bg-brand-purple/5 hidden flex-col items-center justify-center text-xs font-bold text-brand-purple">
            {model.name[0]}
          </div>
        </div>
        <span className="mt-3 text-[11px] md:text-[13px] font-semibold text-brand-dark/50 group-hover:text-brand-dark/80 transition-colors">
          {model.name}
        </span>
      </div>
    );
  };

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-[#E8F4FF] via-[#F0EDFF] via-[#FAFAFF] to-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Section Title */}
        <h2 className="font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
          250 Million People.{" "}
          <span className="text-brand-purple">Too Many Tools</span>
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-brand-dark/80 max-w-[850px] mx-auto leading-relaxed">
          Every day, more than 250 million people use multiple generative AI tools — switching between ChatGPT, Claude, Gemini, and dozens more. OneChat AI brings every major AI model, and 300+ tools into one place.
        </p>
      </div>

      {/* Marquee Rows Container */}
      <div className="mt-16 overflow-hidden flex flex-col gap-6 md:gap-10">
        {/* Row 1: Left scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-4">
          <div className="flex animate-marquee hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow1.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>

        {/* Row 2: Right scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-4">
          <div className="flex animate-marquee-reverse hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow2.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>
      </div>
    </section>
  );
}
