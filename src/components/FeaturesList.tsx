"use client";
import React from "react";

interface Feature {
  section: number;
  title: string;
  description: string;
  bullets: string[];
  videoPath: string;
  gradientClass: string; // Tailwind gradient colors e.g. "from-[#EEF2FF] to-[#DBEAFE]"
}

interface FeaturesListProps {
  onOpenAuth: () => void;
}

const featuresData: Feature[] = [
  {
    section: 1,
    title: "Access Every AI Model",
    description: "GPT, Claude, Gemini, and more — all in one place, with no need to juggle multiple subscriptions.",
    bullets: [
      "One subscription, every model — GPT-4o, Claude, Gemini, DeepSeek, Grok, Mistral, and more",
      "No extra logins — access every AI from a single dashboard without managing separate accounts",
      "Always up to date — as new models launch, they get added to OneChat AI automatically",
    ],
    videoPath: "/assets/landing-page/access-every-model-section-1.mp4",
    gradientClass: "from-[#EEF2FF] to-[#DBEAFE]",
  },
  {
    section: 2,
    title: "Image Generation",
    description: "Turn words into stunning visuals — generate, edit, and enhance any image with AI in seconds.",
    bullets: [
      "Generate images from text — create photos, illustrations, and graphics from a simple prompt",
      "Edit and enhance images — remove backgrounds, upscale resolution, and retouch with AI",
      "Design graphics — make logos, social posts, thumbnails, and ads in seconds",
    ],
    videoPath: "/assets/landing-page/image-generation-section-5.mp4",
    gradientClass: "from-[#FFE8F4] to-[#FFD4EC]",
  },
  {
    section: 3,
    title: "Video Generation",
    description: "Create professional videos from a script or idea — no camera, no crew, no editing skills required.",
    bullets: [
      "Generate videos from text — turn ideas and scripts into short videos with AI",
      "Edit and enhance videos — clean up footage, remove backgrounds, and improve quality",
      "Translate and dub videos — reach global audiences with AI-powered translation",
    ],
    videoPath: "/assets/landing-page/generate-video-section-6.mp4",
    gradientClass: "from-[#E8F8FF] to-[#D4EEFF]",
  },
  {
    section: 4,
    title: "Writing & Content",
    description: "From first draft to final publish — AI writing tools for every format, every platform, every audience.",
    bullets: [
      "Write content that converts — blog posts, emails, social posts, and more",
      "Polish anything in seconds — paraphrase, rewrite, and improve any text instantly",
      "Translate across languages — localise content for global audiences with one click",
    ],
    videoPath: "/assets/landing-page/writing-content-section-7.mp4",
    gradientClass: "from-[#FFF7ED] to-[#FFE8D4]",
  },
  {
    section: 5,
    title: "Compare Models Side by Side",
    description: "Ask one question, see how every AI answers it. Pick the best response or combine insights from multiple models.",
    bullets: [
      "One prompt, many answers — send any message to multiple AI models at once and compare",
      "Pick the best — choose your favourite response or combine insights from multiple models into one",
      "Find the right tool for the job — discover which AI is best for coding, writing, or research",
    ],
    videoPath: "/assets/landing-page/compare-ai-models-side-by-side-section-2.mp4",
    gradientClass: "from-[#F0EDFF] to-[#DBEAFE]",
  },
  {
    section: 6,
    title: "Switch Without Leaving the Page",
    description: "Change models mid-conversation without losing context or breaking your flow.",
    bullets: [
      "Seamless model switching — change AI mid-conversation with one click, no copy-pasting required",
      "Context preserved — your conversation history stays intact when you switch models",
      "Best AI for each step — start with one model, switch to another for a specific task, keep going",
    ],
    videoPath: "/assets/landing-page/compare-side-by-side-section-3.mp4",
    gradientClass: "from-[#EEEDFE] to-[#E0DBFF]",
  },
  {
    section: 7,
    title: "Design & Media",
    description: "Create professional visuals in seconds — no design skills, no studio, no expensive software required.",
    bullets: [
      "Generate images and graphics — logos, social posts, thumbnails, and more from a text prompt",
      "Remove backgrounds in one click — clean cutouts for any image, instantly",
      "Upscale and enhance photos — turn low-res images into professional-quality visuals",
    ],
    videoPath: "/assets/landing-page/design-media-section-11.mp4",
    gradientClass: "from-[#FDF2F8] to-[#F0D4EC]",
  },
  {
    section: 9,
    title: "Marketing",
    description: "Plan, create, and launch marketing that actually works — without the agency budget or the wait.",
    bullets: [
      "Content marketing — plan, write, and publish content that attracts customers",
      "Social media — create posts, captions, and full campaigns across every platform",
      "Ad copy — generate headlines, landing pages, and ads that convert",
      "Marketing ideas — get fresh campaign concepts and angles on demand",
    ],
    videoPath: "/assets/landing-page/marketing-section-9.mp4",
    gradientClass: "from-[#FFF3E8] to-[#FAEEDA]",
  },
  {
    section: 10,
    title: "Ecommerce & Shopify",
    description: "Everything you need to sell online — from product listings to full marketing campaigns, built for ecommerce sellers at every level.",
    bullets: [
      "Product descriptions — write compelling copy for any product in seconds",
      "Marketplace listings — optimise titles, descriptions, and keywords for Shopify, Amazon, Etsy, and more",
      "Ecommerce ads & emails — create Facebook, Google, and email campaigns that drive sales",
      "Digital products — create, market, and sell ebooks, courses, templates, and presets",
    ],
    videoPath: "/assets/landing-page/ecommerce-shopify-section-8.mp4",
    gradientClass: "from-[#E1F5EE] to-[#D4F5E4]",
  },
  {
    section: 11,
    title: "Build Online Income",
    description: "Find your path to making money online — and follow a clear, proven plan to get there with AI guiding every step.",
    bullets: [
      "Discover income ideas — find proven ways to make money online that fit your skills and goals",
      "Match ideas to your skills — get personalised side hustles based on what you already know",
      "Step-by-step guides — follow clear playbooks for the most popular online income streams",
    ],
    videoPath: "/assets/landing-page/build-online-income-section-4.mp4",
    gradientClass: "from-[#E8FFE8] to-[#D4F5E8]",
  },
  {
    section: 14,
    title: "Documents & PDFs",
    description: "Work smarter with any document — upload, ask questions, summarise, and take action without leaving your workspace.",
    bullets: [
      "Chat with any document — ask questions and get answers directly from PDFs and files",
      "Edit, fill, and sign PDFs — handle paperwork without installing extra software",
      "Summarise anything — extract key points from long documents in seconds",
    ],
    videoPath: "/assets/landing-page/documents-pdf-section-12.mp4",
    gradientClass: "from-[#EFF6FF] to-[#D4E8FF]",
  },
];

