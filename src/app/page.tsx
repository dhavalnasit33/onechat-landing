import React from "react";
import { Metadata } from "next";
import LandingPageClient from "../components/LandingPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = "OneChat AI | The Ultimate AI + Business Super App";
  const defaultDesc =
    "Access every major AI model, hundreds of specialized tools for writing, marketing, design, research, video, and more under one single subscription. Start your 7-day free trial today.";

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.onechatai.ai/api";
    const res = await fetch(`${apiBase}/yoast-seo/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const seo = data.data[0];
        return {
          title: seo.seo_title || defaultTitle,
          description: seo.meta_description || defaultDesc,
          keywords: seo.seo_keyphrase || "",
          alternates: {
            canonical: "https://onechatai.ai/",
          },
          openGraph: {
            title: seo.seo_title || defaultTitle,
            description: seo.meta_description || defaultDesc,
            images: seo.cover_image ? [{ url: seo.cover_image }] : undefined,
          },
          icons: {
            icon: "/favicon.png",
            shortcut: "/favicon.ico",
            apple: "/icons/Icon-192.png",
          },
          other: {
            "google-signin-client_id": "361874907943-e4k2cponbo6g12rpu4ssi9f4iq6uguk2.apps.googleusercontent.com",
            "mobile-web-app-capable": "yes",
            "apple-mobile-web-app-status-bar-style": "black",
            "apple-mobile-web-app-title": "OneChat AI",
            "robots": "index,follow",
          },
        };
      }
    }
  } catch (e) {
    console.error("Failed to fetch yoast-seo data:", e);
  }

  return {
    title: defaultTitle,
    description: defaultDesc,
    alternates: {
      canonical: "https://onechatai.ai/",
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.ico",
      apple: "/icons/Icon-192.png",
    },
    other: {
      "google-signin-client_id": "361874907943-e4k2cponbo6g12rpu4ssi9f4iq6uguk2.apps.googleusercontent.com",
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black",
      "apple-mobile-web-app-title": "OneChat AI",
      "robots": "index,follow",
    },
  };
}

export default function Home() {
  return <LandingPageClient />;
}
