"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { handleRegistrationCTA, RegistrationCTAInput } from "@/lib/attribution";

interface SectionTrialCTAProps {
  sectionId: string;
  sectionLabel: string;
  onOpenAuth?: () => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
}

export default function SectionTrialCTA({
  sectionId,
  sectionLabel,
  onOpenAuth,
  onCTA,
}: SectionTrialCTAProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 md:py-28 lg:py-36 px-4 relative z-20">
      <button
        onClick={() => {
          const attribution: RegistrationCTAInput = {
            cta_id: `${sectionId}_start_trial_divider`,
            cta_label: "Start 7-Day Free Trial",
            section_id: sectionId,
            section_label: sectionLabel,
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
        <span className="transition-transform duration-300 group-hover:translate-x-1 inline-flex items-center">
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </span>
      </button>
    </div>
  );
}