export default function FeaturesList({ onOpenAuth }: FeaturesListProps) {
  return (
    <section id="features" className="w-full py-20 md:py-32 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
            <span className="text-[11px] font-bold text-brand-purple tracking-[1.54px] uppercase font-sans">
              FEATURES
            </span>
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
          </div>

          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[850px]">
            Everything you can do with <span className="text-brand-purple">OneChat AI</span>
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base text-brand-slate max-w-[600px] leading-relaxed">
            Hundreds of AI tools organised around the things that matter most — from making money online to running your entire business.
          </p>
        </div>

        {/* Alternating Feature Blocks */}
        <div className="mt-24 flex flex-col gap-12 sm:gap-20 md:gap-28">
          {featuresData.map((feature, idx) => {
            const isReversed = idx % 2 !== 0;

            return (
              <div
                key={feature.section}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 border-b border-brand-border/40 pb-16 sm:pb-20 lg:pb-24 last:border-0 ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Visual Block: Video Player with Background Glow */}
                <div className="w-full lg:w-1/2 flex items-center justify-center relative">
                  {/* Glowing Blurred Shadow Background */}
                  <div
                    className={`absolute inset-4 bg-gradient-to-br ${feature.gradientClass} rounded-2xl filter blur-3xl opacity-80 pointer-events-none scale-90`}
                  />

                  {/* Video Player Box */}
                  <div className="relative z-10 w-full max-w-[550px] lg:max-w-none rounded-2xl bg-brand-purple p-1.5 sm:p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.15)] border border-brand-purple/20">
                    <div className="overflow-hidden rounded-xl aspect-[16/10] bg-brand-dark">
                      <video
                        src={feature.videoPath}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Block */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
                  <h3 className="font-poppins text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight leading-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-4 font-sans text-sm sm:text-base text-brand-slate font-medium leading-relaxed max-w-[480px]">
                    {feature.description}
                  </p>

                  {/* Bullet points */}
                  <ul className="mt-6 flex flex-col gap-4 max-w-[480px]">
                    {feature.bullets.map((bullet, bIdx) => {
                      const parts = bullet.split(" — ");
                      return (
                        <li key={bIdx} className="flex items-start gap-3 text-sm text-brand-slate leading-relaxed">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center mt-0.5">
                            <svg className="w-3.5 h-3.5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="font-sans font-light text-brand-dark/95">
                            <strong className="font-semibold text-brand-dark">{parts[0]}</strong>
                            {parts[1] && ` — ${parts[1]}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Button */}
                  <div className="mt-10">
                    <button
                      onClick={onOpenAuth}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[15px] font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] transition-all hover:scale-105 cursor-pointer"
                    >
                      Start Your 7-Day Free Trial
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
