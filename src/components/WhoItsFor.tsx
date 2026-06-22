"use client";
import React from "react";

interface Audience {
  title: string;
  emoji: string;
  desc: string;
}

const audienceData: Audience[] = [
  {
    title: "Content Creators",
    emoji: "✍️",
    desc: "Write, design, and publish more content in less time — across every platform, every format, every week.",
  },
  {
    title: "Entrepreneurs",
    emoji: "🚀",
    desc: "From first idea to growing business — AI tools for every stage of building something online.",
  },
  {
    title: "Marketers",
    emoji: "📣",
    desc: "Create campaigns, write ad copy, plan content, and run marketing at scale — without the agency price tag.",
  },
  {
    title: "Freelancers",
    emoji: "💼",
    desc: "Deliver better work, win more clients, and run your freelance business like a team of one — powered by AI.",
  },
  {
    title: "Online Business Owners",
    emoji: "🏢",
    desc: "Manage, market, and grow your online business with hundreds of AI tools — all in one place, one subscription.",
  },
  {
    title: "YouTubers",
    emoji: "🎬",
    desc: "Write scripts, generate thumbnails, plan content calendars, and grow your channel faster with AI.",
  },
  {
    title: "Designers",
    emoji: "🎨",
    desc: "Generate images, remove backgrounds, upscale visuals, and create stunning graphics in seconds — no studio needed.",
  },
  {
    title: "Small Business Owners",
    emoji: "🏪",
    desc: "Market locally, respond to reviews, manage content, and compete with bigger brands using AI on your side.",
  },
  {
    title: "Shopify Sellers",
    emoji: "🛍️",
    desc: "Write product descriptions, create ad copy, send email campaigns, and grow your store with AI tools built for ecommerce.",
  },
  {
    title: "Bloggers",
    emoji: "📝",
    desc: "Write SEO-optimised posts, generate ideas, repurpose content, and grow your audience with AI handling the heavy lifting.",
  },
  {
    title: "Remote Workers",
    emoji: "🏠",
    desc: "Stay productive, organised, and ahead of your workload from anywhere — with every AI tool you need in one tab.",
  },
  {
    title: "Social Media Managers",
    emoji: "📱",
    desc: "Plan, write, and schedule content across every platform — and never run out of ideas or miss a post again.",
  },
  {
    title: "Ecommerce Sellers",
    emoji: "🛒",
    desc: "Create product content, run ads, write emails, and grow your online store with AI tools built for selling online.",
  },
  {
    title: "Researchers",
    emoji: "🔍",
    desc: "Run deep research, analyse documents, summarise sources, and find insights faster than ever — all with AI.",
  },
  {
    title: "Students & Learners",
    emoji: "🎓",
    desc: "Study smarter, write better essays, summarise textbooks, and learn anything faster with AI by your side.",
  },
];

export default function WhoItsFor() {
  return (
    <section id="who-its-for" className="w-full py-20 md:py-32 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
            <span className="text-[11px] font-bold text-brand-purple tracking-[1.54px] uppercase font-sans">
              WHO IT'S FOR
            </span>
            <div className="w-8 h-[2px] bg-brand-purple rounded" />
          </div>

          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[850px]">
            <span className="hidden sm:inline">The Ultimate AI Super App for </span>
            <span className="sm:hidden">Built for </span>
            <span className="text-brand-purple">people like you</span>
          </h2>

          {/* <p className="mt-4 font-sans text-sm sm:text-base text-brand-slate max-w-[600px] leading-relaxed">
            <span className="hidden sm:inline">
              Whether you create, build, market, or sell online — OneChat AI gives you every AI tool you need to do it better, faster, and smarter.
            </span>
            <span className="sm:hidden">
              Whether you create, build, market, or sell online — OneChat AI gives you every AI tool you need.
            </span>
          </p> */}
        </div>

        {/* Audience Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {audienceData.map((data, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-5 md:p-9 rounded-2xl bg-white border border-brand-border shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:border-brand-purple hover:shadow-[0_10px_30px_rgba(108,86,229,0.1)] cursor-default select-none text-center"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl select-none leading-none">
                {data.emoji}
              </span>
              <h3 className="mt-4 font-poppins text-sm md:text-base font-bold text-brand-dark tracking-tight">
                {data.title}
              </h3>
              <p className="mt-2.5 font-sans text-[11px] sm:text-xs md:text-[13px] text-brand-slate leading-relaxed font-light line-clamp-3 md:line-clamp-none">
                {data.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
