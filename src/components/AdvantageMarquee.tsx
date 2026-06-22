"use client";
import React from "react";

interface AdvantageItem {
  emoji: string;
  title: string;
  desc: string;
}

const advantageData: AdvantageItem[] = [
  {
    emoji: "🛠️",
    title: "Hundreds of AI Tools",
    desc: "100+ specialised tools for writing, marketing, design, research, video, and more — all built for people building online.",
  },
  {
    emoji: "🤖",
    title: "All the Major AI Models",
    desc: "ChatGPT, Claude, Gemini, DeepSeek, Grok, Mistral, and more — all under one subscription. Switch any time.",
  },
  {
    emoji: "✍️",
    title: "Best-in-Class Writing Tools",
    desc: "Blog posts, emails, ad copy, sales pages — AI writing tools that produce professional, publish-ready content in minutes.",
  },
  {
    emoji: "📣",
    title: "Powerful Marketing Tools",
    desc: "SEO, social media, email campaigns, ads, PR, and competitor research — every marketing tool your business needs.",
  },
  {
    emoji: "🎨",
    title: "AI Images & Video",
    desc: "Generate stunning visuals, product images, logos, and AI-powered videos without a designer or production team.",
  },
  {
    emoji: "💰",
    title: "Save $300+ Per Month",
    desc: "Replace Jasper, ChatGPT Plus, Canva Pro, Grammarly, Runway, and more with one affordable subscription from $9.99/mo",
  },
  {
    emoji: "😊",
    title: "Easy for Anyone to Use",
    desc: "No technical skills needed. Every tool is built for everyday people — not engineers. If you can type, you can use it.",
  },
  {
    emoji: "🏢",
    title: "Your Complete AI Workspace",
    desc: "Projects, cloud storage, documents, and your full AI toolkit — all in one tab. Stop switching between apps.",
  },
  {
    emoji: "🔍",
    title: "Deep Research Capabilities",
    desc: "Research competitors, markets, and topics with AI depth. Analyse PDFs and get insights in minutes — not hours.",
  },
  {
    emoji: "⚡",
    title: "Move 10x Faster",
    desc: "Do in minutes what used to take hours or days. AI handles the heavy lifting so you can focus on growth.",
  },
  {
    emoji: "🚀",
    title: "Built for Online Business",
    desc: "Not a generic AI tool. Every feature is designed specifically for entrepreneurs, creators, and online business owners.",
  },
  {
    emoji: "🔒",
    title: "One Login. Everything Included.",
    desc: "One account, one password, one subscription. No more managing a dozen logins, billing dates, and separate tools.",
  },
];

interface AdvantageMarqueeProps {
  onOpenAuth: () => void;
}

export default function AdvantageMarquee({ onOpenAuth }: AdvantageMarqueeProps) {
  // Duplicate 3 times to ensure a seamless looping marquee
  const triplicatedData = [...advantageData, ...advantageData, ...advantageData];

  return (
    <section id="why-us" className="w-full py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Section Header */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
            <span className="text-[11px] font-bold text-brand-purple tracking-[1.54px] uppercase font-sans">
              YOUR UNFAIR ADVANTAGE
            </span>
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
          </div>

          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[850px]">
            Built to give you an edge online
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-brand-slate max-w-[800px] leading-relaxed font-medium">
            One platform. Hundreds of tools. All the major AI models. Everything you need to build, grow, and earn online — at a fraction of what you'd pay elsewhere.
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] transition-all hover:scale-105 cursor-pointer"
            >
              Start Your 7-Day Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Scrolling Cards Marquee */}
      <div className="mt-16 overflow-hidden relative w-full flex items-center py-6">
        <div className="flex animate-marquee hover:pause-marquee hover:cursor-pointer">
          {triplicatedData.map((item, idx) => (
            <div
              key={idx}
              className="w-[200px] md:w-[288px] h-[260px] md:h-[340px] p-5 md:p-8 shrink-0 mx-3 rounded-2xl bg-white border border-brand-border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:border-brand-purple hover:shadow-[0_15px_30px_rgba(108,86,229,0.12)] group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl md:text-4xl select-none leading-none">
                  {item.emoji}
                </span>
                <h4 className="mt-4 font-poppins text-sm md:text-base font-bold text-brand-dark tracking-tight leading-snug">
                  {item.title}
                </h4>
                <p className="mt-3 font-sans text-[11px] md:text-xs text-brand-slate leading-relaxed font-light line-clamp-4 md:line-clamp-none">
                  {item.desc}
                </p>
              </div>

              {/* Bottom decorative line */}
              <div className="h-[3px] w-full rounded bg-brand-border group-hover:bg-brand-purple transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
