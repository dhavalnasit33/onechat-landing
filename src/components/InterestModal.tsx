"use client";
import React, { useState, useEffect } from "react";

export interface InterestOption {
  id: string;
  label: string;
  shortLabel: string;
  desc: string;
  iconAsset: string;
  imageAsset: string;
  gradient: [string, string];
}

export const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: "ai_chat",
    label: "AI Chat",
    shortLabel: "AI Chat",
    desc: "Chat with the world's leading AI models.",
    iconAsset: "/assets/landing-page/intrest_select/ai_chat_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/ai_chat_image.png",
    gradient: ["#3B82F6", "#6366F1"],
  },
  {
    id: "image_gen",
    label: "Image Generation",
    shortLabel: "AI Images",
    desc: "Create stunning images with leading AI models.",
    iconAsset: "/assets/landing-page/intrest_select/image_genration_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/image_genration_image.png",
    gradient: ["#0284C7", "#0D9488"],
  },
  {
    id: "video_gen",
    label: "Video Generation",
    shortLabel: "AI Video",
    desc: "Create high-quality videos from text or images.",
    iconAsset: "/assets/landing-page/intrest_select/video_genration_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/video_genration_image.png",
    gradient: ["#DB2777", "#9333EA"],
  },
  {
    id: "compare_models",
    label: "Compare AI Models",
    shortLabel: "Compare Models",
    desc: "Compare responses from multiple AI models side by side.",
    iconAsset: "/assets/landing-page/intrest_select/compare_ai_model_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/compare_ai_model_image.png",
    gradient: ["#4F46E5", "#7C3AED"],
  },
  {
    id: "writing_content",
    label: "Writing & Content",
    shortLabel: "Writing",
    desc: "Generate articles, blog posts, captions and more.",
    iconAsset: "/assets/landing-page/intrest_select/writing_content_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/writing_content_image.png",
    gradient: ["#2563EB", "#06B6D4"],
  },
  {
    id: "social_media_video",
    label: "Social Media AI Videos",
    shortLabel: "Social Videos",
    desc: "Create engaging videos for TikTok, Instagram, YouTube and more.",
    iconAsset: "/assets/landing-page/intrest_select/social_media_ai_video_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/social_media_ai_video_image.png",
    gradient: ["#E11D48", "#9333EA"],
  },
  {
    id: "talking_pets",
    label: "Talking Pets AI Videos",
    shortLabel: "Talking Pets",
    desc: "Create fun and realistic talking pet videos with AI.",
    iconAsset: "/assets/landing-page/intrest_select/talking_pet_ai_video_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/talking_pet_ai_video_image.png",
    gradient: ["#06B6D4", "#6366F1"],
  },
  {
    id: "web_search",
    label: "Web Search",
    shortLabel: "Web Search",
    desc: "Get real-time information from the web with AI.",
    iconAsset: "/assets/landing-page/intrest_select/web_search_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/web_search_image.png",
    gradient: ["#0284C7", "#06B6D4"],
  },
  {
    id: "deep_research",
    label: "Deep Research",
    shortLabel: "Deep Research",
    desc: "Get in-depth research and comprehensive analysis.",
    iconAsset: "/assets/landing-page/intrest_select/deep_research_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/deep_research_image.png",
    gradient: ["#7C3AED", "#C026D3"],
  },
  {
    id: "chat_pdf",
    label: "Chat with PDFs",
    shortLabel: "Chat PDFs",
    desc: "Upload and chat with your PDF documents.",
    iconAsset: "/assets/landing-page/intrest_select/chat_with_pdf_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/chat_with_pdf_image.png",
    gradient: ["#DC2626", "#F97316"],
  },
  {
    id: "notebook_lm",
    label: "Notebook LM",
    shortLabel: "Notebook LM",
    desc: "Organize, summarize and work with your knowledge.",
    iconAsset: "/assets/landing-page/intrest_select/notbook_lm_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/notbook_lm_image.png",
    gradient: ["#6366F1", "#3B82F6"],
  },
  {
    id: "social_media",
    label: "Social Media",
    shortLabel: "Social Media",
    desc: "Create, plan and optimize your social media content.",
    iconAsset: "/assets/landing-page/intrest_select/social_media_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/social_media_image.png",
    gradient: ["#9333EA", "#DB2777"],
  },
  {
    id: "graphic_design",
    label: "Graphic Design",
    shortLabel: "Design",
    desc: "Create stunning visuals, logos, and graphics.",
    iconAsset: "/assets/landing-page/intrest_select/graphic_design_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/graphic_design_image.png",
    gradient: ["#0D9488", "#06B6D4"],
  },
  {
    id: "cloud_storage",
    label: "Cloud Storage",
    shortLabel: "Storage",
    desc: "Store and manage your generated content.",
    iconAsset: "/assets/landing-page/intrest_select/cloud_storage_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/cloud_storage_image.png",
    gradient: ["#3B82F6", "#60A5FA"],
  },
  {
    id: "cover_letter",
    label: "Cover Letter Generator",
    shortLabel: "Cover Letters",
    desc: "Create professional cover letters with AI.",
    iconAsset: "/assets/landing-page/intrest_select/cover_leter_ganreter_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/cover_leter_ganreter_image.png",
    gradient: ["#2563EB", "#60A5FA"],
  },
  {
    id: "email_writer",
    label: "Email Writer",
    shortLabel: "Email Writer",
    desc: "Write professional emails in seconds.",
    iconAsset: "/assets/landing-page/intrest_select/email_write_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/email_write_image.png",
    gradient: ["#7C3AED", "#6366F1"],
  },
  {
    id: "grammar_checker",
    label: "Grammar Checker",
    shortLabel: "Grammar",
    desc: "Check and improve your grammar and writing.",
    iconAsset: "/assets/landing-page/intrest_select/grammer_cheker_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/grammer_cheker_image.png",
    gradient: ["#6366F1", "#8B5CF6"],
  },
  {
    id: "history_video",
    label: "History AI Videos",
    shortLabel: "History Videos",
    desc: "Bring history to life with AI-generated videos.",
    iconAsset: "/assets/landing-page/intrest_select/history_ai_video_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/history_ai_video_image.png",
    gradient: ["#8B5CF6", "#6366F1"],
  },
  {
    id: "viral_video",
    label: "Viral AI Videos",
    shortLabel: "Viral Videos",
    desc: "Create viral and trending videos with AI.",
    iconAsset: "/assets/landing-page/intrest_select/viral_ai_video_icon.png",
    imageAsset: "/assets/landing-page/intrest_select/viral_ai_video_image.png",
    gradient: ["#C026D3", "#E11D48"],
  },
];

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selectedInterests: string[]) => void;
  initialSelected?: string[];
}

