"use client";
import React from "react";

interface OneQuestionSectionProps {
  onOpenAuth: () => void;
}

export default function OneQuestionSection({ onOpenAuth }: OneQuestionSectionProps) {
  return (
    <section className="w-full py-16 md:py-24 bg-white px-4 border-t border-brand-border/20">
      <div className="max-w-7xl px-4 mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left Side - Image with Rounded Corners */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[650px] overflow-hidden rounded-2xl shadow-md border border-brand-border/40">
            <img
              src="/assets/landing-page/new-section-image.png"
              alt="One Question. Every AI Model."
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center max-w-[550px] mx-auto">
          <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark tracking-tight leading-tight">
            One Question. Every AI Model.
          </h2>
          
          <p className="mt-5 font-sans text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed max-w-[480px]">
            Not sure which AI model you trust? Get an answer to every major model, choose your answer.
          </p>
        </div>
      </div>
    </section>
  );
}
