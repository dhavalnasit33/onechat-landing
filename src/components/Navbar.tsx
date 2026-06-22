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

      const sections = ["who-its-for", "features", "why-us", "faq"];
      let current = "home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Who it's for", id: "who-its-for" },
    { label: "Features", id: "features" },
    { label: "Why OneChat AI", id: "why-us" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/assets/images/onechat.png"
              alt="OneChat AI Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="ml-2.5 font-poppins text-lg md:text-xl font-extrabold text-[#0E1120] tracking-tight">
              OneChat AI
            </span>
          </div>

          {/* Desktop Nav items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-[14px] font-semibold transition-colors hover:text-brand-purple cursor-pointer ${
                  activeSection === item.id ? "text-brand-purple" : "text-[#64748B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] transition-all hover:scale-105 cursor-pointer"
            >
              Start Your 7-Day Free Trial
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#0E1120] hover:text-brand-purple focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-brand-border px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-semibold cursor-pointer ${
                activeSection === item.id ? "text-brand-purple bg-brand-bg-light" : "text-brand-slate hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 px-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full text-center px-4 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-purple-light shadow-[0_4px_15px_rgba(108,86,229,0.32)] cursor-pointer"
            >
              Start Your 7-Day Free Trial
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
