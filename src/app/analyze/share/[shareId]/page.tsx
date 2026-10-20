"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Download,
  Share2,
  FileSpreadsheet,
  FileText,
  Presentation,
  Image as ImageIcon,
  Check,
  Eye,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const C1Component = dynamic(
  () => import("@thesysai/genui-sdk").then((mod) => mod.C1Component),
  { ssr: false }
);

interface SharedItemData {
  shareId: string;
  title: string;
  description?: string;
  itemType: string;
  c1Content: string;
  chartData?: any;
  imageUrl?: string;
  viewsCount?: number;
  createdAt: string;
}

function getApiServerBase(): string {
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) return envBase.replace(/\/api\/?$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://api.onechatai.ai";
  }
  return "https://api.onechatai.ai";
}

export default function SharedReportPage() {
  const params = useParams();
  const shareId = params?.shareId as string;

  const [item, setItem] = useState<SharedItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState<"png" | "pdf" | "ppt" | null>(null);
  const [copied, setCopied] = useState(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareId) return;

    let isMounted = true;
    async function fetchSharedItem() {
      try {
        setLoading(true);
        setError(null);
        const apiBase = getApiServerBase();
        const res = await fetch(`${apiBase}/api/analyze-files/shared-item/${shareId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load shared content");
        }

        if (isMounted) {
          setItem(data.item);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "This shared report could not be found or has expired.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchSharedItem();
    return () => {
      isMounted = false;
    };
  }, [shareId]);

  // Copy link to clipboard with fallback for HTTP/permission denied errors
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        // Fallback: create a temporary textarea and use execCommand
        try {
          const ta = document.createElement("textarea");
          ta.value = url;
          ta.style.position = "fixed";
          ta.style.top = "-9999px";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (_) {
          alert("Could not copy link. Please copy it manually from the address bar.");
        }
      });
    } else {
      // No clipboard API — use execCommand directly
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (_) {
        alert("Could not copy link. Please copy it manually from the address bar.");
      }
    }
  };

  // Imperatively force overflow:visible on ALL SVG / recharts elements after render.
  // This is the only reliable way to prevent Recharts Y-axis labels being clipped —
  // CSS stylesheets can be overridden by the Thesys SDK, but inline styles win.
  useEffect(() => {
    if (!item || !reportContainerRef.current) return;
    const el = reportContainerRef.current;

    const fixSvgOverflow = () => {
      if (!el) return;
      // Force overflow on SVG elements
      el.querySelectorAll<SVGElement>("svg, .recharts-wrapper, .recharts-surface").forEach((svgEl) => {
        (svgEl as unknown as HTMLElement).style.overflow = "visible";
      });
      // Also fix the recharts-wrapper divs
      el.querySelectorAll<HTMLElement>(".recharts-wrapper").forEach((wrapper) => {
        wrapper.style.overflow = "visible";
      });
    };

    // Run at multiple intervals to catch delayed renders from the dynamic C1Component
    const t1 = setTimeout(fixSvgOverflow, 300);
    const t2 = setTimeout(fixSvgOverflow, 800);
    const t3 = setTimeout(fixSvgOverflow, 2000);
    const t4 = setTimeout(fixSvgOverflow, 4000);

    // Also watch for DOM mutations (chart re-renders, streaming updates)
    const observer = new MutationObserver(fixSvgOverflow);
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      observer.disconnect();
    };
  }, [item]);

  // Captures the FULL element — handles horizontally/vertically overflowing content
  // so no text or chart data is ever cut off in the download.
  const captureFullElement = async (
    element: HTMLElement,
    bgColor = "#070914"
  ): Promise<string> => {
    const { toPng } = await import("html-to-image");

    // --- Compute true full width from SVGs + scrollWidth ---
    let trueFullWidth = Math.max(element.scrollWidth, element.offsetWidth);
    const svgs = Array.from(element.querySelectorAll("svg.recharts-surface, svg")) as SVGSVGElement[];
    svgs.forEach((svg) => {
      const vb = svg.viewBox?.baseVal;
      if (vb && vb.width > trueFullWidth) trueFullWidth = vb.width;
      const wAttr = parseFloat(svg.getAttribute("width") || "0");
      if (wAttr > trueFullWidth) trueFullWidth = wAttr;
      try { const bb = svg.getBBox(); if (bb.width > trueFullWidth) trueFullWidth = bb.width; } catch (_) {}
    });
    const captureWidth = trueFullWidth + 60; // extra left+right buffer for Y-axis labels

    // --- Compute true full height from all descendants ---
    let trueFullHeight = Math.max(element.scrollHeight, element.offsetHeight);
    const elemRect = element.getBoundingClientRect();
    Array.from(element.querySelectorAll("*")).forEach((child) => {
      try {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const childBottom = rect.bottom - elemRect.top;
        if (childBottom > trueFullHeight) trueFullHeight = childBottom;
      } catch (_) {}
    });
    const captureHeight = trueFullHeight + 40; // bottom buffer so last line is never clipped

    // --- Remove overflow clipping from all ancestors ---
    const restores: Array<() => void> = [];
    let node: HTMLElement | null = element.parentElement;
    while (node && node !== document.body) {
      const cs = window.getComputedStyle(node);
      if (cs.overflow !== "visible" || cs.overflowX !== "visible" || cs.overflowY !== "visible") {
        const pOv = node.style.overflow, pOvX = node.style.overflowX, pOvY = node.style.overflowY;
        node.style.overflow = "visible"; node.style.overflowX = "visible"; node.style.overflowY = "visible";
        const captured = node;
        restores.push(() => { captured.style.overflow = pOv; captured.style.overflowX = pOvX; captured.style.overflowY = pOvY; });
      }
      node = node.parentElement;
    }

    // --- Force element to full size ---
    const prev = { w: element.style.width, mw: element.style.minWidth, h: element.style.height, mh: element.style.minHeight, ov: element.style.overflow, ovx: element.style.overflowX, ovy: element.style.overflowY };
    element.style.width = `${captureWidth}px`; element.style.minWidth = `${captureWidth}px`;
    element.style.height = `${captureHeight}px`; element.style.minHeight = `${captureHeight}px`;
    element.style.overflow = "visible"; element.style.overflowX = "visible"; element.style.overflowY = "visible";

    // Brighten SVG text for the screenshot
    const textNodes = element.querySelectorAll("text, tspan, .recharts-cartesian-axis-tick text, .recharts-text");
    const svgRestores: { el: SVGTextElement; fill: string; styleFill: string; opacity: string }[] = [];
    textNodes.forEach((t) => {
      const el = t as SVGTextElement;
      svgRestores.push({ el, fill: el.getAttribute("fill") || "", styleFill: el.style.fill || "", opacity: el.style.opacity || "" });
      el.setAttribute("fill", "#F8FAFC"); el.style.fill = "#F8FAFC"; el.style.opacity = "1";
    });

    await new Promise((r) => setTimeout(r, 80));

    let dataUrl: string;
    try {
      dataUrl = await toPng(element, {
        backgroundColor: bgColor,
        pixelRatio: 2.5,
        cacheBust: true,
        width: captureWidth,
        height: captureHeight,
        style: { padding: "24px", borderRadius: "16px", overflow: "visible", overflowY: "visible", boxSizing: "border-box" },
      });
    } finally {
      svgRestores.forEach(({ el, fill, styleFill, opacity }) => {
        if (fill) el.setAttribute("fill", fill); else el.removeAttribute("fill");
        el.style.fill = styleFill; el.style.opacity = opacity;
      });
      element.style.width = prev.w; element.style.minWidth = prev.mw;
      element.style.height = prev.h; element.style.minHeight = prev.mh;
      element.style.overflow = prev.ov; element.style.overflowX = prev.ovx; element.style.overflowY = prev.ovy;
      restores.forEach((fn) => fn());
    }
    return dataUrl!;
  };

  const handleDownloadPNG = async () => {
    if (!reportContainerRef.current) return;
    try {
      setDownloadingType("png");
      const dataUrl = await captureFullElement(reportContainerRef.current, "#070914");
      const link = document.createElement("a");
      link.download = `${(item?.title || "analysis-report").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setDownloadingType(null);
      setDownloadDropdownOpen(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    try {
      setDownloadingType("pdf");
      const { jsPDF } = await import("jspdf");
      const dataUrl = await captureFullElement(reportContainerRef.current, "#070914");

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      pdf.save(`${(item?.title || "analysis-report").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setDownloadingType(null);
      setDownloadDropdownOpen(false);
    }
  };

  const handleDownloadPPT = async () => {
    try {
      setDownloadingType("ppt");
      const apiBase = getApiServerBase();

      let capturedImage: string | null = null;
      if (reportContainerRef.current) {
        try {
          const { toPng } = await import("html-to-image");
          capturedImage = await toPng(reportContainerRef.current, {
            backgroundColor: "#070914",
            pixelRatio: 1.5,
          });
        } catch (_) {}
      }

      let token = "";
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("flutter.user_token") || localStorage.getItem("token") || localStorage.getItem("user_token");
          if (raw) {
            token = raw.replace(/^"+|"+$/g, "").trim();
          }
        } catch (_) {}
      }

      const res = await fetch(`${apiBase}/api/analyze-files/export-ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: item?.title || "AI Analysis Report",
          description: "", // Keep clean so the presentation slide highlights the card image cleanly centered
          chartData: item?.chartData || null,
          imageUrl: capturedImage || item?.imageUrl || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate PPT presentation");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(item?.title || "analysis-report").replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PPT:", err);
      alert("Failed to export PPT. Please try again.");
    } finally {
      setDownloadingType(null);
      setDownloadDropdownOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 flex flex-col font-sans selection:bg-[#6C56E5] selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 border-b border-[#1E223D] bg-[#0C1020]/90 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6C56E5] to-[#EC4899] text-white shadow-lg shadow-[#6C56E5]/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">OneChat AI</span>
                <span className="rounded-md bg-[#6C56E5]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#A78BFA] border border-[#6C56E5]/30">
                  Shared Report
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px] sm:max-w-md">
                {item?.title || "AI Generated Insights"}
              </p>
            </div>
          </div>

          {/* Action Buttons: Share & Download */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleCopyLink}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-[#292D49] bg-[#121424] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                disabled={!item || downloadingType !== null}
                className="flex items-center gap-1.5 rounded-lg bg-[#6C56E5] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#6C56E5]/20 transition hover:bg-[#7965F0] disabled:opacity-50 active:scale-95"
              >
                {downloadingType ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>

              {downloadDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#292D49] bg-[#0E1222] p-1.5 shadow-2xl z-50">
                  <button onClick={handleDownloadPNG}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 text-[#A78BFA]" />
                    <span>Download PNG</span>
                  </button>

                  <button onClick={handleDownloadPDF}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-[#F43F5E]" />
                    <span>Download PDF</span>
                  </button>

                  <button onClick={handleDownloadPPT}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                  >
                    <Presentation className="h-4 w-4 text-[#F97316]" />
                    <span>Download PPT</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#6C56E5]" />
            <p className="text-sm text-slate-400">Loading shared report & charts...</p>
          </div>
        ) : error || !item ? (
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
            <h2 className="text-lg font-bold text-red-200">Report Unavailable</h2>
            <p className="mt-2 text-xs text-red-300/80 leading-relaxed">
              {error || "The link you accessed may have expired or is invalid."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E223D] pb-4">
              <div className="space-y-1 max-w-3xl">
                <span className="text-[11px] font-semibold tracking-wider text-[#A78BFA] uppercase">
                  Shared Insight
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {item.viewsCount !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    {item.viewsCount} {item.viewsCount === 1 ? "view" : "views"}
                  </span>
                )}
              </div>
            </div>

            {/* Thesys C1 Interactive Container */}
            {/* Outer wrapper: scrolls horizontally if chart is wider than viewport */}
            <div
              style={{ overflowX: "auto", overflowY: "visible", borderRadius: "16px", border: "1px solid #1E223D", background: "#070914", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)" }}
            >
              {/*
                Inner div has minWidth:900px so Recharts renders ALL months (Jan-Dec).
                paddingLeft:60px gives the Y-axis labels (e.g. "2.2K") room on the left
                so they are never clipped.
              */}
              <div
                ref={reportContainerRef}
                suppressHydrationWarning
                className="dark space-y-4"
                style={{
                  colorScheme: "dark",
                  backgroundColor: "#070914",
                  color: "#F8FAFC",
                  minWidth: "900px",
                  paddingTop: "24px",
                  paddingBottom: "32px",
                  paddingLeft: "64px",
                  paddingRight: "24px",
                  /* SVG overflow fix: Recharts Y-axis text renders at negative x — must be visible */
                  position: "relative",
                }}
              >
                {/* Global style: force Recharts SVG elements to overflow:visible so axis labels are never clipped */}
                <style>{`
                  .recharts-wrapper, .recharts-wrapper svg, .recharts-surface {
                    overflow: visible !important;
                  }
                  .recharts-cartesian-axis-tick text,
                  .recharts-text,
                  text {
                    overflow: visible !important;
                  }
                `}</style>
                {item.imageUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="rounded-xl max-w-full shadow-2xl border border-[#292D49]"
                    />
                  </div>
                ) : (
                  <C1Component c1Response={item.c1Content} isStreaming={false} />
                )}
              </div>
            </div>

            {/* Footer Attribution Banner */}
            <div className="rounded-xl border border-[#1E223D] bg-[#0E1222] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold text-white">
                  Want to create your own instant reports & visual dashboards?
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload spreadsheets, documents, or data to OneChat AI.
                </p>
              </div>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6C56E5] to-[#7965F0] px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 transition shrink-0"
              >
                <span>Try OneChat AI Free</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
