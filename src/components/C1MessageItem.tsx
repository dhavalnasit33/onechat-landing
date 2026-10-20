"use client";

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from "next/dynamic";
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

const C1Component = dynamic(
  () => import("@thesysai/genui-sdk").then((mod) => mod.C1Component),
  { ssr: false }
);

interface C1MessageItemProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
  };
  chatId: string;
  isStreaming: boolean;
  apiBaseUrl: string;
  authToken: string;
}

interface ChartItemTarget {
  id: string;
  title: string;
  element: HTMLElement;
}

export const C1MessageItem: React.FC<C1MessageItemProps> = ({
  message,
  chatId,
  isStreaming,
  apiBaseUrl,
  authToken,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detectedItems, setDetectedItems] = useState<ChartItemTarget[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Robustly detect all individual sections, charts, slides, tables, and cards ("graphs/charts or anything")
  useEffect(() => {
    if (isStreaming || !containerRef.current) return;

    const scanElements = () => {
      if (!containerRef.current) return;
      const root = containerRef.current;
      const items: ChartItemTarget[] = [];
      const seenElements = new Set<HTMLElement>();

      // Step 1: Find all Recharts containers and Tables (only primary containers)
      const primaryElements = Array.from(root.querySelectorAll(".recharts-responsive-container, table")) as HTMLElement[];

      // Fallback: If no .recharts-responsive-container found, look for direct svgs
      if (primaryElements.length === 0) {
        const directSvgs = Array.from(root.querySelectorAll("svg.recharts-surface")) as HTMLElement[];
        directSvgs.forEach((svg) => {
          if (svg.parentElement) primaryElements.push(svg.parentElement);
        });
      }

      // Step 2: For each primary element, find its unique top-level section card
      const candidateCards: HTMLElement[] = [];

      primaryElements.forEach((el) => {
        let bestCard: HTMLElement = el;
        let curr: HTMLElement | null = el.parentElement;

        while (curr && curr !== root) {
          // If this parent holds multiple charts/tables, stop climbing to avoid merging
          const otherPrimaries = curr.querySelectorAll(".recharts-responsive-container, table");
          if (otherPrimaries.length > 1) {
            break;
          }

          // Check if parent is an Accordion/Collapsible list with sibling panels
          if (curr.parentElement && (curr.hasAttribute("data-state") || curr.classList.contains("border") || curr.classList.contains("rounded-2xl") || curr.classList.contains("rounded-xl"))) {
            bestCard = curr;
            break;
          }

          bestCard = curr;

          // If we hit a bordered / rounded card, that's the section
          if (
            curr.classList.contains("border") ||
            curr.classList.contains("rounded-2xl") ||
            curr.classList.contains("rounded-xl")
          ) {
            break;
          }

          curr = curr.parentElement;
        }

        if (bestCard && bestCard.offsetHeight > 50) {
          candidateCards.push(bestCard);
        }
      });

      // Step 3: Strictly deduplicate candidate cards (if card A contains card B, keep only the outer card A)
      const finalUniqueCards: HTMLElement[] = [];
      candidateCards.forEach((c) => {
        // Skip if already in final list
        if (finalUniqueCards.includes(c)) return;

        // Skip if another card in candidateCards already contains this card
        const isChildOfAnother = candidateCards.some((other) => other !== c && other.contains(c));
        if (!isChildOfAnother) {
          // Also remove any existing card in finalUniqueCards that is contained inside c
          for (let i = finalUniqueCards.length - 1; i >= 0; i--) {
            if (c.contains(finalUniqueCards[i])) {
              finalUniqueCards.splice(i, 1);
            }
          }
          finalUniqueCards.push(c);
        }
      });

      // Step 4: Map final unique cards to items
      finalUniqueCards.forEach((card, idx) => {
        card.style.maxWidth = "100%";
        // Look specifically for heading tags first, then strong/bold, then paragraphs
        const titleElem = card.querySelector("h1, h2, h3, h4, strong, [class*='title' i]") || card.querySelector("p");
        let rawTitle = titleElem?.textContent?.trim() || "";

        // If the title is very long, take up to 90 chars at a clean word boundary
        let cleanTitle = rawTitle;
        if (cleanTitle.length > 90) {
          const cut = cleanTitle.slice(0, 90);
          const lastSpace = cut.lastIndexOf(" ");
          cleanTitle = (lastSpace > 30 ? cut.slice(0, lastSpace) : cut) + "...";
        }

        const title = cleanTitle || `Chart ${idx + 1}`;

        items.push({
          id: `card-${message.id}-${idx}`,
          title,
          element: card,
        });
      });

      // 3. Fallback: If AI generates a custom layout or text-based report with NO standard SVG or table,
      // allow downloading/sharing the entire generated response card so functionality NEVER breaks!
      if (items.length === 0 && root.offsetHeight > 100) {
        items.push({
          id: `full-response-${message.id}`,
          title: "AI Analysis Report",
          element: root,
        });
      }

      const isErrorText =
        message.content.includes("Error while generating response") ||
        message.content.includes("Internal Server Error") ||
        (root.innerText && root.innerText.includes("Error while generating response"));
      if (isErrorText || items.length === 0) {
        setDetectedItems([]);
        return;
      }
      setDetectedItems(items);
    };

    const timer = setTimeout(scanElements, 700);
    const secondTimer = setTimeout(scanElements, 2000);
    const thirdTimer = setTimeout(scanElements, 4000);
    const observer = new MutationObserver(() => scanElements());
    observer.observe(containerRef.current, { childList: true, subtree: true, attributes: true });
    return () => {
      clearTimeout(timer);
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
      observer.disconnect();
    };
  }, [isStreaming, message.content, message.id]);

  // Helper filter to exclude action buttons overlay when taking screenshot
  const imageFilter = (node: HTMLElement) => {
    if (!node.classList) return true;
    return !node.classList.contains("chart-action-overlay");
  };

  // Helper to ensure all Recharts SVG texts (Y-axis numbers, etc.) are bright light slate
  const applyBrightSvgStyles = (element: HTMLElement) => {
    const textNodes = element.querySelectorAll("text, tspan, .recharts-cartesian-axis-tick text, .recharts-text");
    const originalFills: { el: SVGTextElement; fill: string; styleFill: string; opacity: string }[] = [];
    textNodes.forEach((t) => {
      const el = t as SVGTextElement;
      originalFills.push({
        el,
        fill: el.getAttribute("fill") || "",
        styleFill: el.style.fill || "",
        opacity: el.style.opacity || "",
      });
      el.setAttribute("fill", "#F8FAFC");
      el.style.fill = "#F8FAFC";
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


  /**
  * Captures the FULL chart (2026-01 → 2026-12), even if part of it is hidden
  * inside a horizontal scroll container on screen.
  */
  const captureFullChart = async (
    element: HTMLElement,
    options: { pixelRatio?: number; padding?: number; borderRadius?: string } = {}
  ): Promise<string> => {
    const { pixelRatio = 2.5, padding = 24, borderRadius = "16px" } = options;
    const { toPng } = await import("html-to-image");

    // ---- helper: save/restore inline style of any element ----
    const restores: Array<() => void> = [];
    const saveStyle = (el: HTMLElement) => {
      const prev = el.getAttribute("style");
      restores.push(() => {
        if (prev === null) el.removeAttribute("style");
        else el.setAttribute("style", prev);
      });
    };

    // ---- 1. Un-clip every ancestor ----
    let p: HTMLElement | null = element.parentElement;
    while (p && p !== document.body) {
      saveStyle(p);
      p.style.overflow = "visible";
      p.style.maxHeight = "none";
      p = p.parentElement;
    }

    // ---- 2. Find ALL horizontal scrollers inside the card (by computed style) ----
    const allEls = Array.from(element.querySelectorAll<HTMLElement>("*"));
    const scrollers = allEls.filter((el) => {
      const ox = window.getComputedStyle(el).overflowX;
      return (
        (ox === "auto" || ox === "scroll" || ox === "hidden") &&
        el.scrollWidth > el.clientWidth + 2
      );
    });

    let extraWidth = 0;
    scrollers.forEach((el) => {
      extraWidth = Math.max(extraWidth, el.scrollWidth - el.clientWidth);
    });

    scrollers.forEach((el) => {
      const full = el.scrollWidth;
      saveStyle(el);
      el.scrollLeft = 0;
      el.style.overflow = "visible";
      el.style.overflowX = "visible";
      el.style.overflowY = "visible";
      el.style.width = `${full}px`;
      el.style.minWidth = `${full}px`;
      el.style.maxWidth = "none";
      el.style.flex = "none";
    });

    // un-clip other chart parts (legend, svg, wrapper)
    element
      .querySelectorAll<HTMLElement>(
        ".recharts-wrapper, .recharts-legend-wrapper, svg, [class*='overflow']"
      )
      .forEach((el) => {
        if (scrollers.includes(el)) return;
        saveStyle(el);
        el.style.overflow = "visible";
      });

    // grow the card itself so the extra width fits inside it
    saveStyle(element);
    const baseWidth = element.offsetWidth;
    const fullCardWidth = baseWidth + extraWidth;
    element.style.overflow = "visible";
    element.style.maxWidth = "none";
    element.style.width = `${fullCardWidth}px`;
    element.style.minWidth = `${fullCardWidth}px`;

    await new Promise((r) => setTimeout(r, 350)); 

    // ---- 3. Measure TRUE bounds ----
    const rootRect = element.getBoundingClientRect();
    let minX = 0,
      minY = 0;
    let maxX = Math.max(element.scrollWidth, element.offsetWidth);
    let maxY = Math.max(element.scrollHeight, element.offsetHeight);

    element.querySelectorAll<Element>("*").forEach((child) => {
      try {
        const r = child.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        minX = Math.min(minX, r.left - rootRect.left);
        minY = Math.min(minY, r.top - rootRect.top);
        maxX = Math.max(maxX, r.right - rootRect.left);
        maxY = Math.max(maxY, r.bottom - rootRect.top);
      } catch (_) { }
    });

    const leftOverflow = Math.abs(Math.min(minX, 0));
    const topOverflow = Math.abs(Math.min(minY, 0));

    const captureWidth = Math.ceil(maxX + leftOverflow + padding * 2);
    const captureHeight = Math.ceil(maxY + topOverflow + padding * 2 + 20);

    // ---- 4. Capture ----
    const restoreSvg = applyBrightSvgStyles(element);
    try {
      return await toPng(element, {
        backgroundColor: "#070914",
        pixelRatio,
        cacheBust: true,
        filter: imageFilter as any,
        width: captureWidth,
        height: captureHeight,
        style: {
          transform: `translate(${padding + leftOverflow}px, ${padding + topOverflow}px)`,
          transformOrigin: "top left",
          width: `${Math.ceil(maxX)}px`,
          height: `${Math.ceil(maxY)}px`,
          borderRadius,
          overflow: "visible",
          margin: "0",
          boxSizing: "content-box",
        },
      });
    } finally {
      restoreSvg();
      restores.reverse().forEach((fn) => fn()); 
    }
  };

  // ---------------- SHARE ----------------
  const handleShare = async (target: ChartItemTarget) => {
    if (sharingId) return;
    try {
      setSharingId(target.id);
      let capturedThumbnail: string | null = null;

      try {
        capturedThumbnail = await captureFullChart(target.element, {
          pixelRatio: 2,
          padding: 24,
          borderRadius: "16px",
        });
      } catch (e) {
        console.error("Thumbnail capture failed:", e);
      }

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/share-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chatId,
          title: target.title || "AI Generated Analysis",
          description: target.element.innerText?.slice(0, 300) || "",
          c1Content: message.content,
          itemType: "chart",
          imageUrl: capturedThumbnail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate share link");
      }

      const shareUrl =
        data.shareUrl || `${window.location.origin}/analyze/share/${data.shareId}`;

      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch (_) { }
      }
      if (!copied) {
        try {
          const ta = document.createElement("textarea");
          ta.value = shareUrl;
          ta.style.position = "fixed";
          ta.style.top = "-9999px";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          copied = true;
        } catch (_) { }
      }
      setToastMessage(
        copied
          ? `Share link for "${target.title}" copied to clipboard!`
          : `Share link generated! Open: ${shareUrl}`
      );
    } catch (err: any) {
      console.error("Error sharing:", err);
      alert(err.message || "Failed to share. Please try again.");
    } finally {
      setSharingId(null);
    }
  };

  // ---------------- DOWNLOAD PNG ----------------
  const handleDownloadPNG = async (target: ChartItemTarget) => {
    try {
      setExportingId(target.id);
      const dataUrl = await captureFullChart(target.element, {
        pixelRatio: 2.5,
        padding: 24,
        borderRadius: "16px",
      });
      const link = document.createElement("a");
      link.download = `${(target.title || "chart").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
      setToastMessage(`"${target.title}" downloaded as PNG!`);
    } catch (err) {
      console.error("Error exporting PNG:", err);
      alert("Failed to export PNG. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
    }
  };

  // ---------------- DOWNLOAD PDF ----------------
  const handleDownloadPDF = async (target: ChartItemTarget) => {
    try {
      setExportingId(target.id);
      const { jsPDF } = await import("jspdf");
      const dataUrl = await captureFullChart(target.element, {
        pixelRatio: 2.5,
        padding: 24,
        borderRadius: "16px",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      pdf.save(`${(target.title || "chart").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      setToastMessage(`"${target.title}" downloaded as PDF!`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
    }
  };

  // ---------------- DOWNLOAD PPT ----------------
  const handleDownloadPPT = async (target: ChartItemTarget) => {
    try {
      setExportingId(target.id);

      const capturedImage = await captureFullChart(target.element, {
        pixelRatio: 2,
        padding: 24,
        borderRadius: "16px",
      });

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/export-ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: target.title || "AI Generated Analysis",
          description: "",
          imageUrl: capturedImage,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate PowerPoint slide");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(target.title || "slide").replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage(`PowerPoint Slide (.pptx) downloaded for "${target.title}"!`);
    } catch (err: any) {
      console.error("Error exporting PPT:", err);
      alert(err.message || "Failed to generate PPT. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
    }
  };


  return (
    <div className="w-full min-w-0 max-w-full space-y-3 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#7564F6] bg-[#0E1222]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Rendered Container */}
      <div
        ref={containerRef}
        className="rounded-2xl border border-[#1E223D] bg-[#070914] p-3 sm:p-5 shadow-lg relative"
      >
        <div
          suppressHydrationWarning
          className="dark space-y-3"
          style={{
            colorScheme: "dark",
            backgroundColor: "#070914",
            color: "#F8FAFC",
          }}
        >
          <C1Component c1Response={message.content} isStreaming={isStreaming} />
          {!isStreaming &&
            detectedItems.map((target) => {
              if (!target.element) return null;
              target.element.style.position = 'relative';
              return createPortal(
                <div
                  key={target.id}
                  className={"chart-action-overlay absolute z-30 flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[#292D49] bg-[#0E1222]/95 px-2 py-1 shadow-2xl backdrop-blur-md transition-all hover:border-[#7564F6]"}
                  style={{ top: '8px', right: '12px' }}
                >
                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShare(target)}
                    disabled={sharingId === target.id}
                    title={"Share " + target.title}
                    className={"flex items-center gap-1 sm:gap-1.5 rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95"}
                  >
                    {sharingId === target.id ? (
                      <Loader2 className={"h-3 w-3 animate-spin text-[#7564F6] shrink-0"} />
                    ) : (
                      <Share2 className={"h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0"} />
                    )}
                    <span className="hidden xs:inline">Share</span>
                  </button>

                  <div className={"h-3 sm:h-3.5 w-px bg-[#292D49] shrink-0"} />

                  <div className={"relative"}>
                    <button
                      type="button"
                      onClick={() => setActiveDropdownId(activeDropdownId === target.id ? null : target.id)}
                      disabled={exportingId === target.id}
                      title={"Download " + target.title}
                      className={"flex items-center gap-1 sm:gap-1.5 rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95"}
                    >
                      {exportingId === target.id ? (
                        <Loader2 className={"h-3 w-3 animate-spin text-[#7564F6] shrink-0"} />
                      ) : (
                        <Download className={"h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0"} />
                      )}
                      <span className="hidden xs:inline">Download</span>
                    </button>

                    {activeDropdownId === target.id && (
                      <div className={"absolute right-0 top-full mt-1.5 w-36 sm:w-40 rounded-xl border border-[#292D49] bg-[#0E1222] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"}>
                        <button
                          type="button"
                          onClick={() => handleDownloadPNG(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <ImageIcon className={"h-3.5 w-3.5 text-[#A78BFA] shrink-0"} />
                          <span>PNG Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <FileText className={"h-3.5 w-3.5 text-[#F43F5E] shrink-0"} />
                          <span>PDF Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPPT(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <Presentation className={"h-3.5 w-3.5 text-[#F97316] shrink-0"} />
                          <span>PPT (Slide)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                , target.element);
            })}

          {isStreaming && (
            <div className="flex w-fit items-center gap-2.5 rounded-full border border-[#292D49] bg-[#121424]/90 px-3.5 py-1.5 text-xs text-[#A78BFA] shadow-lg animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C56E5]" />
              <span>OneChat AI is generating insights & charts...</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
