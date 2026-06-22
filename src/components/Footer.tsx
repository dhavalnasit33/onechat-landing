"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white py-12 px-6 sm:px-12 md:px-20 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center">
            <img
              src="/assets/images/onechat.png"
              alt="OneChat AI Logo"
              className="h-6 w-6 object-contain"
            />
            <span className="ml-2.5 font-poppins text-base font-bold text-white tracking-tight">
              OneChat AI
            </span>
          </div>
          <p className="text-[13px] text-white/30 font-light">
            &copy; {new Date().getFullYear()} OneChat AI. All rights reserved.
          </p>
        </div>

        {/* Right: Policy Links */}
        <div className="flex items-center gap-6">
          <a
            href="/affiliate"
            className="text-[13px] text-white/40 hover:text-white transition-colors font-light hover:font-medium"
          >
            Affiliates
          </a>
          <a
            href="/privacy-policy"
            className="text-[13px] text-white/40 hover:text-white transition-colors font-light hover:font-medium"
          >
            Privacy
          </a>
          <a
            href="/terms-of-service"
            className="text-[13px] text-white/40 hover:text-white transition-colors font-light hover:font-medium"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
