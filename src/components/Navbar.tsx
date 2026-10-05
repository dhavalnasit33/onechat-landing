"use client";
import React, { useState, useEffect } from "react";

interface NavbarProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["faq"];
      let current = "home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 100) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === "contact-us") {
      window.location.href = "mailto:support@onechatai.ai";
      return;
    }
    if (id === "our-affiliates") {
      window.open("https://onechatai.ai/affiliate", "_blank");
      return;
    }
    if (id === "faq") {
      setActiveSection("faq");
      const el = document.getElementById("faq");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
  };

  const navItems = [
    { label: "FAQ", id: "faq" },
    { label: "Contact Us", id: "contact-us" },
    { label: "Join Affiliates", id: "our-affiliates" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#070913]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <img
              src="/assets/images/onechat.png"
              alt="OneChat AI Logo"
              width={32}
              height={32}
              decoding="async"
              className="h-8 w-8 object-contain"
            />
            <span className="ml-2.5 font-poppins text-lg md:text-xl font-extrabold tracking-tight text-white">
              OneChat AI
            </span>
          </div>

          {/* Desktop Nav items */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-[13px] lg:text-[14px] font-semibold transition-colors hover:text-white cursor-pointer whitespace-nowrap ${activeSection === item.id
                    ? "text-[#00A3FF]"
                    : "text-slate-300"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={() => onOpenAuth?.("signin")}
              className="px-4 lg:px-5 py-2.5 rounded-xl text-sm lg:text-base font-semibold text-slate-200 border border-[#3B3B47] hover:text-white hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth?.("signup")}
              className="px-6 lg:px-8 py-3 rounded-2xl text-sm lg:text-base font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_20px_rgba(0,163,255,0.35)]
               transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(255,46,217,0.45)] cursor-pointer whitespace-nowrap"
            >
              Start Creating Free
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-brand-purple focus:outline-none cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070913]/98 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-2 shadow-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold cursor-pointer transition-colors ${activeSection === item.id
                  ? "text-[#00A3FF] bg-white/5"
                  : "text-slate-200 hover:bg-white/5"
                }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 space-y-2.5 px-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.("signin");
              }}
              className="w-full text-center px-6 py-3 rounded-full text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth?.("signup");
              }}
              className="w-full text-center px-6 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] to-[#FF2ED9] shadow-[0_0_20px_rgba(0,163,255,0.35)] cursor-pointer"
            >
              Start Creating Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
