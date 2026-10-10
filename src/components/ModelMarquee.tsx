import React from "react";

interface AIModel {
  name: string;
  asset: string;
  isLarge: boolean;
}
const row1Models: AIModel[] = [
  {
    name: "ChatGPT",
    asset: "/assets/landing-page/section-2-chatgpt.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "Claude",
    asset: "/assets/landing-page/section-2-claude.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "Gemini",
    asset: "/assets/landing-page/section-2-gemini.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "DeepSeek",
    asset: "/assets/landing-page/section-2-deepSeek.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "Canva",
    asset: "/assets/landing-page/section-2-canva.png",
    isLarge: false,
  },
  {
    name: "Notion",
    asset: "/assets/landing-page/section-2-notion.png",
    isLarge: false,
  },
  {
    name: "Grammarly",
    asset: "/assets/landing-page/section-2-grammarly.png",
    isLarge: false,
  },
  {
    name: "Copilot",
    asset: "/assets/landing-page/section-2-microsoft-copilot.png",
    isLarge: false,
  },
  {
    name: "Photoshop",
    asset: "/assets/landing-page/section-2-adobe-photoshop.png",
    isLarge: false,
  },
  {
    name: "Grok",
    asset: "/assets/landing-page/section-2-grok.png",
    isLarge: false,
  },
  {
    name: "Ideogram",
    asset: "/assets/landing-page/section-2-ideogram.png",
    isLarge: false,
  },
  {
    name: "Jasper AI",
    asset: "/assets/landing-page/section-2-jasper-ai.png",
    isLarge: false,
  },
  {
    name: "Flux",
    asset: "/assets/landing-page/section-2-flux.png",
    isLarge: false,
  },
  {
    name: "Remove.bg",
    asset: "/assets/landing-page/section-2-remove-bg.png",
    isLarge: false,
  },
  {
    name: "Asana",
    asset: "/assets/landing-page/section-2-asana.png",
    isLarge: false,
  },
];

const row2Models: AIModel[] = [
  {
    name: "Perplexity",
    asset: "/assets/landing-page/section-2-perplexity.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "Leonardo AI",
    asset: "/assets/landing-page/section-2-leonardo-ai.png",
    isLarge: false,
  },
  {
    name: "Meta AI",
    asset: "/assets/landing-page/section-2-meta-ai.png",
    isLarge: false,
  },
  {
    name: "Stable Diffusion",
    asset: "/assets/landing-page/section-2-stable-diffusion.png",
    isLarge: false,
  }, // isLarge: true
  {
    name: "Google Drive",
    asset: "/assets/landing-page/section-2-google-drive.png",
    isLarge: false,
  },
  {
    name: "Google Docs",
    asset: "/assets/landing-page/section-2-google-docs.png",
    isLarge: false,
  },
  {
    name: "Dropbox",
    asset: "/assets/landing-page/section-2-dropbox.png",
    isLarge: false,
  },
  {
    name: "QuillBot",
    asset: "/assets/landing-page/section-2-quillbot.png",
    isLarge: false,
  },
  {
    name: "Copy.ai",
    asset: "/assets/landing-page/section-2-copy-ai.png",
    isLarge: false,
  },
  {
    name: "ClickUp",
    asset: "/assets/landing-page/section-2-clickup.png",
    isLarge: false,
  },
  {
    name: "Nano Banana",
    asset: "/assets/landing-page/section-2-nano-banana.png",
    isLarge: false,
  }, //isLarge: true
  {
    name: "Kling",
    asset: "/assets/landing-page/section-2-kling.png",
    isLarge: false,
  },
  {
    name: "Mistral",
    asset: "/assets/landing-page/section-2-mistral.png",
    isLarge: false,
  },
  {
    name: "Mailchimp",
    asset: "/assets/landing-page/section-2-mailchimp.png",
    isLarge: false,
  },
  {
    name: "Wix",
    asset: "/assets/landing-page/section-2-wix.png",
    isLarge: false,
  },
];

