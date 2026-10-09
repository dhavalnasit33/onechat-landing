"use client";
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { getRedirectResult, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import apiService from "../lib/apiService";
import { getRegistrationAttribution, clearRegistrationAttribution } from "../lib/attribution";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  selectedInterests?: string[];
  onBackToInterests?: () => void;
}

interface UserResponse {
  success: boolean;
  token: string;
  fb_session_token?: string;
  user: {
    id?: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    age?: number;
    gender?: string;
    region?: string;
    plan?: string;
    remaining_tokens?: number;
    roles?: string[];
    status?: string;
    profile_picture?: string;
    authProvider?: string;
    hasSeenWelcomePopup?: boolean;
    video_credits?: number;
    image_credits?: number;
    createdAt?: string;
  };
}

const INTEREST_ICON_MAP: Record<string, string> = {
  "AI Chat": "/assets/landing-page/intrest_select/ai_chat_icon.png",
  "Image Generation": "/assets/landing-page/intrest_select/image_genration_icon.png",
  "AI Images": "/assets/landing-page/intrest_select/image_genration_icon.png",
  "Video Generation": "/assets/landing-page/intrest_select/video_genration_icon.png",
  "AI Video": "/assets/landing-page/intrest_select/video_genration_icon.png",
  "Compare AI Models": "/assets/landing-page/intrest_select/compare_ai_model_icon.png",
  "Writing & Content": "/assets/landing-page/intrest_select/writing_content_icon.png",
  "Social Media AI Videos": "/assets/landing-page/intrest_select/social_media_ai_video_icon.png",
  "Talking Pets AI Videos": "/assets/landing-page/intrest_select/talking_pet_ai_video_icon.png",
  "Web Search": "/assets/landing-page/intrest_select/web_search_icon.png",
  "Deep Research": "/assets/landing-page/intrest_select/deep_research_icon.png",
  "Chat with PDFs": "/assets/landing-page/intrest_select/chat_with_pdf_icon.png",
  "Notebook LM": "/assets/landing-page/intrest_select/notbook_lm_icon.png",
  "Social Media": "/assets/landing-page/intrest_select/social_media_icon.png",
  "Graphic Design": "/assets/landing-page/intrest_select/graphic_design_icon.png",
  "Cloud Storage": "/assets/landing-page/intrest_select/cloud_storage_icon.png",
  "Cover Letter Generator": "/assets/landing-page/intrest_select/cover_leter_ganreter_icon.png",
  "Email Writer": "/assets/landing-page/intrest_select/email_write_icon.png",
  "Grammar Checker": "/assets/landing-page/intrest_select/grammer_cheker_icon.png",
  "History AI Videos": "/assets/landing-page/intrest_select/history_ai_video_icon.png",
  "Viral AI Videos": "/assets/landing-page/intrest_select/viral_ai_video_icon.png",
};

const getInterestBadgeIcon = (name: string): string => {
  if (INTEREST_ICON_MAP[name]) return INTEREST_ICON_MAP[name];
  const lower = name.toLowerCase();
  for (const [key, iconPath] of Object.entries(INTEREST_ICON_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return iconPath;
    }
  }
  return "/assets/landing-page/intrest_select/ai_chat_icon.png";
};

