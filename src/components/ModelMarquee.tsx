"use client";
import React from "react";

interface AIModel {
  name: string;
  asset: string;
  isLarge: boolean;
}

const row1Models: AIModel[] = [
  { name: "ChatGPT", asset: "/assets/landing-page/section-2-chatgpt.png", isLarge: false }, //isLarge: true
  { name: "Claude", asset: "/assets/landing-page/section-2-claude.png", isLarge: false },//isLarge: true
  { name: "Gemini", asset: "/assets/landing-page/section-2-gemini.png", isLarge: false },//isLarge: true
  { name: "DeepSeek", asset: "/assets/landing-page/section-2-deepSeek.png", isLarge: false },//isLarge: true
  { name: "Canva", asset: "/assets/landing-page/section-2-canva.png", isLarge: false },
  { name: "Notion", asset: "/assets/landing-page/section-2-notion.png", isLarge: false },
  { name: "Grammarly", asset: "/assets/landing-page/section-2-grammarly.png", isLarge: false },
  { name: "Copilot", asset: "/assets/landing-page/section-2-microsoft-copilot.png", isLarge: false },
  { name: "Photoshop", asset: "/assets/landing-page/section-2-adobe-photoshop.png", isLarge: false },
  { name: "Grok", asset: "/assets/landing-page/section-2-grok.png", isLarge: false },
  { name: "Ideogram", asset: "/assets/landing-page/section-2-ideogram.png", isLarge: false },
  { name: "Jasper AI", asset: "/assets/landing-page/section-2-jasper-ai.png", isLarge: false },
  { name: "Flux", asset: "/assets/landing-page/section-2-flux.png", isLarge: false },
  { name: "Remove.bg", asset: "/assets/landing-page/section-2-remove-bg.png", isLarge: false },
  { name: "Asana", asset: "/assets/landing-page/section-2-asana.png", isLarge: false },
];

const row2Models: AIModel[] = [
  { name: "Perplexity", asset: "/assets/landing-page/section-2-perplexity.png", isLarge: false }, //isLarge: true
  { name: "Leonardo AI", asset: "/assets/landing-page/section-2-leonardo-ai.png", isLarge: false },
  { name: "Meta AI", asset: "/assets/landing-page/section-2-meta-ai.png", isLarge: false },
  { name: "Stable Diffusion", asset: "/assets/landing-page/section-2-stable-diffusion.png", isLarge: false }, // isLarge: true
  { name: "Google Drive", asset: "/assets/landing-page/section-2-google-drive.png", isLarge: false },
  { name: "Google Docs", asset: "/assets/landing-page/section-2-google-docs.png", isLarge: false },
  { name: "Dropbox", asset: "/assets/landing-page/section-2-dropbox.png", isLarge: false },
  { name: "QuillBot", asset: "/assets/landing-page/section-2-quillbot.png", isLarge: false },
  { name: "Copy.ai", asset: "/assets/landing-page/section-2-copy-ai.png", isLarge: false },
  { name: "ClickUp", asset: "/assets/landing-page/section-2-clickup.png", isLarge: false },
  { name: "Nano Banana", asset: "/assets/landing-page/section-2-nano-banana.png", isLarge: false }, //isLarge: true
  { name: "Kling", asset: "/assets/landing-page/section-2-kling.png", isLarge: false },
  { name: "Mistral", asset: "/assets/landing-page/section-2-mistral.png", isLarge: false },
  { name: "Mailchimp", asset: "/assets/landing-page/section-2-mailchimp.png", isLarge: false },
  { name: "Wix", asset: "/assets/landing-page/section-2-wix.png", isLarge: false },
];

const row3Models: AIModel[] = [
  { name: "WordPress", asset: "/assets/landing-page/section-2-wordpresss.png", isLarge: false },
  { name: "Squarespace", asset: "/assets/landing-page/section-2-squarespace.png", isLarge: false },
  { name: "Wordtune", asset: "/assets/landing-page/section-2-wordtune.png", isLarge: false },
  { name: "Sider AI", asset: "/assets/landing-page/section-2-sider-ai.png", isLarge: false },
  { name: "Poe AI", asset: "/assets/landing-page/section-2-poe-ai.png", isLarge: false },
  { name: "Monica AI", asset: "/assets/landing-page/section-2-monica-ai.png", isLarge: false },
  { name: "Monday.com", asset: "/assets/landing-page/section-2-monday.com.png", isLarge: false },
  { name: "Merlin AI", asset: "/assets/landing-page/section-2-merlin-ai.png", isLarge: false },
  { name: "iCloud", asset: "/assets/landing-page/section-2-icloud-drive.png", isLarge: false },
  { name: "iLovePDF", asset: "/assets/landing-page/section-2-i-love-pdf.png", isLarge: false },
  { name: "ChatPDF", asset: "/assets/landing-page/section-2-chatpdf.png", isLarge: false },
  { name: "Veo", asset: "/assets/landing-page/section-2-veo.png", isLarge: false }, //isLarge: true
  { name: "Sora", asset: "/assets/landing-page/section-2-sora.png", isLarge: false },
  { name: "Runway", asset: "/assets/landing-page/section-2-runway.png", isLarge: false },
  { name: "Pika", asset: "/assets/landing-page/section-2-pika.png", isLarge: false },
  { name: "Recraft", asset: "/assets/landing-page/section-2-recraft.png", isLarge: false },
];

export default function ModelMarquee() {
  // Triplicate the lists to make the scrolling seamless
  const triplicatedRow1 = [...row1Models, ...row1Models, ...row1Models];
  const triplicatedRow2 = [...row2Models, ...row2Models, ...row2Models];
  const triplicatedRow3 = [...row3Models, ...row3Models, ...row3Models];

  const renderModelItem = (model: AIModel, idx: number) => {
    return (
      <div
        key={`${model.name}-${idx}`}
        className="flex flex-col items-center justify-center mx-6 sm:mx-10 shrink-0 select-none group transition-all duration-300 transform hover:-translate-y-2.5 cursor-pointer"
      >
        <div
          className={`relative rounded-full shadow-md bg-white border border-brand-border overflow-hidden transition-all duration-300 group-hover:shadow-xl ${
            model.isLarge
              ? "w-[82px] h-[82px] md:w-[106px] md:h-[120px]"
              : "w-[72px] h-[72px] md:w-[98px] md:h-[98px]"
          }`}
        >
          <img
            src={model.asset}
            alt={model.name}
            loading="lazy"
            decoding="async"
            width={98}
            height={98}
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
      <div className="max-w-[1440px] mx-auto px-4 text-center">
        {/* Section Title */}
        <h2 className="font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
          Replace up to 100 Apps and {" "}
          <span className="text-brand-purple">AI Tools</span>
        </h2>
        {/* <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-brand-dark/80 max-w-[850px] mx-auto leading-relaxed">
          OneChat AI is your all-in-one AI super app. Get access to every major AI model, and 300+ tools, all in one place.
        </p> */}
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

        {/* Row 3: Left scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-4">
          <div className="flex animate-marquee hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow3.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>
      </div>
    </section>
  );
}
