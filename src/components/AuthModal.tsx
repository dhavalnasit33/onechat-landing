"use client";
import React, { useState, useEffect } from "react";
import apiService from "../lib/apiService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [savedName, setSavedName] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  // Load saved name/email on mount to display in Google button
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getUnwrapped = (key: string) => {
        const val = localStorage.getItem(key);
        if (!val) return null;
        if (val.startsWith('"') && val.endsWith('"')) {
          try {
            return JSON.parse(val);
          } catch (_) {
            return val.slice(1, -1);
          }
        }
        return val;
      };

      const name =
        getUnwrapped("flutter.user_first_name") ||
        getUnwrapped("flutter.user_name");
      const emailVal = getUnwrapped("flutter.user_email");
      if (name) setSavedName(name);
      if (emailVal) setSavedEmail(emailVal);
    }
  }, [isOpen]);

  // Load Google Identity Services script on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gsi-script";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Initialize and render Google Sign-In button
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const initializeGoogleSignIn = () => {
      if (!isMounted) return;
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "361874907943-e4k2cponbo6g12rpu4ssi9f4iq6uguk2.apps.googleusercontent.com",
          callback: async (response: any) => {
            if (!isMounted) return;
            const idToken = response.credential;
            setLoading(true);
            setErrorMsg(null);
            try {
              await handleBackendGoogleLogin(idToken);
            } catch (err: any) {
              if (isMounted) {
                setErrorMsg(err.message || "Google Sign-In failed.");
                setLoading(false);
              }
            }
          },
          ux_mode: "popup",
        });

        const buttonParent = document.getElementById("google-signin-btn-container");
        if (buttonParent && isMounted) {
          google.accounts.id.renderButton(buttonParent, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            width: 350,
          });
        }
      } else {
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    // Small delay to ensure the modal DOM is rendered
    const timer = setTimeout(initializeGoogleSignIn, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAuthSession = (data: UserResponse) => {
    const { token, fb_session_token, user } = data;

    // Save tokens and login states for SharedPreferences compatibility in Flutter Web
    localStorage.setItem("flutter.user_token", JSON.stringify(token));
    localStorage.setItem("flutter.is_logged_in", JSON.stringify(true));

    if (user) {
      const userId = user._id || user.id || "";
      localStorage.setItem("flutter.user_id", JSON.stringify(userId));
      localStorage.setItem(
        "flutter.user_name",
        JSON.stringify(user.name || ""),
      );
      localStorage.setItem(
        "flutter.user_first_name",
        JSON.stringify(user.firstName || ""),
      );
      localStorage.setItem(
        "flutter.user_last_name",
        JSON.stringify(user.lastName || ""),
      );
      localStorage.setItem(
        "flutter.user_email",
        JSON.stringify(user.email || ""),
      );
      localStorage.setItem(
        "flutter.user_age",
        JSON.stringify(String(user.age ?? "")),
      );
      localStorage.setItem(
        "flutter.user_gender",
        JSON.stringify(user.gender || ""),
      );
      localStorage.setItem(
        "flutter.user_country",
        JSON.stringify(user.region || ""),
      );
      localStorage.setItem(
        "flutter.user_plan",
        JSON.stringify(user.plan || "basic"),
      );
      localStorage.setItem(
        "flutter.user_remaining_tokens",
        JSON.stringify(user.remaining_tokens ?? 0),
      );
      localStorage.setItem(
        "flutter.user_video_credits",
        JSON.stringify(user.video_credits ?? 0),
      );
      localStorage.setItem(
        "flutter.user_image_credits",
        JSON.stringify(user.image_credits ?? 0),
      );
      localStorage.setItem(
        "flutter.user_roles",
        "VGhpcyBpcyB0aGUgcHJlZml4IGZvciBhIGxpc3Qu" +
          JSON.stringify(user.roles || ["User"]),
      );
      localStorage.setItem(
        "flutter.user_status",
        JSON.stringify(user.status || ""),
      );
      localStorage.setItem(
        "flutter.user_profile_picture",
        JSON.stringify(user.profile_picture || ""),
      );
      localStorage.setItem(
        "flutter.user_auth_provider",
        JSON.stringify(user.authProvider || ""),
      );
      localStorage.setItem(
        "flutter.has_seen_welcome_popup",
        JSON.stringify(user.hasSeenWelcomePopup ?? false),
      );
      localStorage.setItem(
        "flutter.user_created_at",
        JSON.stringify(user.createdAt || ""),
      );
    }

    if (fb_session_token) {
      localStorage.setItem(
        "flutter.fb_session_token",
        JSON.stringify(fb_session_token),
      );

      const currentDomain = window.location.hostname;

      // 👇 Dynamically check for HTTPS so local IP testing works on Safari
      const isSecure = window.location.protocol === "https:";
      const secureFlag = isSecure ? "; secure" : "";
      const cookieStr = `FBSESSION=${fb_session_token}; path=/; max-age=2592000; samesite=lax${secureFlag}`;

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
    }

    // 👇 Give Safari Private Mode 300ms to save the cookie before routing away
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  };

  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      // Determine client region dynamically
      let region = undefined;
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = (await ipRes.ok) ? await ipRes.json() : null;
          region = ipData?.country_name;
        }
      } catch (e) {
        console.warn("Could not determine user region:", e);
      }

      const response = await apiService<UserResponse>("/auth/google", {
        method: "POST",
        body: { idToken, ...(region ? { region } : {}) },
      });

      if (response && response.token) {
        saveAuthSession(response);
      } else {
        throw new Error("Invalid backend token response.");
      }
    } catch (err: any) {
      throw new Error(err.message || "Google sign-in API call failed.");
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
        // Register Flow (Firstname and lastname defaulted to name split of email)
        const namePart = email.split("@")[0];
        const response = await apiService<{
          success: boolean;
          message: string;
          data?: UserResponse;
        }>("/auth/register", {
          method: "POST",
          body: {
            firstName: namePart,
            lastName: namePart,
            email: email.trim(),
            password: password.trim(),
            roles: ["User"],
          },
        });

        if (response.success && response.data && response.data.token) {
          saveAuthSession(response.data);
        } else {
          throw new Error(response.message || "Registration failed.");
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "Authentication failed. Please check your credentials.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px] animate-in fade-in duration-300">
      {/* Modal Card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-[16px] border-[1.5px] border-[#e0e0e0] shadow-2xl p-6 md:p-8 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/70 hover:bg-slate-200 text-black transition-colors cursor-pointer"
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
              strokeWidth={2.8}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Tab Headers */}
        <div className="flex bg-white p-[2px] rounded-full border border-slate-300 w-full mt-2">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg(null);
            }}
            className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer font-sans ${
              isLoginTab
                ? "bg-black text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg(null);
            }}
            className={`flex-1 text-center py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer font-sans ${
              !isLoginTab
                ? "bg-black text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Headline & Subtitle */}
        <div className="text-center mt-1">
          <h2 className="font-sans text-[26px] font-bold text-black tracking-tight leading-tight">
            {isLoginTab ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="mt-1.5 font-sans text-[14px] text-[#bdbdbd] leading-relaxed">
            {isLoginTab
              ? "Please sign in to your account to continue."
              : "Please create your login details so you can easily access your account in the future."}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Google Authentication Button */}
        <div className="w-full flex items-center justify-center min-h-[44px]">
          <div
            id="google-signin-btn-container"
            className="w-full flex justify-center"
            style={{ display: loading ? "none" : "flex" }}
          ></div>
          {loading && (
            <div className="flex items-center justify-center gap-3 bg-white border border-[#d6d6d6] rounded-[6px] text-black font-semibold text-[15px] w-full h-[44px]">
              <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </div>
          )}
        </div>
        {/* Divider */}
        <div className="relative flex items-center w-full py-1">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">
            Or
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
              className="w-full px-3.5 py-3.5 rounded-[5px] border border-[#d6d6d6] text-base outline-none focus:border-black focus:border-[1.5px] focus:ring-0 transition-all text-black placeholder-slate-400 bg-[#f9f9f9]"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              className="w-full px-3.5 py-3.5 pr-12 rounded-[5px] border border-[#d6d6d6] text-base outline-none focus:border-black focus:border-[1.5px] focus:ring-0 transition-all text-black placeholder-slate-400 bg-[#f9f9f9]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer animate-none"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
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
                  className="w-5 h-5"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] rounded-[6px] text-base font-bold text-white bg-[#057aff] hover:bg-[#006ae6] transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isLoginTab ? (
              "Sign In"
            ) : (
              "Get Started"
            )}
          </button>
        </form>

        {/* Disclaimer Footer */}
        <p className="text-center text-[12px] leading-normal text-slate-500 max-w-[340px] mx-auto mt-2">
          By signing up, you agree to the{" "}
          <a
            href="/terms-of-service"
            className="underline font-semibold text-slate-700 hover:text-black transition-colors font-sans"
          >
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            className="underline font-semibold text-slate-700 hover:text-black transition-colors font-sans"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