const getDisplayShortLabel = (name: string): string => {
  if (name === "Image Generation") return "AI Images";
  if (name === "Video Generation") return "AI Video";
  if (name.length > 13) return name.slice(0, 11) + "..";
  return name;
};

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signup",
  selectedInterests = [],
  onBackToInterests,
}: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(initialMode === "signin");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Take the first 3 selected interests as required (fallback to default 3 if empty)
  const displayInterests =
    selectedInterests && selectedInterests.length >= 3
      ? selectedInterests.slice(0, 3)
      : selectedInterests && selectedInterests.length > 0
      ? [
          ...selectedInterests,
          ...["AI Chat", "AI Images", "AI Video"].filter((x) => !selectedInterests.includes(x)),
        ].slice(0, 3)
      : ["AI Chat", "AI Images", "AI Video"];

  useEffect(() => {
    if (isOpen) {
      setIsLoginTab(initialMode === "signin");
      setShowEmailForm(initialMode === "signin");
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Check for Google Redirect Result on load
  useEffect(() => {
    if (!isOpen) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setLoading(true);
          try {
            const idToken = await result.user.getIdToken();
            await handleBackendGoogleLogin(idToken);
          } catch (err: any) {
            setErrorMsg(err.message || "Google Authentication failed.");
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error("Google Redirect Result Error:", err);
        setErrorMsg("Failed to recover login session from Google.");
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAuthSession = (data: UserResponse, isNewSignup: boolean = false) => {
    const { token, fb_session_token, user } = data;

    // Save tokens and login states for SharedPreferences compatibility in Flutter Web
    localStorage.setItem("flutter.user_token", JSON.stringify(token));
    localStorage.setItem("flutter.is_logged_in", JSON.stringify(true));
    localStorage.setItem("flutter.user_interests", JSON.stringify(selectedInterests));
    if (isNewSignup || !isLoginTab) {
      localStorage.setItem("flutter.is_new_registration", JSON.stringify(true));
      localStorage.setItem("flutter.has_seen_welcome_popup", JSON.stringify(false));
    }

    if (user) {
      const userId = user._id || user.id || "";
      localStorage.setItem("flutter.user_id", JSON.stringify(userId));
      localStorage.setItem("flutter.user_name", JSON.stringify(user.name || ""));
      localStorage.setItem("flutter.user_first_name", JSON.stringify(user.firstName || ""));
      localStorage.setItem("flutter.user_last_name", JSON.stringify(user.lastName || ""));
      localStorage.setItem("flutter.user_email", JSON.stringify(user.email || ""));
      localStorage.setItem("flutter.user_age", JSON.stringify(String(user.age ?? "")));
      localStorage.setItem("flutter.user_gender", JSON.stringify(user.gender || ""));
      localStorage.setItem("flutter.user_country", JSON.stringify(user.region || ""));
      localStorage.setItem("flutter.user_plan", JSON.stringify(user.plan || "basic"));
      localStorage.setItem("flutter.user_remaining_tokens", JSON.stringify(user.remaining_tokens ?? 0));
      localStorage.setItem("flutter.user_video_credits", JSON.stringify(user.video_credits ?? 0));
      localStorage.setItem("flutter.user_image_credits", JSON.stringify(user.image_credits ?? 0));
      localStorage.setItem(
        "flutter.user_roles",
        "VGhpcyBpcyB0aGUgcHJlZml4IGZvciBhIGxpc3Qu" + JSON.stringify(user.roles || ["User"])
      );
      localStorage.setItem("flutter.user_status", JSON.stringify(user.status || ""));
      localStorage.setItem("flutter.user_profile_picture", JSON.stringify(user.profile_picture || ""));
      localStorage.setItem("flutter.user_auth_provider", JSON.stringify(user.authProvider || ""));
      if (!isNewSignup && isLoginTab) {
        localStorage.setItem("flutter.has_seen_welcome_popup", JSON.stringify(user.hasSeenWelcomePopup ?? true));
      }
      localStorage.setItem("flutter.user_created_at", JSON.stringify(user.createdAt || ""));
    }

    if (fb_session_token) {
      localStorage.setItem("flutter.fb_session_token", JSON.stringify(fb_session_token));

      const currentDomain = window.location.hostname;
      const isSecure = window.location.protocol === "https:";
      const secureFlag = isSecure ? "; secure" : "";
      const cookieStr = `FBSESSION=${fb_session_token}; path=/; max-age=2592000; samesite=lax${secureFlag}`;

      // Set on current domain
      document.cookie = cookieStr;

      if (!currentDomain.includes("localhost") && !currentDomain.includes("127.0.0.1")) {
        const hostParts = currentDomain.split(".");
        const rootDomain = hostParts.length > 2 ? hostParts.slice(-2).join(".") : currentDomain;
        document.cookie = `${cookieStr}; domain=.${rootDomain}`;
      }
    }

    // Redirect to Flutter App dashboard
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
    return null;
  };

  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      let region = undefined;
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          region = ipData?.country_name;
        }
      } catch (e) {
        console.warn("Could not determine user region:", e);
      }

      const rdtCid = getCookie("_rdt_cid") || getCookie("rdt_cid");
      const attribution = getRegistrationAttribution();
      const response = await apiService<UserResponse>("/auth/google", {
        method: "POST",
        body: {
          idToken,
          interests: selectedInterests,
          ...(region ? { region } : {}),
          ...(rdtCid ? { rdt_cid: rdtCid } : {}),
          ...(attribution ? { registration_attribution: attribution } : {}),
        },
      });

      if (response && response.token) {
        clearRegistrationAttribution();
        saveAuthSession(response);
      } else {
        throw new Error("Invalid backend token response.");
      }
    } catch (err: any) {
      throw new Error(err.message || "Google sign-in API call failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        // Extract Google OAuth ID Token using credentialFromResult
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const googleIdToken = credential?.idToken || (await result.user.getIdToken());
        await handleBackendGoogleLogin(googleIdToken);
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setErrorMsg(err.message || "Google Authentication failed.");
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLoginTab) {
        // Login Flow
        const response = await apiService<UserResponse>("/auth/login", {
          method: "POST",
          body: {
            email: email.trim(),
            password: password.trim(),
            isGoogleLogin: false,
          },
        });

        if (response && response.token) {
          saveAuthSession(response);
        } else {
          throw new Error("Invalid credentials.");
        }
      } else {
        // Register Flow
        const namePart = email.split("@")[0];
        const rdtCid = getCookie("_rdt_cid") || getCookie("rdt_cid");
        const attribution = getRegistrationAttribution();
        const response = await apiService<
          UserResponse & {
            success: boolean;
            message: string;
          }
        >("/auth/register", {
          method: "POST",
          body: {
            firstName: namePart,
            lastName: namePart,
            email: email.trim(),
            password: password.trim(),
            roles: ["User"],
            interests: selectedInterests,
            ...(rdtCid ? { rdt_cid: rdtCid } : {}),
            ...(attribution ? { registration_attribution: attribution } : {}),
          },
        });

        if (response.success && response.token) {
          clearRegistrationAttribution();
          saveAuthSession(response);
        } else {
          throw new Error(response.message || "Registration failed.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className={`relative w-full max-w-[440px] my-auto bg-[#070b1e] rounded-[24px] border border-[#1e3264]/70 shadow-[0_0_60px_rgba(20,40,95,0.45)] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-white select-none transition-all ${
          showEmailForm ? "p-4 sm:p-5" : "p-5 sm:p-7"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Header: Sparkle Logo + Brand Name */}
        <div className={`flex items-center gap-2.5 ${showEmailForm ? "mb-2" : "mb-3.5"}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#d946ef] flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
            </svg>
          </div>
          <span className="font-bold text-[16px] text-white tracking-tight">
            OneChat AI
          </span>
        </div>

        {/* Progress Bar & Step Indicator */}
        {!isLoginTab && (
          <div className={`w-full ${showEmailForm ? "mb-2" : "mb-3.5"}`}>
            <div className="text-[11.5px] sm:text-xs mb-1.5">
              <span className="font-semibold text-white">Step 2 of 3</span>
              <span className="text-slate-400 ml-2">Create your account</span>
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-[7px] bg-[#141d36] rounded-full overflow-hidden">
                <div className="w-[66%] h-full bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#38bdf8] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
              </div>
              <span className="font-bold text-[#818cf8] text-xs shrink-0">66%</span>
            </div>
          </div>
        )}

        {/* Status / Checkmark Graphic with Sparkles */}
        {!isLoginTab && (
          <div className={`relative flex flex-col items-center ${showEmailForm ? "mt-0.5 mb-1" : "mt-1 mb-1.5"}`}>
            {/* Sparkle decorative icons */}
            <div className="relative flex items-center justify-center">
              {/* Top-left small sparkle */}
              <span className="absolute -top-1.5 -left-4 text-[#c084fc] text-xs font-bold animate-pulse">
                ✦
              </span>
              {/* Top-right sparkle */}
              <span className="absolute -top-2 -right-4 text-[#38bdf8] text-xs font-bold animate-pulse">
                ✦
              </span>
              {!showEmailForm && (
                <>
                  <span className="absolute top-5 -left-6 text-[#a855f7] text-[10px]">
                    ✦
                  </span>
                  <span className="absolute top-6 -right-6 text-[#38bdf8] text-[9px]">
                    ✦
                  </span>
                </>
              )}

              {/* Glowing Purple Checkmark Badge */}
              <div
                className={`rounded-full bg-gradient-to-tr from-[#9333ea] via-[#a855f7] to-[#c084fc] flex items-center justify-center border-2 border-[#d8b4fe]/40 ${
                  showEmailForm
                    ? "w-10 h-10 shadow-[0_0_18px_rgba(168,85,247,0.6)]"
                    : "w-13 h-13 shadow-[0_0_28px_rgba(168,85,247,0.7)]"
                }`}
              >
                <svg
                  className={`${showEmailForm ? "w-5 h-5" : "w-7 h-7"} text-white`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <h2
              className={`font-extrabold text-white tracking-tight text-center leading-tight ${
                showEmailForm
                  ? "text-[20px] sm:text-[22px] mt-1.5"
                  : "text-[23px] sm:text-[25px] mt-3"
              }`}
            >
              Your Interests Are{" "}
              <span className="bg-gradient-to-r from-[#00d2ff] via-[#818cf8] to-[#ff2ebd] bg-clip-text text-transparent">
                Selected!
              </span>
            </h2>

            {/* Subtitle */}
            <p
              className={`text-slate-300 text-center leading-snug ${
                showEmailForm
                  ? "text-[11.5px] max-w-[320px] mt-1"
                  : "text-[12.5px] sm:text-[13px] max-w-[340px] mt-1.5"
              }`}
            >
              You're one step closer to exploring the AI tools you're excited about.
            </p>

            {/* 3 Selected Interests Badges */}
            <div className={`grid grid-cols-3 gap-2 w-full ${showEmailForm ? "mt-2" : "mt-4"}`}>
              {displayInterests.map((interestName, i) => {
                const iconSrc = getInterestBadgeIcon(interestName);
                return (
                  <div
                    key={i}
                    className={`bg-[#0e1630] border border-[#223363] rounded-xl flex items-center justify-center gap-1.5 shadow-inner ${
                      showEmailForm ? "px-2 py-1.5" : "px-2.5 py-2"
                    }`}
                  >
                    <div className={`${showEmailForm ? "w-4 h-4" : "w-5 h-5"} rounded-md flex items-center justify-center shrink-0`}>
                      <img
                        src={iconSrc}
                        alt={interestName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-white font-medium text-[11.5px] sm:text-[12px] truncate">
                      {interestName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Tab Header (when in Login mode) */}
        {isLoginTab && (
          <div className="text-center my-2">
            <h2 className="font-extrabold text-[24px] text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-300 text-xs mt-1">
              Log in to continue to your OneChat AI account.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium p-3 rounded-xl my-2 text-center">
            {errorMsg}
          </div>
        )}

        {/* Continue With Divider */}
        <div className={`relative flex items-center w-full ${showEmailForm ? "mt-2.5 mb-2" : "mt-4 mb-3"}`}>
          <div className="flex-grow border-t border-[#1d2b52]"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium tracking-wide">
            Continue with
          </span>
          <div className="flex-grow border-t border-[#1d2b52]"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`relative w-full rounded-xl flex items-center justify-center bg-gradient-to-r from-[#ec4899] via-[#8b5cf6] to-[#06b6d4] hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_24px_rgba(147,51,234,0.35)] cursor-pointer disabled:opacity-50 ${
            showEmailForm ? "h-[44px]" : "h-[50px]"
          }`}
        >
          {/* Logo + Text centered */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="font-bold text-white text-[14.5px]">Continue with Google</span>
          </div>

          {/* Right Arrow pinned to right */}
          <svg
            className="absolute right-4 sm:right-5 w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>

        {/* "or" Divider */}
        <div className={`relative flex items-center w-full ${showEmailForm ? "my-1.5" : "my-2.5"}`}>
          <div className="flex-grow border-t border-[#1d2b52]"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[11px] font-medium">
            or
          </span>
          <div className="flex-grow border-t border-[#1d2b52]"></div>
        </div>

        {/* "Continue with Email" Button with Gradient Border */}
        <div className="w-full p-[1px] rounded-xl bg-gradient-to-r from-[#ec4899] via-[#8b5cf6] to-[#06b6d4] hover:opacity-95 transition-opacity">
          <button
            type="button"
            onClick={() => setShowEmailForm(!showEmailForm)}
            className={`relative w-full rounded-[11px] flex items-center justify-center px-4 sm:px-5 bg-[#090f24] hover:bg-[#0c1430] transition-all active:scale-[0.99] cursor-pointer ${
              showEmailForm ? "h-[42px]" : "h-[48px]"
            }`}
          >
            {/* Mail Icon + Text centered */}
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4.5 h-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-white text-[14px]">Continue with Email</span>
            </div>

            {/* Right Icon (Arrow or Chevron) pinned to right */}
            <div className="absolute right-4 sm:right-5 flex items-center">
              {showEmailForm ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Expandable Email & Password Card (Mock 2) */}
        {showEmailForm && (
          <div className="bg-[#0b122c] border border-[#1e3264] rounded-xl p-3 sm:p-3.5 mt-2 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-200 shadow-inner">
            {/* Header of email section */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-[13.5px]">
                {isLoginTab ? "Log in with email" : "Create your account with email"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Email address
                </label>
                <div className="bg-[#060b1c] border border-[#1b2b52] focus-within:border-[#38bdf8] rounded-lg px-3 py-2 flex items-center gap-2 transition-colors">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    className="email-autofill-fix bg-transparent text-white placeholder-slate-500 text-[12.5px] w-full outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Password
                </label>
                <div className="bg-[#060b1c] border border-[#1b2b52] focus-within:border-[#38bdf8] rounded-lg px-3 py-2 flex items-center gap-2 transition-colors relative">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLoginTab ? "Enter your password" : "Create a password"}
                    disabled={loading}
                    required
                    className="bg-transparent text-white placeholder-slate-500 text-[12.5px] w-full outline-none pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[42px] rounded-xl font-bold text-white text-[13.5px] bg-gradient-to-r from-[#d946ef] via-[#7c3aed] to-[#38bdf8] hover:opacity-95 active:scale-[0.99] transition-all shadow-[0_0_18px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>{isLoginTab ? "Sign In" : "Create My Account"}</span>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer: Already have account / Log in */}
        <div className={`text-center ${showEmailForm ? "mt-2.5" : "mt-4"}`}>
          <p className="text-slate-400 text-xs">
            {isLoginTab ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (onBackToInterests) {
                      onBackToInterests();
                    } else {
                      setIsLoginTab(false);
                      setShowEmailForm(false);
                      setErrorMsg(null);
                    }
                  }}
                  className="text-[#c084fc] hover:text-[#e879f9] font-semibold underline cursor-pointer ml-1"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setShowEmailForm(true);
                    setErrorMsg(null);
                  }}
                  className="text-[#c084fc] hover:text-[#e879f9] font-semibold underline cursor-pointer ml-1"
                >
                  Log in
                </button>
              </>
            )}
          </p>

          {/* Privacy Policy & Terms */}
          <p className={`text-slate-400 text-center leading-normal px-1 max-w-[370px] mx-auto ${showEmailForm ? "text-[10px] mt-1.5" : "text-[10.5px] sm:text-[11px] mt-2.5"}`}>
            By continuing, you agree to our{" "}
            <a
              href="/terms-of-service"
              className="text-slate-300 hover:text-white underline transition-colors whitespace-nowrap"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="text-slate-300 hover:text-white underline transition-colors whitespace-nowrap"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
