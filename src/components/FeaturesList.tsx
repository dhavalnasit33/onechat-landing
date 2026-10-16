"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface Feature {
  section: number;
  id: string;
  title: string;
  description: string;
  bullets: string[];
  videoPath?: string;
  imagePath?: string;
  gradientClass: string; // Tailwind gradient colors e.g. "from-[#EEF2FF] to-[#DBEAFE]"
}

interface FeaturesListProps {
  onOpenAuth?: () => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
  type?: "image" | "video" | "all";
}

function FeatureVideo({ videoPath }: { videoPath: string }) {
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            videoRef.current
              ?.play()
              .catch((err) => console.log("Autoplay blocked:", err));
          } else {
            videoRef.current?.pause();
          }
        });
      },
      {
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={isInView ? videoPath : ""}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
    />
  );
}

const featuresData: Feature[] = [
  {
    section: 2,
    id: "image_generation",
    title: "Image Generation",
    description:
      "Turn words into stunning visuals — generate, edit, and enhance any image with AI in seconds.",
    bullets: [
      "Generate images from text — create photos, illustrations, and graphics from a simple prompt",
      "Edit and enhance images — remove backgrounds, upscale resolution, and retouch with AI",
      "Design graphics — make logos, social posts, thumbnails, and ads in seconds",
    ],
    videoPath: "/assets/landing-page/image-generation-section-5.mp4",
    gradientClass: "from-[#EC4899]/30 to-[#8B5CF6]/30",
  },
  {
    section: 3,
    id: "video_generation",
    title: "Video Generation",
    description:
      "Create professional videos from a script or idea — no camera, no crew, no editing skills required.",
    bullets: [
      "Generate videos from text — turn ideas and scripts into short videos with AI",
      "Edit and enhance videos — clean up footage, remove backgrounds, and improve quality",
      "Translate and dub videos — reach global audiences with AI-powered translation",
    ],
    videoPath: "/assets/landing-page/generate-video-section-6.mp4",
    gradientClass: "from-[#00A3FF]/30 to-[#6366F1]/30",
  },
];

export default function FeaturesList({ onOpenAuth, onCTA, type = "all" }: FeaturesListProps) {
  const displayFeatures = featuresData.filter((feature) => {
    if (type === "image") return feature.section === 2; 
    if (type === "video") return feature.section === 3; 
    return true; 
  });

  return (
    <section id={type === "image" ? "image-generation" : type === "video" ? "video-generation" : "demos"} className="w-full py-20 md:py-32 bg-[#050711] px-4">
      <div className="max-w-[1440px] mx-auto">

        <div className="flex flex-col px-2 gap-20 sm:gap-20 lg:gap-24">
          {displayFeatures.map((feature, idx) => {
            // Image section (section 2): text on left, video/image on right (isReversed: true -> lg:flex-row-reverse)
            // Video section (section 3): video on left, text on right (isReversed: false -> lg:flex-row)
            const isReversed = feature.section === 2;

            return (
              <div
                key={feature.section}
                className={`flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 border-b border-white/10 last:border-0 ${isReversed ? "lg:flex-row-reverse" : ""
                  }`}
              >
                <div className={`w-full lg:w-1/2 flex items-center relative ${isReversed ? "lg:justify-end" : "lg:justify-start"}`}>
                  <div
                    className={`absolute inset-4 bg-gradient-to-br ${feature.gradientClass} rounded-2xl filter blur-3xl opacity-70 pointer-events-none scale-90`}
                  />

                  <div className="relative z-10 w-full max-w-[550px] lg:max-w-[580px] rounded-xl bg-[#0E0E24] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-brand-purple">
                    <div className="overflow-hidden rounded-[5px] aspect-[16/10] bg-[#030614] flex items-center justify-center">
                      {feature.imagePath ? (
                        <Image
                          src={feature.imagePath}
                          alt={feature.title}
                          width={550}
                          height={344}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        feature.videoPath && <FeatureVideo videoPath={feature.videoPath} />
                      )}
                    </div>
                  </div>
                </div>

                <div className={`w-full lg:w-1/2 flex flex-col justify-center items-start text-left max-w-[550px] lg:max-w-[520px] mx-auto ${isReversed ? "lg:mr-auto lg:ml-0" : "lg:ml-auto lg:mr-0"}`}>
                  <h3 className="font-poppins text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight text-left">
                    {feature.title}
                  </h3>

                  <p className="mt-4 font-sans text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-[480px] text-left">
                    {feature.description}
                  </p>

                  <ul className="mt-6 flex flex-col gap-4 max-w-[480px] text-left">
                    {feature.bullets.map((bullet, bIdx) => {
                      const parts = bullet.split(" — ");
                      return (
                        <li
                          key={bIdx}
                          className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed"
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center mt-0.5">
                            <svg
                              className="w-3.5 h-3.5 text-brand-purple-light"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                          <span className="font-sans font-light text-slate-300">
                            <strong className="font-semibold text-white">
                              {parts[0]}
                            </strong>
                            {parts[1] && ` — ${parts[1]}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-10 w-full flex justify-start">
                    <button
                      onClick={() => {
                        const attribution: RegistrationCTAInput = {
                          cta_id: `${feature.id}_start_trial`,
                          cta_label: "Start 7-Day Free Trial",
                          section_id: feature.id,
                          section_label: feature.title,
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
                      className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl text-base sm:text-lg font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_30px_rgba(0,163,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,217,0.55)] active:scale-[0.98] whitespace-nowrap"
                    >
                      <span>Start 7-Day Free Trial</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1 inline-flex items-center">
                        <ArrowRight className="w-5 h-5" />
                      </span>
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

