"use client";
import React, { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const faqData: FAQItem[] = [
  {
    q: "What exactly is OneChat AI?",
    a: "OneChat AI is an AI super app giving you access to 100+ AI tools, 14 AI models, image generation, video creation, cloud storage, and a full workspace — all under one subscription. Replace Jasper, ChatGPT Plus, Canva, Grammarly, and Runway with one platform from $9.99/mo.",
  },
  {
    q: "How is it different from ChatGPT or Claude?",
    a: "ChatGPT and Claude are AI models. OneChat AI is a platform that includes those models plus 12 others, plus 100+ purpose-built tools for writing, marketing, images, video, and more. One platform on top of all the AI models.",
  },
  {
    q: "Do I need any technical skills?",
    a: "None at all. OneChat AI is built for everyday people — entrepreneurs, creators, freelancers, and business owners. If you can type a sentence, you can use every tool on the platform.",
  },
  {
    q: "What if I already pay for ChatGPT Plus?",
    a: "OneChat AI includes ChatGPT and 13 other models — so you can cancel your separate ChatGPT Plus subscription. Most users save $100–$300/mo by consolidating into OneChat AI.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Every new user gets a free trial to explore OneChat AI before being charged. You can cancel any time before it ends.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. We take your privacy seriously. We never sell your personal data or use your conversations to train AI models. Your prompts and outputs are processed by the AI models you choose to use (such as OpenAI, Anthropic, Google) and are handled according to their respective policies, but we do not retain or share your content for any training purposes. We use industry-standard security practices to protect your account information.",
  },
  {
    q: "How do I contact OneChat AI?",
    a: "You can reach us at support@onechatai.ai for any questions, feedback, billing issues, or technical support. We aim to respond to all inquiries within 1–2 business days.",
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
    <section id="faq" className="w-full py-20 md:py-32 bg-white px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
            <span className="text-[11px] font-bold text-brand-purple tracking-[1.54px] uppercase font-sans">
              FAQ
            </span>
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
          </div>

          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Questions? We've got answers.
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-brand-slate font-medium">
            Everything you need to know about OneChat AI before getting started.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-16 border-t border-brand-border/60">
          {faqData.map((faq, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="border-b border-brand-border/60 overflow-hidden transition-all duration-300 bg-white"
              >
                {/* Header Row */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full flex items-center justify-between py-6 px-4 md:px-6 text-left cursor-pointer hover:bg-brand-bg-light/30 transition-colors focus:outline-none"
                >
                  <span
                    className={`font-poppins text-[15px] sm:text-base md:text-[17px] font-semibold transition-colors duration-200 ${
                      isExpanded ? "text-brand-purple" : "text-brand-dark"
                    }`}
                  >
                    {faq.q}
                  </span>

                  {/* Circle Plus Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                      isExpanded
                        ? "bg-brand-purple border-brand-purple text-white rotate-45"
                        : "bg-[#F8F7FF] border-[#EEEDFE] text-brand-purple"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>

                {/* Animated Answer Body */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isExpanded ? "max-h-[300px] opacity-100 py-4 pb-8" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <p className="px-4 md:px-6 font-sans text-sm sm:text-base text-brand-slate font-light leading-relaxed">
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
            onClick={onOpenAuth}
            className="px-10 py-5 rounded-full text-base sm:text-lg font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_8px_32px_rgba(108,86,229,0.32)] transition-all hover:scale-105 cursor-pointer"
          >
            Start Your 7-Day Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
