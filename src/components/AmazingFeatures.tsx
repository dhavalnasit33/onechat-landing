import React from "react";

interface Feature {
  title: string;
  desc: string;
  cta: string;
  icon: string;
}

const featuresData: Feature[] = [
  {
    title: "AI Chat",
    desc: "Chat with the world's leading AI models—all from one place.",
    cta: "Start Chatting",
    icon: "/assets/landing-page/ai-chat.png",
  },
  {
    title: "Compare AI Models",
    desc: "Compare answers from multiple AI models side by side.",
    cta: "Compare Models",
    icon: "/assets/landing-page/compare-ai-models.png",
  },
  {
    title: "Deep Research",
    desc: "Explore complex topics and generate detailed, source-backed research reports.",
    cta: "Start Researching",
    icon: "/assets/landing-page/deep-research.png",
  },
  {
    title: "AI Web Search",
    desc: "Search the web and get fast, up-to-date answers with reliable sources.",
    cta: "Search the Web",
    icon: "/assets/landing-page/web-search.png",
  },
  {
    title: "Content Creation",
    desc: "Create anything with AI—text, images, videos, social posts, blogs, essays, and more.",
    cta: "Create Content",
    icon: "/assets/landing-page/content-creation.png",
  },
  {
    title: "AI Writing",
    desc: "Write articles, emails, essays, stories, and professional content in seconds.",
    cta: "Start Writing",
    icon: "/assets/landing-page/ai-writing.png",
  },
  {
    title: "AI Marketing",
    desc: "Create advertisements, campaigns, product copy, and marketing content with AI.",
    cta: "Create Marketing Content",
    icon: "/assets/landing-page/ai-marketing.png",
  },
  {
    title: "Social Media Studio",
    desc: "Create images, videos, captions, posts, and content for every major social platform.",
    cta: "Create Social Content",
    icon: "/assets/landing-page/social-media.png",
  },
  {
    title: "AI Image Generator",
    desc: "Generate stunning images, artwork, and visuals with leading AI image models.",
    cta: "Generate an Image",
    icon: "/assets/landing-page/ai-image-generator.png",
  },
  {
    title: "AI Image Editor",
    desc: "Remove backgrounds, replace objects, enhance photos, and transform images with AI.",
    cta: "Edit an Image",
    icon: "/assets/landing-page/ai-image-editor.png",
  },
  {
    title: "AI Video Generator",
    desc: "Turn text, images, and ideas into videos using leading AI video models.",
    cta: "Generate a Video",
    icon: "/assets/landing-page/ai-video-generator.png",
  },
  {
    title: "Graphic Design",
    desc: "Create professional graphics with an intuitive visual editor and ready-made templates.",
    cta: "Start Designing",
    icon: "/assets/landing-page/graphic-design.png",
  },
  {
    title: "Website Builder",
    desc: "Build beautiful websites and landing pages visually—no coding required.",
    cta: "Build a Website",
    icon: "/assets/landing-page/website-builder.png",
  },
  {
    title: "Email Builder",
    desc: "Design professional emails with drag-and-drop tools and customizable templates.",
    cta: "Create an Email",
    icon: "/assets/landing-page/email-builder.png",
  },
  {
    title: "Document Builder",
    desc: "Create professional reports, proposals, contracts, invoices, HR documents, business documents, and more.",
    cta: "Create a Document",
    icon: "/assets/landing-page/document-builder.png",
  },
  {
    title: "Resume Builder",
    desc: "Build a professional resume quickly with customizable designs and ready-made templates.",
    cta: "Create a Resume",
    icon: "/assets/landing-page/resume-builder.png",
  },
  {
    title: "Cover Letter Generator",
    desc: "Create a polished, personalized cover letter for any job or opportunity.",
    cta: "Create a Cover Letter",
    icon: "/assets/landing-page/cover-letter-builder.png",
  },
  {
    title: "Flyers & Posters",
    desc: "Design eye-catching flyers and posters for events, businesses, promotions, and more.",
    cta: "Start Designing",
    icon: "/assets/landing-page/flyers-posters.png",
  },
  // {
  //   title: "Brochure Builder",
  //   desc: "Create professional brochures for your business, products, services, and marketing campaigns.",
  //   cta: "Create a Brochure",
  //   icon: "/assets/landing-page/brochure-builder.png",
  // },
  {
    title: "Chat With PDFs",
    desc: "Upload any PDF to summarize it, ask questions, and find information instantly.",
    cta: "Chat With a PDF",
    icon: "/assets/landing-page/chat-with-pdfs.png",
  },
  {
    title: "PDF Tools",
    desc: "Convert, edit, merge, split, compress, and manage PDF files with ease.",
    cta: "Explore PDF Tools",
    icon: "/assets/landing-page/pdf-tools.png",
  },
  {
    title: "Document & Data Analysis",
    desc: "Analyze documents, spreadsheets, files, and business data with AI.",
    cta: "Analyze Your Files",
    icon: "/assets/landing-page/document-data-analysis.png",
  },
  {
    title: "Project Management",
    desc: "Plan projects, organize tasks, track progress, and collaborate with your team.",
    cta: "Manage Projects",
    icon: "/assets/landing-page/project-management.png",
  },
  {
    title: "Cloud Storage",
    desc: "Store, organize, manage, and securely share all your files from one place.",
    cta: "Explore Storage",
    icon: "/assets/landing-page/cloud-storage.png",
  },
  {
    title: "Workspaces",
    desc: "Organize your projects, content, documents, files, and ideas in flexible workspaces.",
    cta: "Create a Workspace",
    icon: "/assets/landing-page/workspaces.png",
  },
];

