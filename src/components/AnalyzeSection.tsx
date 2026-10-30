"use client";
import {
  ArrowRight,
  BarChart2,
  FileText,
  LayoutGrid,
  PieChart, 
} from "lucide-react";
import {
  RegistrationCTAInput,
  handleRegistrationCTA,
} from "../lib/attribution";

interface AnalyzeSectionProps {
  onOpenAuth?: () => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
}

const imageSrc="/assets/landing-page/File_Data_Section.png"


const FEATURES = [
  {
    title: "Instant Insights",
    description: "Get key metrics and trends from your data automatically.",
    icon: BarChart2,
    color: "text-[#3B82F6]", // Bright Blue
  },
  {
    title: "Beautiful Visualizations",
    description: "Turn raw data into clear, interactive charts and graphs.",
    icon: FileText,
    color: "text-[#D946EF]", // Bright Pink/Magenta
  },
  {
    title: "Multiple File Types",
    description: "Upload Excel, CSV, PDF and more.",
    icon: LayoutGrid,
    color: "text-[#38BDF8]", // Sky Blue
  },
  {
    title: "Ask Follow-Up Questions",
    description: "Drill deeper into your data with natural language.",
    icon: PieChart,
    color: "text-[#E879F9]", // Purple/Pink
  },
];

export default function AnalyzeSection({
  onOpenAuth,
  onCTA,
}: AnalyzeSectionProps) {

  const handleCTAClick = () => {
    const attribution: RegistrationCTAInput = {
      cta_id: "try_file_analysis",
      cta_label: "Try File & Data Analysis",
      section_id: "file_analysis",
      section_label: "File & Data Analysis",
      item_id: "file_analysis",
      item_label: "Analyze",
      page: "landing_page",
    };

    if (onCTA) {
      onCTA(attribution);
    } else if (onOpenAuth) {
      handleRegistrationCTA(attribution, onOpenAuth);
    } else {
      handleRegistrationCTA(attribution);
    }
  };

 
  return (
    <section className="relative w-full bg-[#050711] py-12 md:py-16 px-3 sm:px-6 lg:px-8 overflow-hidden text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(108,86,229,0.18),rgba(0,163,255,0.08),transparent)] pointer-events-none" />
      <div className="absolute top-10 left-5 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-5 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1380px] mx-auto flex flex-col items-center z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex w-fit items-center gap-2 px-3 py-1 mb-3.5">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#E879F9] uppercase">
              TURN DATA INTO INSIGHTS
            </span>
          </div>

          <h2 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
            File & Data{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              Analysis
            </span>
          </h2>

          <p className="font-sans text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
            Upload your files and get instant insights, beautiful
            visualizations, and detailed reports. Turn complex data into clear,
            actionable answers — in seconds.
          </p>
        </div>

      
        {/* Dynamic Image Display Container */}
        <div className="w-full mx-auto rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-[#0B0F24]/60 p-1 sm:p-1.5 md:p-2 shadow-[0_0_60px_rgba(108,86,229,0.22)] backdrop-blur-xl mb-12 sm:mb-16">
          <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#030614]">
              <img
                src={imageSrc}
                alt="preview"
                loading="eager"
                className="w-full h-auto block object-cover"
              />
          </div>
        </div>

        {/* Features Row - With vertical divider lines on desktop only */}
        <div className="grid grid-cols-2 lg:grid-cols-4 w-full max-w-6xl mx-auto mb-10 sm:mb-12 gap-y-6 sm:gap-y-8 lg:gap-y-0 lg:divide-x lg:divide-white/10">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center px-4 sm:px-6 py-4 sm:py-2"
              >
                <div className={`mb-3 flex items-center justify-center ${feature.color}`}>
                  <Icon strokeWidth={2} className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h4 className="font-poppins text-xs sm:text-sm md:text-base font-bold text-white mb-1.5 leading-snug">
                  {feature.title}
                </h4>
                <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 leading-relaxed max-w-[220px]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button - Matches 2nd image style and size */}
        <div className="w-full flex justify-center px-4">
          <button
            onClick={handleCTAClick}
            className="group cursor-pointer inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-sans font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#0099FF] via-[#7B42F6] to-[#E024C3] shadow-[0_0_28px_rgba(0,153,255,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_rgba(224,36,195,0.55)] active:scale-95"
          >
            <span>Try File & Data Analysis</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1 inline-flex items-center">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
