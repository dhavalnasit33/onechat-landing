"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface HeroProps {
  onOpenAuth?: () => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
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

export const heroWaveBgPath = "/assets/landing-page/Hero_section_wav.png";

export default function Hero({ onOpenAuth, onCTA }: HeroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");
  const [videoSrc, setVideoSrc] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setFadeState("fade-in");
      }, 400); // duration of fade-out
    }, 2500);

    // Defer video loading to prioritize critical assets
    const videoTimer = setTimeout(() => {
      setVideoSrc("/assets/landing-page/see-it-in-actions.mp4");
    }, 1000);

    return () => {
      clearInterval(wordTimer);
      clearTimeout(videoTimer);
    };
  }, []);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#050711] pt-32 pb-24 md:pt-40 md:pb-36 px-4 text-white">
      {/* Background Wave Graphic Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-visible">
        <img
          src={heroWaveBgPath}
          alt="Hero Wave Background"
          className="w-full h-full object-cover md:object-contain opacity-85 mix-blend-screen scale-110 lg:scale-125"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {/* Ambient fallback radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(108,86,229,0.22),rgba(0,163,255,0.12),transparent)] pointer-events-none" />
      </div>

      {/* Ambient background blur circles */}
      <div className="absolute top-1/4 left-5 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 right-5 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto text-center relative z-10">
        {/* Headline */}
        <h1 className="font-poppins text-[24px] min-[375px]:text-[28px] min-[450px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-5xl mx-auto">
          The #1 AI Super App
          <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 mt-1 sm:mt-2">
            <span className="inline text-white font-extrabold">
              for
            </span>
            <div className="h-[36px] min-[375px]:h-[42px] min-[425px]:h-[48px] sm:h-[60px] md:h-[80px] overflow-hidden flex items-center justify-center">
              <span
                className={`inline-block bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent transition-all duration-400 transform text-center font-extrabold tracking-tight whitespace-nowrap ${fadeState === "fade-in"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-6"
                  }`}
              >
                {rotatingWords[wordIndex]}
              </span>
            </div>
          </div>
        </h1>

        {/* CTA Button */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
          <button
            onClick={() => {
              const attribution: RegistrationCTAInput = {
                cta_id: "hero_start_trial",
                cta_label: "Start 7-Day Free Trial",
                section_id: "hero",
                section_label: "The #1 AI Super App",
                page: "landing_page",
              };
              if (onCTA) {
                onCTA(attribution);
              } else if (onOpenAuth) {
                handleRegistrationCTA(attribution, onOpenAuth);
              } else {
                handleRegistrationCTA(attribution);
                window.location.href = "/generate-ai-videos";
              }
            }}
            className="group cursor-pointer inline-flex items-center justify-center gap-2 px-10 sm:px-14 py-4 sm:py-5 rounded-2xl text-lg sm:text-2xl font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-[0.98] whitespace-nowrap"
          >
            <span>Start 7-Day Free Trial</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
          <p className="font-sans text-xs sm:text-sm text-slate-300 font-medium mt-1 tracking-wide">
            {/* Hundreds of AI Models • Dozens of AI Tools • One Platform */}
            Dozens of AI Models • Hundreds of AI Tools & Templates • One Platform

          </p>
        </div>

        {/* Video Card */}
        <div className="mt-12 sm:mt-16 md:mt-20 px-2 sm:px-6">
          <div className="relative w-full max-w-[1200px] mx-auto rounded-2xl md:rounded-3xl border border-white/20 shadow-[0_0_60px_rgba(108,86,229,0.35)] bg-[#0A0D1D]/80 backdrop-blur-sm p-1 sm:p-2">
            <div className="overflow-hidden rounded-xl md:rounded-2xl aspect-[16/10] bg-[#0E1120]">
              <video
                ref={videoRef}
                onClick={handleVideoClick}
                src={videoSrc || undefined}
                autoPlay
                muted
                controls
                loop
                playsInline
                preload="metadata"
                controlsList="nodownload noremoteplayback noplaybackrate"
                disablePictureInPicture
                disableRemotePlayback
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}