interface AmazingFeaturesProps {
  onOpenAuth: () => void;
}

export default function AmazingFeatures({ onOpenAuth }: AmazingFeaturesProps) {
  return (
    <section id="features" className="w-full py-20 md:py-32 bg-white px-4">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center">
          {/* <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
            <span className="text-[11px] font-bold text-brand-purple tracking-[1.54px] uppercase font-sans">
              AMAZING FEATURES
            </span>
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
          </div> */}

          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[850px]">
            OneChat AI <span className="text-brand-purple">Features</span>
          </h2>
          {/* 
          <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-brand-slate max-w-[750px] leading-relaxed">
            From chat and research to writing, design, and documents — explore the toolkit that powers your entire workflow.
          </p> */}
        </div>

        {/* Feature Cards Grid */}
        {/* Switched back to flex and justify-center to perfectly center the last orphaned card */}
        {/* Feature Cards Grid - 2 cards per row on mobile, 3 cards per row on desktop */}
        <div className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-12">
          {featuresData.map((feature, idx) => (
            <div
              key={idx}
              onClick={onOpenAuth}
              className="group cursor-pointer w-full min-[355px]:w-[calc(50%-6px)] sm:w-[calc(50%-12px)] md:w-[calc(50%-16px)] lg:w-[calc(33.333%-32px)] min-h-[220px] sm:min-h-[280px] md:min-h-[300px] flex flex-col items-center justify-center text-center p-3.5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl bg-white border border-brand-border shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:-rotate-3 hover:border-brand-purple hover:shadow-[0_20px_40px_rgba(108,86,229,0.16)] hover:z-10"
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-[#EEEDFE] flex items-center justify-center overflow-hidden shrink-0 transition-colors duration-300 group-hover:bg-brand-purple/15">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              {/* Title */}
              <h3 className="mt-3 sm:mt-5 font-poppins text-xs sm:text-base md:text-lg font-bold text-brand-dark tracking-tight leading-snug">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 sm:mt-2.5 font-sans text-[11px] sm:text-sm md:text-base text-brand-slate leading-normal sm:leading-relaxed font-medium">
                {feature.desc}
              </p>

              {/* CTA */}
              <div className="mt-3 sm:mt-5 inline-flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm md:text-base font-bold text-brand-purple transition-all duration-300 group-hover:gap-2">
                {feature.cta}
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
