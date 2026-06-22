"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ModelMarquee from "./ModelMarquee";
import WhoItsFor from "./WhoItsFor";
import FeaturesList from "./FeaturesList";
import AdvantageMarquee from "./AdvantageMarquee";
import FAQAccordion from "./FAQAccordion";
import Footer from "./Footer";
import AuthModal from "./AuthModal";

export default function LandingPageClient() {
  const [authOpen, setAuthOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fbSessionToken = localStorage.getItem("flutter.fb_session_token");
      const isLoggedIn = localStorage.getItem("flutter.is_logged_in");
      if (isLoggedIn && fbSessionToken) {
        setIsRedirecting(true);
        try {
          // Parse token and format cookie
          let token = fbSessionToken;
          if (fbSessionToken.startsWith('"') && fbSessionToken.endsWith('"')) {
            token = JSON.parse(fbSessionToken);
          }
          const currentDomain = window.location.hostname;
          const isSecure = window.location.protocol === "https:";
          const secureFlag = isSecure ? "; secure" : "";
          const cookieStr = `FBSESSION=${token}; path=/; max-age=2592000; samesite=lax${secureFlag}`;

          // 1. Set exactly on the current host first (Bypasses Safari Private restrictions)
          document.cookie = cookieStr;

          // 2. Try the root domain if it's a live site
          if (
            !currentDomain.includes("localhost") &&
            !currentDomain.includes("127.0.0.1")
          ) {
            const hostParts = currentDomain.split(".");
            const rootDomain =
              hostParts.length > 2 ? hostParts.slice(-2).join(".") : currentDomain;
            document.cookie = `${cookieStr}; domain=.${rootDomain}`;
          }

          // Verify if cookie was successfully written to prevent infinite redirect loops
          if (document.cookie.includes("FBSESSION=")) {
            setTimeout(() => {
              window.location.href = "/";
            }, 300);
          } else {
            console.warn("Cookies are blocked/disabled. Skipping redirect fallback.");
            setIsRedirecting(false);
          }
        } catch (e) {
          console.error("Redirect fallback error:", e);
          setIsRedirecting(false);
        }
      }
    }
  }, []);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-[#057aff] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-sans text-sm font-semibold tracking-wide text-slate-300">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <main className="flex-1 w-full flex flex-col">
        <Hero onOpenAuth={() => setAuthOpen(true)} />
        <ModelMarquee />
        <WhoItsFor />
        <FeaturesList onOpenAuth={() => setAuthOpen(true)} />
        <AdvantageMarquee onOpenAuth={() => setAuthOpen(true)} />
        <FAQAccordion onOpenAuth={() => setAuthOpen(true)} />
      </main>
      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
