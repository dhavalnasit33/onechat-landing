"use client";
import React, { useState, useEffect } from "react";

interface HeroProps {
  onOpenAuth: () => void;
}

const rotatingWords = [
  "Content Creators",
  "Entrepreneurs",
  "Marketers",
  "Freelancers",
  "Online Business Owners",
  "YouTubers",
  "Designers",
  "Small Business Owners",
  "Shopify Sellers",
  "Bloggers",
  "Remote Workers",
  "Social Media Managers",
  "Ecommerce Sellers",
  "Researchers",
  "Students & Learners",
];

export default function Hero({ onOpenAuth }: HeroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setFadeState("fade-in");
      }, 400); // duration of fade-out
    }, 2500);

    return () => clearInterval(wordTimer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FDF8FF] via-[#F0EDFF] to-[#E8F4FF] pt-32 pb-24 md:pt-40 md:pb-36 px-4">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/10 w-96 h-96 bg-brand-purple-light/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h1 className="font-poppins text-3xl sm:text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[950px] mx-auto">
          The Ultimate AI Super App for{" "}
          <div className="h-[48px] sm:h-[60px] md:h-[80px] overflow-hidden flex items-center justify-center mt-1 sm:mt-2">
            <span
              className={`inline-block text-brand-purple transition-all duration-400 transform text-center font-extrabold tracking-tight ${
                fadeState === "fade-in"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-6"
              }`}
            >
              {rotatingWords[wordIndex]}
            </span>
          </div>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 font-sans text-base sm:text-lg md:text-xl text-[#0E1120]/70 max-w-[650px] mx-auto leading-relaxed">
          From idea to income — hundreds of AI tools for every step of building your online business.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="px-10 py-5 rounded-full text-base sm:text-lg font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_8px_32px_rgba(108,86,229,0.32)] transition-all hover:scale-105 hover:shadow-[0_12px_40px_rgba(108,86,229,0.4)] cursor-pointer"
          >
            Start Your 7-Day Free Trial
          </button>
          <p className="font-sans text-[13px] sm:text-[14px] text-brand-dark/50 font-medium mt-2">
            Hundreds of AI tools • Dozens of AI models • One Platform
          </p>
        </div>

        {/* Video Card */}
        <div className="mt-16 md:mt-24 px-2 sm:px-6">
          <div className="relative w-full max-w-[1200px] mx-auto rounded-2xl md:rounded-3xl bg-brand-purple p-1 sm:p-2 md:p-3 shadow-[0_20px_50px_rgba(108,86,229,0.25)] border border-brand-purple/20">
            <div className="overflow-hidden rounded-xl md:rounded-2xl aspect-[16/10] bg-brand-dark">
              <video
                src="/assets/landing-page/see-it-in-actions.mp4"
                controls
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
