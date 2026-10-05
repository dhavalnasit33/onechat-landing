"use client";
import React, { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const faqData: FAQItem[] = [
  {
    q: "What exactly is OneChat AI?",
    a: "OneChat AI is an all-in-one AI super app that brings leading AI models and hundreds of tools together in one platform. You can chat, research, write, create images and videos, design content, build websites and emails, manage projects, store files, work with PDFs, and much more.",
  },
  {
    q: "How is OneChat AI different from other AI platforms?",
    a: "Instead of giving you access to only one AI model or one type of tool, OneChat AI brings leading AI models and a wide range of creation, research, design, productivity, and business tools together. You can do more without switching between different platforms, accounts, and subscriptions.",
  },
  {
    q: "Do I need separate accounts or subscriptions for each AI model?",
    a: "No. You can access all supported AI models directly through your OneChat AI account—without creating or managing separate accounts and subscriptions for every provider.",
  },
  {
    q: "What can I create with OneChat AI?",
    a: "You can create written content, images, videos, social media posts, marketing campaigns, websites, emails, resumes, cover letters, brochures, flyers, posters, business documents, and much more—all from one platform.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. OneChat AI offers a 7-day free trial that allows you to explore and test most of the platform’s features before choosing a paid plan. Usage limits may apply to certain models and resource-intensive features.",
  },
  // {
  //   q: "Is my data private and secure?",
  //   a: "Yes. We take your privacy seriously. We never sell your personal data or use your conversations to train AI models. Your prompts and outputs are processed by the AI models you choose to use (such as OpenAI, Anthropic, Google) and are handled according to their respective policies, but we do not retain or share your content for any training purposes. We use industry-standard security practices to protect your account information.",
  // },
  {
    q: "How do I contact OneChat AI?",
    a: "You can contact us at support@onechatai.ai with questions, feedback, billing concerns, or technical issues. We aim to respond within 1–2 business days.",
  },
];

interface FAQAccordionProps {
  onOpenAuth: () => void;
}

export default function FAQAccordion({ onOpenAuth }: FAQAccordionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-20 md:py-32 bg-[#050711] px-4">
      {" "}
      {/* Dark Background */}
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-[#6C56E5] rounded" />
            <span className="text-[11px] font-bold text-[#6C56E5] tracking-[1.54px] uppercase font-sans">
              FAQ
            </span>
            <div className="w-8 h-[2px] bg-[#6C56E5] rounded" />
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Questions? {" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              We've got answers.
            </span>
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-[#94A3B8] font-medium">
            Everything you need to know about OneChat AI before getting started.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-16 border-t border-white/10">
          {" "}
          {/* Dark border */}
          {faqData.map((faq, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="border-b border-white/10 overflow-hidden transition-all duration-300 bg-transparent"
              >
                {/* Header Row */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between py-6 px-4 md:px-6 text-left cursor-pointer hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span
                    className={`font-poppins text-[15px] sm:text-base md:text-[17px] font-semibold transition-colors duration-200 ${
                      isExpanded ? "text-[#8B5CF6]" : "text-white"
                    }`}
                  >
                    {faq.q}
                  </span>

                  {/* Circle Plus Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                      isExpanded
                        ? "bg-[#6C56E5] border-[#6C56E5] text-white rotate-45"
                        : "bg-[#0F1426] border-white/10 text-[#94A3B8]"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </button>

                {/* Animated Answer Body */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "max-h-[300px] opacity-100 py-4 pb-8"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <p className="px-4 md:px-6 font-sans text-sm sm:text-base text-[#CBD5E1] font-light leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
              else window.location.href = "/generate-ai-videos";
            }}
            className="px-14 py-5 rounded-2xl text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_8px_32px_rgba(0,163,255,0.35)] transition-all hover:scale-105 cursor-pointer"
          >
            Start 7-Day Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
