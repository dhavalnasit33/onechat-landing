"use client";
import React, { useState, useEffect } from "react";

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["features", "demos", "who-its-for", "why-us", "faq"];
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
    if (id === "our-affiliates") {
      window.location.href = "/affiliate";
      return;
    }
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Demos", id: "demos" },
    { label: "Who it's for", id: "who-its-for" },
    { label: "Why OneChat AI", id: "why-us" },
    { label: "FAQ", id: "faq" },
    { label: "Our Affiliates", id: "our-affiliates" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/assets/images/onechat.png"
              alt="OneChat AI Logo"
              width={32}
              height={32}
              decoding="async"
              className="h-8 w-8 object-contain"
            />
            <span
              className={`ml-2.5 font-poppins text-lg md:text-xl font-extrabold tracking-tight transition-colors ${
                scrolled ? "text-[#0E1120]" : "text-white"
              }`}
            >
              OneChat AI
            </span>
          </div>

          {/* Desktop Nav items */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-[13px] lg:text-[14px] font-semibold transition-colors hover:text-brand-purple cursor-pointer whitespace-nowrap ${
                  activeSection === item.id
                    ? "text-brand-purple"
                    : scrolled
                      ? "text-[#64748B]"
                      : "text-white/80"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => {
                window.location.href = "/generate-ai-videos";
              }}
              className="px-6 lg:px-8 py-3.5 rounded-full text-sm lg:text-base font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md hover:text-brand-purple focus:outline-none cursor-pointer transition-colors ${
                scrolled ? "text-[#0E1120]" : "text-white"
              }`}
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
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-brand-border px-4 pt-2 pb-6 space-y-2 shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-md text-base font-semibold cursor-pointer transition-colors ${
                activeSection === item.id
                  ? "text-brand-purple bg-brand-purple/10"
                  : "text-[#0E1120] hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 px-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.href = "/generate-ai-videos";
              }}
              className="w-full text-center px-6 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
