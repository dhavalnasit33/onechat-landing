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
          capturedThumbnail = await toPng(targetRef.current, {
            backgroundColor: "#070914",
            pixelRatio: 1,
          });
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
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: "#070914",
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
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
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const title = extractTitle(content);

      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: "#070914",
        pixelRatio: 2,
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      pdf.save(`${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      setToastMessage("Report saved as PDF document!");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setDownloading(null);
      setDropdownOpen(false);
    }
  };

  // 4. Download PPT
  const handleDownloadPPT = async () => {
    try {
      setDownloading("ppt");
      const title = extractTitle(content);

      let capturedImage: string | null = null;
      if (targetRef.current) {
        try {
          const { toPng } = await import("html-to-image");
          capturedImage = await toPng(targetRef.current, {
            backgroundColor: "#070914",
            pixelRatio: 1.5,
          });
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
        throw new Error("Failed to generate PPT presentation");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage("Slide presentation (.pptx) downloaded!");
    } catch (err: any) {
      console.error("Error downloading PPT:", err);
      alert(err.message || "Failed to export PPT. Please try again.");
    } finally {
      setDownloading(null);
      setDropdownOpen(false);
    }
  };

  return (
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

      {/* Action Buttons: Share & Download */}
      <div className="flex items-center gap-1.5">
        {/* Share Button */}
        <button type="button"
          onClick={handleShare}
          disabled={sharing}
          title="Share this specific chart/report"
          className="flex items-center gap-1.5 rounded-md border border-[#292D49] bg-[#0E1222] px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 hover:text-white active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {sharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7564F6]" />
          ) : copiedShareLink ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="text-[11px]">
            {sharing ? "Sharing..." : copiedShareLink ? "Copied!" : "Share"}
          </span>
        </button>

        {/* Download Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={downloading !== null}
            title="Download this specific chart/report"
            className="flex items-center gap-1.5 rounded-md border border-[#292D49] bg-[#0E1222] px-2.5 py-1 text-xs text-slate-300 transition hover:border-[#7564F6] hover:bg-[#7564F6]/10 hover:text-white active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7564F6]" />
                <span className="text-[11px]">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px]">Download</span>
              </>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-[#292D49] bg-[#0E1222] p-1.5 shadow-2xl z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Export Options
              </div>

              <button type="button"
                onClick={handleDownloadPNG}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
              >
                <ImageIcon className="h-3.5 w-3.5 text-[#A78BFA]" />
                <span>PNG Image</span>
              </button>

              <button type="button"
                onClick={handleDownloadPDF}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-[#F43F5E]" />
                <span>PDF Document</span>
              </button>

              <button type="button"
                onClick={handleDownloadPPT}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-[#6C56E5]/20 hover:text-white cursor-pointer"
              >
                <Presentation className="h-3.5 w-3.5 text-[#F97316]" />
                <span>PowerPoint (PPT)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