const row3Models: AIModel[] = [
  {
    name: "WordPress",
    asset: "/assets/landing-page/section-2-wordpresss.png",
    isLarge: false,
  },
  {
    name: "Squarespace",
    asset: "/assets/landing-page/section-2-squarespace.png",
    isLarge: false,
  },
  {
    name: "Wordtune",
    asset: "/assets/landing-page/section-2-wordtune.png",
    isLarge: false,
  },
  {
    name: "Sider AI",
    asset: "/assets/landing-page/section-2-sider-ai.png",
    isLarge: false,
  },
  {
    name: "Poe AI",
    asset: "/assets/landing-page/section-2-poe-ai.png",
    isLarge: false,
  },
  {
    name: "Monica AI",
    asset: "/assets/landing-page/section-2-monica-ai.png",
    isLarge: false,
  },
  {
    name: "Monday.com",
    asset: "/assets/landing-page/section-2-monday.com.png",
    isLarge: false,
  },
  {
    name: "Merlin AI",
    asset: "/assets/landing-page/section-2-merlin-ai.png",
    isLarge: false,
  },
  {
    name: "iCloud",
    asset: "/assets/landing-page/section-2-icloud-drive.png",
    isLarge: false,
  },
  {
    name: "iLovePDF",
    asset: "/assets/landing-page/section-2-i-love-pdf.png",
    isLarge: false,
  },
  {
    name: "ChatPDF",
    asset: "/assets/landing-page/section-2-chatpdf.png",
    isLarge: false,
  },
  {
    name: "Veo",
    asset: "/assets/landing-page/section-2-veo.png",
    isLarge: false,
  },
  {
    name: "Sora",
    asset: "/assets/landing-page/section-2-sora.png",
    isLarge: false,
  },
  {
    name: "Runway",
    asset: "/assets/landing-page/section-2-runway.png",
    isLarge: false,
  },
  {
    name: "Pika",
    asset: "/assets/landing-page/section-2-pika.png",
    isLarge: false,
  },
  {
    name: "Recraft",
    asset: "/assets/landing-page/section-2-recraft.png",
    isLarge: false,
  },
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
        className="flex flex-col items-center justify-center mx-5 sm:mx-8 md:mx-10 shrink-0 select-none group transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      >
        <div
          className={`relative rounded-full shadow-md bg-[#0F1426] border border-white/10 overflow-hidden transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(108,86,229,0.35)] ${
            model.isLarge
              ? "w-[82px] h-[82px] md:w-[106px] md:h-[106px]"
              : "w-[70px] h-[70px] md:w-[92px] md:h-[92px]"
          }`}
        >
          <img
            src={model.asset}
            alt={model.name}
            loading="lazy"
            decoding="async"
            width={98}
            height={98}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextSibling as HTMLDivElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
          <div className="absolute inset-0 bg-purple-900/40 hidden flex-col items-center justify-center text-xs font-bold text-purple-300">
            {model.name[0]}
          </div>
        </div>
        <span className="mt-2.5 text-[11px] md:text-[13px] font-medium text-slate-400 group-hover:text-white transition-colors">
          {model.name}
        </span>
      </div>
    );
  };

  return (
    <section className="relative w-full bg-[#070913] py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-80 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(108,86,229,0.15),transparent)] pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-4 text-center">
        {/* Section Title with exact gradient headline */}
        <h2 className="font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2E93] bg-clip-text text-transparent">
            Replace up to 100 Apps & AI Tools
          </span>
        </h2>
      </div>

      {/* Marquee Rows Container */}
      <div className="relative mt-12 md:mt-16 overflow-hidden flex flex-col gap-6 md:gap-10">
        {/* Row 1: Left scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-3">
          <div className="flex animate-marquee hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow1.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>

        {/* Row 2: Right scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-3">
          <div className="flex animate-marquee-reverse hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow2.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>

        {/* Row 3: Left scrolling */}
        <div className="relative w-full flex items-center overflow-hidden py-3">
          <div className="flex animate-marquee hover:pause-marquee hover:cursor-pointer">
            {triplicatedRow3.map((model, idx) => renderModelItem(model, idx))}
          </div>
        </div>
      </div>
    </section>
  );
}