export default function InterestModal({
  isOpen,
  onClose,
  onContinue,
  initialSelected = [],
}: InterestModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialSelected);

  useEffect(() => {
    if (isOpen) {
      if (initialSelected && initialSelected.length > 0) {
        setSelectedInterests(initialSelected);
      } else {
        setSelectedInterests([]);
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(label)) {
        return prev.filter((item) => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  const isContinueEnabled = selectedInterests.length >= 3;

  const handleContinueClick = () => {
    if (!isContinueEnabled) return;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("flutter.user_interests", JSON.stringify(selectedInterests));
        sessionStorage.setItem("onechat_selected_interests", JSON.stringify(selectedInterests));
      } catch (_) {}
    }
    onContinue(selectedInterests);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Dialog Container */}
      <div className="relative w-full max-w-[440px] md:max-w-[1170px] h-[95vh] md:h-[92vh] max-h-[890px] my-auto bg-[#070b1e] rounded-[22px] md:rounded-[26px] border border-[#1e3264]/70 shadow-[0_0_60px_rgba(20,40,95,0.45)] p-3.5 sm:p-6 md:p-7 flex flex-col text-white animate-in fade-in zoom-in-95 duration-200 select-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Progress Bar & Header */}
        <div className="w-full max-w-[820px] mx-auto mb-2 sm:mb-3 shrink-0">
          <div className="flex items-center justify-between text-[11px] sm:text-[13.5px] mb-1.5">
            <span className="text-[#94A3B8] font-medium">Almost there! Personalize your experience.</span>
            <span className="font-extrabold bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent text-xs sm:text-[15px]">66%</span>
          </div>
          <div className="w-full h-[6px] sm:h-[8px] bg-[#181D33] rounded-full overflow-hidden">
            <div className="w-[66%] h-full bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
          </div>
        </div>

        {/* Headline & Subtitle */}
        <div className="text-center mb-2 sm:mb-3.5 shrink-0">
          <h2 className="text-[19px] sm:text-2xl md:text-[32px] font-bold text-white tracking-tight leading-tight">
            Which{" "}
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#A855F7] bg-clip-text text-transparent">
              features
            </span>{" "}
            are you most interested in?
          </h2>
          <p className="text-[#94A3B8] text-[10.5px] sm:text-[13px] max-w-[340px] md:max-w-[720px] mx-auto mt-1 leading-snug sm:leading-relaxed">
            Select the features you're most excited to use (choose at least 3). This helps us understand what matters most to you.
          </p>
        </div>

        {/* Feature Cards Grid (Single column on mobile, 2 columns on desktop) */}
        <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3.5 my-1 scrollbar-thin scrollbar-thumb-slate-700">
          {INTEREST_OPTIONS.map((option) => {
            const isSelected = selectedInterests.includes(option.label);
            return (
              <div
                key={option.id}
                onClick={() => toggleInterest(option.label)}
                className={`group relative rounded-[14px] sm:rounded-[16px] px-3 sm:px-3.5 py-2 sm:py-3.5 flex items-center justify-between transition-all duration-150 cursor-pointer border min-h-[60px] sm:min-h-[82px] ${
                  isSelected
                    ? "bg-gradient-to-r from-[#131B3B] to-[#1A244D] border-[#60A5FA] shadow-[0_0_16px_rgba(59,130,246,0.35)]"
                    : "bg-gradient-to-r from-[#0B1028] to-[#111936] border-[#1D2A52] hover:border-[#3B82F6]/60 hover:scale-[1.018] hover:shadow-[0_0_12px_rgba(59,130,246,0.18)]"
                }`}
              >
                {/* Left: Icon & Texts */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  {/* Icon Container with glowing drop shadow matching its gradient color */}
                  <div
                    className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
                    style={{
                      filter: `drop-shadow(0 0 10px ${option.gradient[0]}88)`,
                    }}
                  >
                    <img
                      src={option.iconAsset}
                      alt={option.label}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Description Texts */}
                  <div className="flex flex-col min-w-0 pr-1 sm:pr-2">
                    <span className="font-semibold text-[#F4F6FF] text-[13px] sm:text-[15px] truncate">
                      {option.label}
                    </span>
                    <span className="text-[#9AA3BF] text-[10px] sm:text-[12px] line-clamp-1 leading-snug mt-0.5">
                      {option.desc}
                    </span>
                  </div>
                </div>

                {/* Right: Graphic Preview Image & Solid White Radio Button */}
                <div className="shrink-0 flex items-center gap-2 sm:gap-4 ml-1.5 sm:ml-2">
                  {/* Graphic Preview Image */}
                  <div className="w-[56px] sm:w-[100px] h-[38px] sm:h-[52px] overflow-hidden bg-white/5 shrink-0">
                    <img
                      src={option.imageAsset}
                      alt={`${option.label} preview`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Radio Selection Button - Solid Pure White when selected */}
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all shrink-0 ${
                      isSelected
                        ? "bg-white border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                        : "bg-transparent border-[1.5px] border-[#2E3858] group-hover:border-[#4A5578]"
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Selection Bar & Actions matching mobile screenshots exactly */}
        <div className="mt-2 sm:mt-3.5 p-2.5 sm:p-4 rounded-2xl bg-[#0B1028] border border-[#223059] flex items-center justify-between gap-2 shrink-0">
          
          {/* Left: Selection Counter & 3-Pill Progress Indicator */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-[11.5px] sm:text-[15px] truncate">
                {selectedInterests.length < 3
                  ? "Choose at least 3 features"
                  : "Great selection!"}
              </span>
              <span className="text-[#94A3B8] text-[11px] sm:text-[13.5px] font-medium shrink-0">
                <span className="text-[#38BDF8] font-bold">
                  {selectedInterests.length}
                </span>{" "}
                selected
              </span>
            </div>

            {/* 3-Segment Progress Bar */}
            <div className="flex items-center gap-1 sm:gap-2 w-full max-w-[140px] sm:max-w-[280px]">
              {[0, 1, 2].map((idx) => {
                const isFilled = selectedInterests.length > idx;
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      isFilled
                        ? "bg-gradient-to-r from-[#B84CFF] to-[#3B82F6] shadow-[0_0_8px_rgba(184,76,255,0.4)]"
                        : "bg-[#1E293B]"
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>

          {/* Right: Continue Button + Subtext */}
          <div className="flex flex-col items-end shrink-0">
            <button
              type="button"
              onClick={handleContinueClick}
              disabled={!isContinueEnabled}
              className={`px-4 sm:px-14 py-2 sm:py-3.5 rounded-xl font-bold text-xs sm:text-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isContinueEnabled
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:opacity-95 shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.99]"
                  : "bg-[#151C33] text-[#64748B] cursor-not-allowed"
              }`}
            >
              <span>Continue</span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <span className="text-[#8E95AF] text-[8.5px] sm:text-[11px] mt-1 text-right">
              Next: Start your 7-day free trial.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
