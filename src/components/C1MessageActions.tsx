"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Share2,
  FileText,
  Presentation,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
  Maximize2,
  X,
} from "lucide-react";

interface C1MessageActionsProps {
  messageId: string;
  chatId: string;
  content: string;
  targetRef: React.RefObject<HTMLDivElement | null>;
  apiBaseUrl: string;
  authToken: string;
}

export const C1MessageActions: React.FC<C1MessageActionsProps> = ({
  messageId,
  chatId,
  content,
  targetRef,
  apiBaseUrl,
  authToken,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloading, setDownloading] = useState<"png" | "pdf" | "ppt" | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
  const [lightboxLoading, setLightboxLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Auto clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Extract a clean title from the message markdown
  const extractTitle = (text: string) => {
    const match = text.match(/^(?:#|\*\*|###|##)\s*(.+?)(?:\*\*|\n|$)/m);
    if (match && match[1]) {
      return match[1].replace(/[*#]/g, "").trim().slice(0, 80);
    }
    return "AI Analysis Report";
  };

  // Helper to detect if light mode (including computer/OS theme setting)
  const isLightMode = (element?: HTMLElement | null): boolean => {
    if (typeof window === "undefined") return false;

    // 1. Explicit HTML/Body class override
    if (document.documentElement.classList.contains("dark") && !document.documentElement.classList.contains("light")) {
      return false;
    }
    if (document.documentElement.classList.contains("light") || document.body.classList.contains("light")) {
      return true;
    }

    if (element) {
      let curr: HTMLElement | null = element;
      while (curr && curr !== document.body) {
        if (curr.classList.contains("dark")) return false;
        if (curr.classList.contains("light")) return true;
        curr = curr.parentElement;
      }
      const bg = window.getComputedStyle(element).backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
        const rgb = bg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
          if (brightness < 80) return false;
          if (brightness > 140) return true;
        }
      }
    }

    if (typeof window.matchMedia === "function") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return false;
      }
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        return true;
      }
    }

    return false;
  };

  // Helper to recolor SVG text for legibility during export
  const applySvgStylesForCapture = (element: HTMLElement, light: boolean) => {
    const textNodes = element.querySelectorAll("text, tspan, .recharts-cartesian-axis-tick text, .recharts-text");
    const originalFills: { el: SVGTextElement; fill: string; styleFill: string; opacity: string }[] = [];
    const targetColor = light ? "#1E293B" : "#F8FAFC";
    textNodes.forEach((t) => {
      const el = t as SVGTextElement;
      originalFills.push({
        el,
        fill: el.getAttribute("fill") || "",
        styleFill: el.style.fill || "",
        opacity: el.style.opacity || "",
      });
      el.setAttribute("fill", targetColor);
      el.style.fill = targetColor;
      el.style.opacity = "1";
    });
    return () => {
      originalFills.forEach(({ el, fill, styleFill, opacity }) => {
        if (fill) el.setAttribute("fill", fill);
        else el.removeAttribute("fill");
        el.style.fill = styleFill;
        el.style.opacity = opacity;
      });
    };
  };

  // 1. Share Individual Report / Graph
  const handleShare = async () => {
    if (sharing) return;
    try {
      setSharing(true);
      const title = extractTitle(content);

      // Optionally capture thumbnail
      let capturedThumbnail: string | null = null;
      if (targetRef.current) {
        try {
          const { toPng } = await import("html-to-image");
          const light = isLightMode(targetRef.current);
          const restoreSvg = applySvgStylesForCapture(targetRef.current, light);
          try {
            capturedThumbnail = await toPng(targetRef.current, {
              backgroundColor: light ? "#FFFFFF" : "#070914",
              pixelRatio: 1,
            });
          } finally {
            restoreSvg();
          }
        } catch (_) {}
      }

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/share-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chatId,
          title,
          description: content.slice(0, 300),
          c1Content: content,
          itemType: "chart",
          imageUrl: capturedThumbnail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create share link");
      }

      // Generate share URL
      const shareUrl =
        data.shareUrl || `${window.location.origin}/analyze/share/${data.shareId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setToastMessage("Public link copied! Anyone with the link can view this specific report.");
      setTimeout(() => setCopiedShareLink(false), 3000);
    } catch (err: any) {
      console.error("Error sharing item:", err);
      alert(err.message || "Failed to share item. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  // 2. Download PNG
  const handleDownloadPNG = async () => {
    if (!targetRef.current) return;
    try {
      setDownloading("png");
      const { toPng } = await import("html-to-image");
      const title = extractTitle(content);
      const light = isLightMode(targetRef.current);
      const restoreSvg = applySvgStylesForCapture(targetRef.current, light);
      let dataUrl: string;
      try {
        dataUrl = await toPng(targetRef.current, {
          backgroundColor: light ? "#FFFFFF" : "#070914",
          pixelRatio: 2,
          cacheBust: true,
        });
      } finally {
        restoreSvg();
      }

      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMessage("Chart saved as PNG image!");
    } catch (err) {
      console.error("Error downloading PNG:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setDownloading(null);
      setDropdownOpen(false);
    }
  };

  // 3. Download PDF
  const handleDownloadPDF = async () => {
    if (!targetRef.current) return;
    try {
      setDownloading("pdf");
      const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const title = extractTitle(content);
      const light = isLightMode(targetRef.current);
      const restoreSvg = applySvgStylesForCapture(targetRef.current, light);
      let dataUrl: string;
      try {
        dataUrl = await toPng(targetRef.current, {
          backgroundColor: light ? "#FFFFFF" : "#070914",
          pixelRatio: isSafari ? 2 : 2.5,
          cacheBust: true,
        });
      } finally {
        restoreSvg();
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image failed to load for PDF"));
        }
      });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      try {
        const blob = pdf.output("blob");
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } catch (_) {
        pdf.save(filename);
      }

      setToastMessage("Report saved as PDF document!");
    } catch (err: any) {
      console.error("Error downloading PDF:", err);
      alert(err?.message || "Failed to export PDF. Please try again.");
    } finally {
      setDownloading(null);
      setDropdownOpen(false);
    }
  };

  // 4. Download PPT
  const handleDownloadPPT = async () => {
    try {
      setDownloading("ppt");
      const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const title = extractTitle(content);

      let capturedImage: string | null = null;
      if (targetRef.current) {
        try {
          const { toPng } = await import("html-to-image");
          const light = isLightMode(targetRef.current);
          const restoreSvg = applySvgStylesForCapture(targetRef.current, light);
          try {
            capturedImage = await toPng(targetRef.current, {
              backgroundColor: light ? "#FFFFFF" : "#070914",
              pixelRatio: isSafari ? 1.5 : 2,
            });
          } finally {
            restoreSvg();
          }
        } catch (_) {}
      }

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/export-ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          description: content.slice(0, 1000),
          imageUrl: capturedImage,
        }),
      });

      if (!res.ok) {
        let errorText = "";
        try {
          const errJson = await res.json();
          errorText = errJson.message || "";
        } catch (_) {}
        throw new Error(errorText || `Server returned ${res.status}: Failed to generate PPT presentation`);
      }

      const rawBlob = await res.blob();
      const pptxBlob = new Blob([rawBlob], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const url = window.URL.createObjectURL(pptxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      setToastMessage("Slide presentation (.pptx) downloaded!");
    } catch (err: any) {
      console.error("Error downloading PPT:", err);
      alert(err.message || "Failed to export PPT. Please try again.");
    } finally {
      setDownloading(null);
      setDropdownOpen(false);
    }
  };

  // 5. Open Full View / Lightbox
  const handleOpenFullView = async () => {
    try {
      setLightboxOpen(true);
      setLightboxImageSrc(null);
      setLightboxLoading(true);
      if (targetRef.current) {
        const { toPng } = await import("html-to-image");
        const light = isLightMode(targetRef.current);
        const restoreSvg = applySvgStylesForCapture(targetRef.current, light);
        let dataUrl: string;
        try {
          dataUrl = await toPng(targetRef.current, {
            backgroundColor: light ? "#FFFFFF" : "#070914",
            pixelRatio: 2.5,
          });
        } finally {
          restoreSvg();
        }
        setLightboxImageSrc(dataUrl);
      }
    } catch (err) {
      console.error("Error generating full view:", err);
    } finally {
      setLightboxLoading(false);
    }
  };

  return (
    <>
      <div className="relative mb-2 flex items-center justify-between border-b border-[#1E223D]/60 pb-2">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border border-[#7564F6]/40 bg-[#0E1222]/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Label */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-[#7564F6]" />
          <span>OneChat AI Insights</span>
        </div>

        {/* Action Buttons: Full View, Share & Download */}
        <div className="flex items-center gap-1.5">
          {/* Full View Button */}
          <div className="relative group/fv">
            <button
              type="button"
              onClick={handleOpenFullView}
              className="flex items-center gap-1.5 rounded-md border border-[#292D49] bg-[#0E1222] px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 hover:text-white active:scale-95 cursor-pointer"
              aria-label="Full View"
            >
              <Maximize2 className="h-5 w-5 text-slate-400 group-hover/fv:text-white transition-colors" />
              <span className="text-[11px] hidden xs:inline">Full View</span>
            </button>
            {/* Tooltip: drops downward to avoid clipping */}
            <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/fv:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              Full View
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-[#181B34]" />
            </div>
          </div>

          {/* Share Button */}
          <div className="relative group/share">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-1.5 rounded-md border border-[#292D49] bg-[#0E1222] px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 hover:text-white active:scale-95 disabled:opacity-50 cursor-pointer"
              aria-label="Share Chart"
            >
              {sharing ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#7564F6]" />
              ) : copiedShareLink ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : (
                <Share2 className="h-5 w-5 text-slate-400 group-hover/share:text-white transition-colors" />
              )}
              <span className="text-[11px] hidden xs:inline">
                {sharing ? "Sharing..." : copiedShareLink ? "Copied!" : "Share"}
              </span>
            </button>
            {/* Tooltip: Share Chart - drops downward */}
            <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/share:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              Share Chart
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-[#181B34]" />
            </div>
          </div>

          {/* Download Dropdown */}
          <div className="relative group/dl" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 rounded-md border border-[#292D49] bg-[#0E1222] px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 hover:text-white active:scale-95 disabled:opacity-50"
              aria-label="Download Chart"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-[#7564F6]" />
                  <span className="text-[11px]">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 text-slate-400 group-hover/dl:text-white transition-colors" />
                  <span className="text-[11px] hidden xs:inline">Download</span>
                </>
              )}
            </button>

            {/* Tooltip: Download Chart (hidden when dropdown is open) - aligned to right edge */}
            {!dropdownOpen && (
              <div className="pointer-events-none absolute top-full right-0 mt-2 hidden group-hover/dl:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                Download Chart
                <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-[#181B34]" />
              </div>
            )}

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-[#292D49] bg-[#0E1222] p-1.5 shadow-2xl z-50">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Export Options
                </div>

                <button type="button"
                  onClick={handleDownloadPNG}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-[#A78BFA]" />
                  <span>PNG Image</span>
                </button>

                <button type="button"
                  onClick={handleDownloadPDF}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-[#F43F5E]" />
                  <span>PDF Document</span>
                </button>

                <button type="button"
                  onClick={handleDownloadPPT}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
                >
                  <Presentation className="h-4 w-4 text-[#F97316]" />
                  <span>PowerPoint (PPT)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Popup */}
      {lightboxOpen && (() => {
        const light = isLightMode(targetRef.current);
        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className={`relative flex flex-col max-h-[92vh] max-w-5xl w-full rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                light
                  ? "border-slate-200 bg-white text-slate-900"
                  : "border-[#292D49] bg-[#0E1222] text-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div
                className={`flex items-center justify-between border-b px-5 py-3.5 ${
                  light
                    ? "border-slate-200 bg-slate-50/90 text-slate-800"
                    : "border-[#1E223D] bg-[#070914]/80 text-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <Sparkles className="h-4 w-4 text-[#7564F6] shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold truncate">
                    {extractTitle(content)}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(false)}
                    title="Close (Esc)"
                    className={`rounded-lg p-1.5 transition cursor-pointer ${
                      light
                        ? "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lightbox Content */}
              <div
                className={`flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center min-h-[300px] ${
                  light ? "bg-slate-50/50" : "bg-[#070914]"
                }`}
              >
                {lightboxLoading ? (
                  <div
                    className={`flex flex-col items-center gap-3 py-12 ${
                      light ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-[#7564F6]" />
                    <span className="text-sm font-medium">Generating high-resolution view...</span>
                  </div>
                ) : lightboxImageSrc ? (
                  <img
                    src={lightboxImageSrc}
                    alt={extractTitle(content)}
                    className={`max-h-[76vh] w-auto max-w-full rounded-xl object-contain border shadow-2xl ${
                      light ? "border-slate-200 bg-white" : "border-[#1E223D] bg-[#070914]"
                    }`}
                  />
                ) : (
                  <div className={light ? "text-slate-500 text-sm" : "text-slate-400 text-sm"}>
                    Failed to render chart image
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
