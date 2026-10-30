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
  Maximize2,
  X,
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
  const [sharingAll, setSharingAll] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lightboxTarget, setLightboxTarget] = useState<ChartItemTarget | null>(null);
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
  const [lightboxLoading, setLightboxLoading] = useState<boolean>(false);
  const [lightboxDropdownOpen, setLightboxDropdownOpen] = useState<boolean>(false);

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

          // Check if parent has a heading or title (e.g. h1, h2, h3, h4, or [class*='title'])
          const hasTitle = curr.querySelector("h1, h2, h3, h4, [class*='title' i], [class*='header' i]");
          if (hasTitle) {
            bestCard = curr;
          }

          // If we hit a bordered / rounded card, that's the section
          if (
            curr.classList.contains("border") ||
            curr.classList.contains("rounded-2xl") ||
            curr.classList.contains("rounded-xl")
          ) {
            bestCard = curr;
            break;
          }

          curr = curr.parentElement;
        }

        if (bestCard && bestCard.offsetHeight > 140 && !bestCard.querySelector("[class*='metric']")) {
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

  // Helper filter to exclude action buttons overlay and scroll navigation buttons when taking screenshot
  const imageFilter = (node: HTMLElement) => {
    if (!node) return true;
    if (node.dataset?.hiddenForCapture === "true") return false;
    if (node.classList) {
      if (node.classList.contains("chart-action-overlay")) return false;
      if (
        node.classList.contains("openui-follow-up-block") ||
        node.classList.contains("openui-follow-up-item") ||
        node.classList.contains("crayon-follow-up-block") ||
        node.classList.contains("crayon-follow-up-item") ||
        node.classList.contains("crayon-chart-vertical-scroll-buttons-container") ||
        node.classList.contains("crayon-chart-vertical-scroll-button") ||
        node.classList.contains("openui-chart-vertical-scroll-buttons-container") ||
        node.classList.contains("openui-chart-vertical-scroll-button") ||
        node.classList.contains("crayon-chart-horizontal-scroll-buttons-container") ||
        node.classList.contains("crayon-chart-horizontal-scroll-button") ||
        node.classList.contains("openui-chart-horizontal-scroll-buttons-container") ||
        node.classList.contains("openui-chart-horizontal-scroll-button")
      ) {
        return false;
      }
    }
    const className = typeof node.className === "string" ? node.className : (node.getAttribute?.("class") || "");
    if (className) {
      if (
        className.includes("chart-action-overlay") ||
        className.includes("follow-up") ||
        className.includes("followup") ||
        className.includes("scroll-button") ||
        className.includes("scroll-buttons") ||
        className.includes("scroll-arrow") ||
        className.includes("scroll-control") ||
        /scroll.*button/i.test(className)
      ) {
        return false;
      }
    }
    if (node.hasAttribute?.("data-followup")) return false;
    const ariaLabel = node.getAttribute?.("aria-label")?.toLowerCase() || "";
    if (ariaLabel.includes("scroll") || ariaLabel.includes("next page") || ariaLabel.includes("previous page")) {
      return false;
    }
    return true;
  };

  // Helper to detect if current theme or element is light mode (including computer/OS theme setting)
  const isLightMode = (element?: HTMLElement | null): boolean => {
    if (typeof window === "undefined") return false;

    // 1. Explicit light class override
    if (document.documentElement.classList.contains("light") || document.body.classList.contains("light")) {
      return true;
    }

    // 2. Check system/computer theme preference (OS Light / Dark theme)
    // Note: <html className="... dark"> is hardcoded in layout.tsx, so we must check system matchMedia directly!
    if (typeof window.matchMedia === "function") {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        return true;
      }
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return false;
      }
    }

    // 3. Fallback: inspect parent container and surroundings for computed background colors
    const target = element || containerRef.current;
    if (target) {
      let curr: HTMLElement | null = target;
      while (curr && curr !== document.body) {
        if (curr.classList.contains("light")) return true;

        const bg = window.getComputedStyle(curr).backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
          const rgb = bg.match(/\d+/g);
          if (rgb && rgb.length >= 3) {
            const r = parseInt(rgb[0]), g = parseInt(rgb[1]), b = parseInt(rgb[2]);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness > 140) return true; // Light background detected!
            if (brightness < 80) return false; // Dark background detected!
          }
        }
        curr = curr.parentElement;
      }
    }

    // Default to dark theme for OneChat AI
    return false;
  };

  // Helper to ensure all Recharts SVG texts are legible depending on theme
  const applySvgStylesForCapture = (element: HTMLElement, light: boolean) => {
    const textNodes = element.querySelectorAll("text, tspan, .recharts-cartesian-axis-tick text, .recharts-text, [class*='axis'] text, [class*='legend'] text");
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
      el.style.visibility = "visible";
    });

    // Also ensure HTML titles, subtitles, and legends inside the captured card are visible
    const htmlTexts = element.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, div, [class*='legend'], [class*='axis']");
    const originalHtmlColors: { el: HTMLElement; color: string }[] = [];
    htmlTexts.forEach((el) => {
      const comp = window.getComputedStyle(el);
      if (comp.color === "rgba(0, 0, 0, 0)" || comp.opacity === "0") {
        originalHtmlColors.push({ el, color: el.style.color });
        el.style.color = targetColor;
        el.style.opacity = "1";
      }
    });

    return () => {
      originalFills.forEach(({ el, fill, styleFill, opacity }) => {
        if (fill) el.setAttribute("fill", fill);
        else el.removeAttribute("fill");
        el.style.fill = styleFill;
        el.style.opacity = opacity;
      });
      originalHtmlColors.forEach(({ el, color }) => {
        el.style.color = color;
      });
    };
  };

  // Helper to convert SVG <foreignObject> category labels (used by HorizontalBarChart / vertical scroll charts)
  // to native SVG <text> elements because canvas renderers drop nested foreignObjects inside SVG image data URLs
  const convertForeignObjectsForCapture = (element: HTMLElement, light: boolean) => {
    const foreignObjects = Array.from(element.querySelectorAll<SVGForeignObjectElement>("foreignObject"));
    const createdSvgTexts: SVGTextElement[] = [];
    const targetColor = light ? "#475569" : "#94A3B8";

    foreignObjects.forEach((fo) => {
      const text = fo.textContent?.trim();
      if (!text) return;

      const foX = parseFloat(fo.getAttribute("x") || "0");
      const foY = parseFloat(fo.getAttribute("y") || "0");
      const foHeight = parseFloat(fo.getAttribute("height") || "20");

      const innerDiv = fo.querySelector<HTMLElement>(".crayon-horizontal-bar-chart-category-label, div, span") || (fo.firstElementChild as HTMLElement | null);
      let padLeft = 14;
      let fontSize = "11px";
      let fontFamily = "var(--font-sans), system-ui, sans-serif";
      let fontWeight = "500";

      if (innerDiv) {
        try {
          const comp = window.getComputedStyle(innerDiv);
          const parsedPad = parseFloat(comp.paddingLeft);
          if (!isNaN(parsedPad) && parsedPad > 0) padLeft = parsedPad;
          if (comp.fontSize) fontSize = comp.fontSize;
          if (comp.fontFamily) fontFamily = comp.fontFamily;
          if (comp.fontWeight) fontWeight = comp.fontWeight;
        } catch (_) {}
      }

      const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      svgText.setAttribute("x", String(foX + padLeft));
      svgText.setAttribute("y", String(foY + foHeight * 0.72));
      svgText.setAttribute("dominant-baseline", "middle");
      svgText.setAttribute("fill", targetColor);
      svgText.setAttribute("font-size", fontSize);
      svgText.setAttribute("font-family", fontFamily);
      svgText.setAttribute("font-weight", fontWeight);
      svgText.setAttribute("class", "crayon-converted-category-label");
      svgText.textContent = text;

      if (fo.parentElement) {
        fo.parentElement.appendChild(svgText);
        createdSvgTexts.push(svgText);
      }

      fo.style.opacity = "0";
    });

    return () => {
      createdSvgTexts.forEach((el) => el.remove());
      foreignObjects.forEach((fo) => {
        fo.style.opacity = "";
      });
    };
  };

  // Helper to temporarily hide any "Related Questions" / "Related Queries" / Follow-up blocks during capture
  const hideRelatedQuestions = (root: HTMLElement): (() => void) => {
    const hiddenElements: { el: HTMLElement; prevDisplay: string; prevVisibility: string }[] = [];

    const hideEl = (el: HTMLElement) => {
      if (!el || el.dataset.hiddenForCapture === "true") return;
      hiddenElements.push({
        el,
        prevDisplay: el.style.display,
        prevVisibility: el.style.visibility,
      });
      el.dataset.hiddenForCapture = "true";
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
    };

    // 1. Direct class & attribute matches
    root.querySelectorAll<HTMLElement>(
      ".openui-follow-up-block, .openui-follow-up-item, .crayon-follow-up-block, .crayon-follow-up-item, [data-followup], [class*='follow-up'], [class*='followup']"
    ).forEach(hideEl);

    // 2. Headings containing "related questions" or "related queries"
    root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, strong, p, span, div").forEach((heading) => {
      const text = heading.textContent?.trim().toLowerCase() || "";
      if (
        text === "related questions" ||
        text === "related queries" ||
        text.startsWith("related questions") ||
        text.startsWith("related queries")
      ) {
        let container: HTMLElement | null = heading.closest("section, div[class*='accordion'], [class*='related']");
        if (!container || container === root) {
          const parent = heading.parentElement;
          if (
            parent &&
            parent !== root &&
            parent.querySelectorAll(".recharts-responsive-container, table, svg").length === 0
          ) {
            container = parent;
          } else {
            hideEl(heading);
            let next = heading.nextElementSibling as HTMLElement | null;
            while (next) {
              hideEl(next);
              next = next.nextElementSibling as HTMLElement | null;
            }
            return;
          }
        }
        if (container && container !== root) {
          hideEl(container);
        } else {
          hideEl(heading);
        }
      }
    });

    // 3. Any accordion or list of questions outside chart/table
    root.querySelectorAll<HTMLElement>(".openui-accordion, .crayon-accordion, [class*='accordion']").forEach((acc) => {
      const text = acc.textContent?.toLowerCase() || "";
      if (
        (text.includes("?") || text.includes("related") || acc.querySelector("[class*='trigger']")) &&
        acc.querySelectorAll(".recharts-responsive-container, table").length === 0
      ) {
        hideEl(acc);
      }
    });

    return () => {
      hiddenElements.forEach(({ el, prevDisplay, prevVisibility }) => {
        delete el.dataset.hiddenForCapture;
        if (prevDisplay) {
          el.style.display = prevDisplay;
        } else {
          el.style.removeProperty("display");
        }
        if (prevVisibility) {
          el.style.visibility = prevVisibility;
        } else {
          el.style.removeProperty("visibility");
        }
      });
    };
  };

  /**
  * Captures the FULL chart (including horizontal and vertical scrolling charts),
  * ensuring all categories, bars, and texts are rendered without being clipped.
  */
  const captureFullChart = async (
    element: HTMLElement,
    options: { pixelRatio?: number; padding?: number; borderRadius?: string } = {}
  ): Promise<string> => {
    const { pixelRatio = 2.5, padding = 24, borderRadius = "16px" } = options;
    const { toPng } = await import("html-to-image");

    // Hide any "Related Questions" or follow-up blocks inside the element before measuring dimensions
    const restoreRelated = hideRelatedQuestions(element);

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

    // ---- 2. Find ALL horizontal scrollers inside the card ----
    const allEls = [element, ...Array.from(element.querySelectorAll<HTMLElement>("*"))];
    const hScrollers = allEls.filter((el) => {
      const ox = window.getComputedStyle(el).overflowX;
      const isKnown =
        el.classList.contains("openui-bar-chart-main-container") ||
        el.classList.contains("crayon-bar-chart-main-container") ||
        /bar-chart-main-container/.test(el.className || "");
      return (
        ((ox === "auto" || ox === "scroll" || ox === "hidden") && el.scrollWidth > el.clientWidth + 2) ||
        (isKnown && (el.scrollWidth > el.clientWidth || !!el.querySelector("svg, .recharts-wrapper")))
      );
    });

    const vScrollers = allEls.filter((el) => {
      const oy = window.getComputedStyle(el).overflowY;
      return (
        (oy === "auto" || oy === "scroll" || oy === "hidden" || el.classList.contains("crayon-horizontal-bar-chart-main-container")) &&
        el.scrollHeight > el.clientHeight + 2
      );
    });

    let extraWidth = 0;
    hScrollers.forEach((el) => {
      let full = el.scrollWidth;
      el.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => {
        const wAttr = parseFloat(svg.getAttribute("width") || "0");
        if (wAttr > full) full = wAttr;
        const vb = (svg as SVGSVGElement).viewBox?.baseVal;
        if (vb && vb.width > full) full = vb.width;
        try {
          const bb = (svg as any).getBBox?.();
          if (bb && bb.width > full) full = bb.width;
        } catch (_) {}
      });
      el.querySelectorAll<HTMLElement>(".recharts-wrapper, [class*='recharts-wrapper']").forEach((rw) => {
        const w = parseFloat(rw.style.width || "0") || rw.scrollWidth || rw.offsetWidth;
        if (w > full) full = w;
      });

      const diff = Math.max(0, full - el.clientWidth);
      extraWidth = Math.max(extraWidth, diff);

      saveStyle(el);
      el.scrollLeft = 0;
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("overflow-x", "visible", "important");
      el.style.setProperty("overflow-y", "visible", "important");
      el.style.setProperty("width", `${full}px`, "important");
      el.style.setProperty("min-width", `${full}px`, "important");
      el.style.setProperty("max-width", "none", "important");
      el.style.setProperty("flex", "none", "important");

      el.querySelectorAll<HTMLElement>(".recharts-wrapper, svg").forEach((inner) => {
        saveStyle(inner);
        inner.style.setProperty("max-width", "none", "important");
        inner.style.setProperty("overflow", "visible", "important");
      });

      // Expand all intermediate wrapper elements up to the card layout
      let curr = el.parentElement;
      while (curr && curr !== element) {
        saveStyle(curr);
        curr.style.setProperty("overflow", "visible", "important");
        curr.style.setProperty("max-width", "none", "important");
        if (
          curr.classList.contains("c1-layout-row-ls-large-container") ||
          curr.classList.contains("c1-layout-row-sl-large-container") ||
          curr.classList.contains("c1-layout-row-mm-medium-left-container") ||
          curr.classList.contains("c1-layout-row-mm-medium-right-container")
        ) {
          const currentColWidth = curr.offsetWidth || 500;
          const targetWidth = Math.max(currentColWidth + diff, full + 60);
          curr.style.setProperty("flex", "none", "important");
          curr.style.setProperty("width", `${targetWidth}px`, "important");
          curr.style.setProperty("min-width", `${targetWidth}px`, "important");
          curr.style.setProperty("max-width", "none", "important");
        } else if (
          curr.classList.contains("c1-layout-row-ls-container") ||
          curr.classList.contains("c1-layout-row-sl-container") ||
          curr.classList.contains("c1-layout-row-mm-container")
        ) {
          curr.style.setProperty("flex-wrap", "nowrap", "important");
          curr.style.setProperty("width", "auto", "important");
          curr.style.setProperty("min-width", `${full + 380}px`, "important");
          curr.style.setProperty("max-width", "none", "important");
        } else {
          curr.style.setProperty("width", "auto", "important");
          curr.style.setProperty("min-width", `${full}px`, "important");
        }
        curr = curr.parentElement;
      }
    });

    let extraHeight = 0;
    vScrollers.forEach((el) => {
      extraHeight = Math.max(extraHeight, el.scrollHeight - el.clientHeight);
    });

    vScrollers.forEach((el) => {
      const fullHeight = el.scrollHeight;
      saveStyle(el);
      el.scrollTop = 0;
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("overflow-x", "visible", "important");
      el.style.setProperty("overflow-y", "visible", "important");
      el.style.setProperty("height", `${fullHeight}px`, "important");
      el.style.setProperty("min-height", `${fullHeight}px`, "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("flex", "none", "important");
    });

    // un-clip other chart parts (legend, svg, wrapper, HorizontalBarChart wrappers)
    element
      .querySelectorAll<HTMLElement>(
        ".recharts-wrapper, .recharts-legend-wrapper, svg, [class*='overflow'], .crayon-horizontal-bar-chart-container-inner-wrapper, .crayon-horizontal-bar-chart-container-inner, .crayon-horizontal-bar-chart-main-container, .crayon-horizontal-bar-chart-container, [class*='chart-container']"
      )
      .forEach((el) => {
        if (hScrollers.includes(el) || vScrollers.includes(el)) return;
        saveStyle(el);
        el.style.setProperty("overflow", "visible", "important");
        el.style.setProperty("max-height", "none", "important");
        if (
          el.classList.contains("crayon-horizontal-bar-chart-container-inner-wrapper") ||
          el.classList.contains("crayon-horizontal-bar-chart-container-inner")
        ) {
          el.style.setProperty("height", "auto", "important");
          el.style.setProperty("min-height", "auto", "important");
        }
      });

    // grow the card itself so the extra width fits inside it
    saveStyle(element);
    const baseWidth = element.offsetWidth;
    const fullCardWidth = Math.max(baseWidth + extraWidth, extraWidth > 0 ? baseWidth + extraWidth + 20 : baseWidth);
    element.style.setProperty("overflow", "visible", "important");
    element.style.setProperty("max-width", "none", "important");
    element.style.setProperty("width", `${fullCardWidth}px`, "important");
    element.style.setProperty("min-width", `${fullCardWidth}px`, "important");

    const baseHeight = element.offsetHeight;
    const fullCardHeight = baseHeight + extraHeight;
    element.style.setProperty("max-height", "none", "important");
    if (extraHeight > 0) {
      element.style.setProperty("height", `${fullCardHeight}px`, "important");
      element.style.setProperty("min-height", `${fullCardHeight}px`, "important");
    }

    element.classList.add("c1-chart-capturing");

    await new Promise((r) => setTimeout(r, 350)); 

    // ---- 3. Apply SVG styles & conversions before measuring bounds ----
    const light = isLightMode(element);
    const bgColor = light ? "#FFFFFF" : "#070914";
    const restoreSvg = applySvgStylesForCapture(element, light);
    const restoreForeignObjects = convertForeignObjectsForCapture(element, light);

    // Measure TRUE bounds (with widened Y-axis included)
    const rootRect = element.getBoundingClientRect();
    let minX = 0,
      minY = 0;
    let maxX = Math.max(element.scrollWidth, element.offsetWidth, fullCardWidth);
    let maxY = Math.max(element.scrollHeight, element.offsetHeight, fullCardHeight);

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
    try {
      return await toPng(element, {
        backgroundColor: bgColor,
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
      element.classList.remove("c1-chart-capturing");
      restoreForeignObjects();
      restoreSvg();
      restoreRelated();
      restores.reverse().forEach((fn) => fn()); 
    }
  };

  // Helper to strip "Related Queries" / "Related Questions" accordions/sections from c1Content for sharing
  const stripRelatedQueriesFromC1 = (content: string): string => {
    if (!content) return content;
    try {
      // 1. Try stripping from <content> XML/JSON structure
      const startTagIdx = content.indexOf("<content");
      const endTagIdx = content.lastIndexOf("</content>");
      if (startTagIdx !== -1 && endTagIdx !== -1) {
        const afterStart = content.indexOf(">", startTagIdx) + 1;
        const prefix = content.slice(0, afterStart);
        const encodedJson = content.slice(afterStart, endTagIdx);
        const suffix = content.slice(endTagIdx);
        const decodedJson = encodedJson.replace(/&quot;/g, '"');
        const obj = JSON.parse(decodedJson);

        const isRelated = (item: any): boolean => {
          if (!item) return false;
          const str = typeof item === "string" ? item : JSON.stringify(item);
          const lower = str.toLowerCase();
          return (
            lower.includes("related queries") ||
            lower.includes("related questions") ||
            lower.includes("openui-follow-up") ||
            lower.includes("crayon-follow-up") ||
            lower.includes("followup")
          );
        };

        const removeRelated = (node: any) => {
          if (!node || typeof node !== "object") return;
          for (const key of Object.keys(node)) {
            if (Array.isArray(node[key])) {
              node[key] = node[key].filter((item: any) => !isRelated(item));
              node[key].forEach(removeRelated);
            } else if (typeof node[key] === "object") {
              if (isRelated(node[key])) {
                delete node[key];
              } else {
                removeRelated(node[key]);
              }
            }
          }
        };

        removeRelated(obj);
        content = prefix + JSON.stringify(obj, null, 2).replace(/"/g, "&quot;") + suffix;
      }

      // 2. Also strip any trailing markdown / text "Related Questions" section
      content = content.replace(/(?:\n\s*(?:###?|##|\*\*|__)?\s*Related (?:Questions|Queries)[\s\S]*$)/i, "");
    } catch (e) {
      console.warn("Could not strip Related Queries from C1 JSON:", e);
    }
    return content;
  };

  // ---------------- SHARE ALL CHARTS ----------------
  const handleShareAll = async () => {
    if (sharingAll || sharingId) return;
    try {
      setSharingAll(true);
      let capturedThumbnail: string | null = null;

      try {
        if (containerRef.current) {
          capturedThumbnail = await captureFullChart(containerRef.current, {
            pixelRatio: 2,
            padding: 24,
            borderRadius: "16px",
          });
        }
      } catch (e) {
        console.error("Full thumbnail capture failed:", e);
      }

      // Find overall title from message or container
      const headingEl = containerRef.current?.querySelector("h1, h2, h3, h4, [class*='title' i]");
      const overallTitle = headingEl?.textContent?.trim() || "AI Generated Analysis";

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/share-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          chatId,
          title: overallTitle,
          description: (containerRef.current?.innerText || "").replace(/Related (?:Questions|Queries)[\s\S]*$/i, "").slice(0, 300).trim(),
          c1Content: stripRelatedQueriesFromC1(message.content),
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
          ? `Share link for all charts copied to clipboard!`
          : `Share link generated! Open: ${shareUrl}`
      );
    } catch (err: any) {
      console.error("Error sharing all charts:", err);
      alert(err.message || "Failed to share. Please try again.");
    } finally {
      setSharingAll(false);
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
          description: (target.element.innerText || "").replace(/Related (?:Questions|Queries)[\s\S]*$/i, "").slice(0, 300).trim(),
          c1Content: stripRelatedQueriesFromC1(message.content),
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

  // ---------------- FULL VIEW / LIGHTBOX ----------------
  const handleOpenFullView = async (target: ChartItemTarget) => {
    try {
      setLightboxTarget(target);
      setLightboxImageSrc(null);
      setLightboxLoading(true);
      const dataUrl = await captureFullChart(target.element, {
        pixelRatio: 2.5,
        padding: 24,
        borderRadius: "16px",
      });
      setLightboxImageSrc(dataUrl);
    } catch (err) {
      console.error("Error generating lightbox preview:", err);
    } finally {
      setLightboxLoading(false);
    }
  };

  const handleCloseLightbox = () => {
    setLightboxTarget(null);
    setLightboxImageSrc(null);
    setLightboxLoading(false);
    setLightboxDropdownOpen(false);
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
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMessage(`"${target.title}" downloaded as PNG!`);
    } catch (err) {
      console.error("Error exporting PNG:", err);
      alert("Failed to export PNG. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
      setLightboxDropdownOpen(false);
    }
  };

  // ---------------- DOWNLOAD PDF ----------------
  const handleDownloadPDF = async (target: ChartItemTarget) => {
    try {
      setExportingId(target.id);
      const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const { jsPDF } = await import("jspdf");
      const dataUrl = await captureFullChart(target.element, {
        pixelRatio: isSafari ? 2 : 2.5,
        padding: 24,
        borderRadius: "16px",
      });

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
      const filename = `${(target.title || "chart").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      // Safari-safe file download trigger using blob output
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

      setToastMessage(`"${target.title}" downloaded as PDF!`);
    } catch (err: any) {
      console.error("Error exporting PDF:", err);
      alert(err?.message || "Failed to export PDF. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
      setLightboxDropdownOpen(false);
    }
  };

  // ---------------- DOWNLOAD PPT ----------------
  const handleDownloadPPT = async (target: ChartItemTarget) => {
    try {
      setExportingId(target.id);
      const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      const capturedImage = await captureFullChart(target.element, {
        pixelRatio: isSafari ? 2 : 2.5,
        padding: 24,
        borderRadius: "16px",
      });

      // Fit captured image onto PowerPoint slide placeholder aspect ratio (~2.3:1)
      // to prevent the PPT template from stretching the image horizontally and distorting text/spacing
      let finalImageForPPT = capturedImage;
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = capturedImage;
        await new Promise<void>((resolve, reject) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Image load failed for PPT fit"));
          }
        });

        const light = isLightMode(target.element);
        const bgColor = light ? "#FFFFFF" : "#070914";
        const targetAspect = 2.3; // Target ratio for slide content area (~10in / ~4.35in)
        const imgAspect = img.width / img.height;

        let canvasW = img.width;
        let canvasH = img.height;
        let drawX = 0;
        let drawY = 0;

        if (imgAspect < targetAspect) {
          // Card is taller/square: expand canvas width with background color so text never stretches horizontally
          canvasW = Math.round(img.height * targetAspect);
          canvasH = img.height;
          drawX = Math.round((canvasW - img.width) / 2);
          drawY = 0;
        } else if (imgAspect > targetAspect) {
          // Card is wider: expand canvas height with background color so text never squashes vertically
          canvasW = img.width;
          canvasH = Math.round(img.width / targetAspect);
          drawX = 0;
          drawY = Math.round((canvasH - img.height) / 2);
        }

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvasW, canvasH);
          ctx.drawImage(img, drawX, drawY, img.width, img.height);
          finalImageForPPT = canvas.toDataURL("image/png");
        }
      } catch (fitErr) {
        console.warn("PPT aspect ratio fitting fallback:", fitErr);
      }

      const res = await fetch(`${apiBaseUrl}/api/analyze-files/export-ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: target.title || "AI Generated Analysis",
          description: "",
          imageUrl: finalImageForPPT,
        }),
      });

      if (!res.ok) {
        let errorText = "";
        try {
          const errJson = await res.json();
          errorText = errJson.message || "";
        } catch (_) {}
        throw new Error(errorText || `Server returned ${res.status}: Failed to generate PowerPoint slide`);
      }

      const rawBlob = await res.blob();
      // Ensure proper PPTX MIME type for Safari
      const pptxBlob = new Blob([rawBlob], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const url = window.URL.createObjectURL(pptxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(target.title || "slide").replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Safari requires delaying URL revocation so the download pipeline can consume it
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      setToastMessage(`PowerPoint Slide (.pptx) downloaded for "${target.title}"!`);
    } catch (err: any) {
      console.error("Error exporting PPT:", err);
      alert(err.message || "Failed to generate PPT. Please try again.");
    } finally {
      setExportingId(null);
      setActiveDropdownId(null);
      setLightboxDropdownOpen(false);
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
        className="rounded-2xl border border-slate-200/20 dark:border-[#1E223D] bg-white dark:bg-[#070914] text-slate-900 dark:text-[#F8FAFC] p-3 sm:p-5 shadow-lg relative"
      >
        {/* Top-Right "Share all charts" button when multiple charts exist in this response */}
        {!isStreaming && detectedItems.length > 1 && (
          <div className="chart-action-overlay absolute top-5 right-4 sm:top-6 sm:right-6 z-30 flex items-center rounded-lg border border-[#292D49] bg-[#0E1222]/95 p-1 shadow-2xl backdrop-blur-md transition-all hover:border-[#7564F6]">
            <div className="relative group/shareall">
              <button
                type="button"
                onClick={handleShareAll}
                disabled={sharingAll}
                className="flex items-center justify-center rounded-md p-1.5 text-xs font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50 !bg-transparent"
                aria-label="Share all charts in this Single response"
              >
                {sharingAll ? (
                  <Loader2 className="h-[19px] w-[19px] sm:h-5 sm:w-5 animate-spin text-[#7564F6] shrink-0" />
                ) : (
                  <Share2 className="h-[19px] w-[19px] sm:h-5 sm:w-5 text-slate-400 group-hover/shareall:text-white transition-colors shrink-0" />
                )}
              </button>

              {/* Tooltip: "Share all charts in this Single response" */}
              <div className="pointer-events-none absolute top-full right-0 mt-2 hidden group-hover/shareall:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                Share all charts in this Single response
                <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-[#181B34]" />
              </div>
            </div>
          </div>
        )}

        <div
          suppressHydrationWarning
          className="space-y-3"
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
                  {/* Download Dropdown */}
                  <div className={"relative group/dl"}>
                    <button
                      type="button"
                      onClick={() => setActiveDropdownId(activeDropdownId === target.id ? null : target.id)}
                      disabled={exportingId === target.id}
                      className={"flex items-center gap-1 sm:gap-1.5 rounded-md p-1.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"}
                      aria-label="Download Chart"
                    >
                      {exportingId === target.id ? (
                        <Loader2 className={"h-[19px] w-[19px] sm:h-5 sm:w-5 animate-spin text-[#7564F6] shrink-0"} />
                      ) : (
                        <Download className={"h-[19px] w-[19px] sm:h-5 sm:w-5 text-slate-400 group-hover/dl:text-white transition-colors shrink-0"} />
                      )}
                      <span className="hidden xs:inline">Download</span>
                    </button>

                    {/* Tooltip: Download Chart (hidden if dropdown is open) - aligned to right edge so it never overflows */}
                    {activeDropdownId !== target.id && (
                      <div className="pointer-events-none absolute top-full right-0 mt-2 hidden group-hover/dl:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                        Download Chart
                        <div className="absolute bottom-full right-3 -mb-px border-4 border-transparent border-b-[#181B34]" />
                      </div>
                    )}

                    {activeDropdownId === target.id && (
                      <div className={"absolute right-0 top-full mt-1.5 w-36 sm:w-40 rounded-xl border border-[#292D49] bg-[#0E1222] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"}>
                        <button
                          type="button"
                          onClick={() => handleDownloadPNG(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <ImageIcon className={"h-4 w-4 text-[#A78BFA] shrink-0"} />
                          <span>PNG Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <FileText className={"h-4 w-4 text-[#F43F5E] shrink-0"} />
                          <span>PDF Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPPT(target)}
                          className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-[#6C56E5]/20 hover:text-white transition cursor-pointer"}
                        >
                          <Presentation className={"h-4 w-4 text-[#F97316] shrink-0"} />
                          <span>PPT (Slide)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={"h-4 w-px bg-[#292D49] shrink-0"} />

                  {/* Share Button */}
                  <div className="relative group/share">
                    <button
                      type="button"
                      onClick={() => handleShare(target)}
                      disabled={sharingId === target.id}
                      className={"flex items-center gap-1 sm:gap-1.5 rounded-md p-1.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"}
                      aria-label="Share Chart"
                    >
                      {sharingId === target.id ? (
                        <Loader2 className={"h-[19px] w-[19px] sm:h-5 sm:w-5 animate-spin text-[#7564F6] shrink-0"} />
                      ) : (
                        <Share2 className={"h-[19px] w-[19px] sm:h-5 sm:w-5 text-slate-400 group-hover/share:text-white transition-colors shrink-0"} />
                      )}
                      <span className="hidden xs:inline">Share</span>
                    </button>
                    {/* Tooltip: Share Chart - displays downward */}
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/share:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      Share Chart
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-[#181B34]" />
                    </div>
                  </div>

                  <div className={"h-4 w-px bg-[#292D49] shrink-0"} />

                  {/* Full View Button */}
                  <div className="relative group/fv">
                    <button
                      type="button"
                      onClick={() => handleOpenFullView(target)}
                      className={"flex items-center gap-1 sm:gap-1.5 rounded-md p-1.5 sm:px-2 sm:py-1 text-[10px] sm:text-[11px] font-medium text-slate-300 transition hover:bg-[#7564F6]/20 hover:text-white cursor-pointer active:scale-95"}
                      aria-label="Full View"
                    >
                      <Maximize2 className={"h-[19px] w-[19px] sm:h-5 sm:w-5 text-slate-400 group-hover/fv:text-white transition-colors shrink-0"} />
                      <span className="hidden xs:inline">Full View</span>
                    </button>
                    {/* Tooltip: displays downward to avoid being clipped by top boundary */}
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/fv:flex items-center whitespace-nowrap rounded-md bg-[#181B34] border border-[#292D49] px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      Full View
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-[#181B34]" />
                    </div>
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

      {/* Lightbox Popup */}
      {lightboxTarget && (() => {
        const light = isLightMode(lightboxTarget.element);
        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
            onClick={handleCloseLightbox}
          >
            <div
              className={`relative flex flex-col max-h-[96vh] w-[96vw] max-w-7xl lg:max-w-[1440px] rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
                light
                  ? "border-slate-200 bg-white text-slate-900"
                  : "border-[#292D49] bg-[#0E1222] text-white"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header with Title, Download, Share, and Close */}
              <div
                className={`flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-3.5 ${
                  light
                    ? "border-slate-200 bg-slate-50/95 text-slate-800"
                    : "border-[#1E223D] bg-[#070914]/90 text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <Sparkles className="h-4 w-4 text-[#7564F6] shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold truncate">
                    {lightboxTarget.title || "Full View"}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Download Dropdown inside Popup */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLightboxDropdownOpen(!lightboxDropdownOpen)}
                      disabled={exportingId === lightboxTarget.id}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                        light
                          ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm"
                          : "border-[#292D49] bg-[#14182E] text-slate-200 hover:bg-[#7564F6]/20 hover:border-[#7564F6] hover:text-white shadow-md"
                      }`}
                      aria-label="Download Chart"
                      title="Download Chart"
                    >
                      {exportingId === lightboxTarget.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#7564F6] shrink-0" />
                      ) : (
                        <Download className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
                      )}
                      <span className="hidden sm:inline">Download</span>
                    </button>

                    {lightboxDropdownOpen && (
                      <div
                        className={`absolute right-0 top-full mt-1.5 w-40 rounded-xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 ${
                          light
                            ? "border-slate-200 bg-white text-slate-800 shadow-slate-300/50"
                            : "border-[#292D49] bg-[#0E1222] text-slate-200 shadow-black/80"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxDropdownOpen(false);
                            handleDownloadPNG(lightboxTarget);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                            light
                              ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                              : "hover:bg-[#6C56E5]/20 text-slate-200 hover:text-white"
                          }`}
                        >
                          <ImageIcon className="h-4 w-4 text-[#A78BFA] shrink-0" />
                          <span>PNG Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxDropdownOpen(false);
                            handleDownloadPDF(lightboxTarget);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                            light
                              ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                              : "hover:bg-[#6C56E5]/20 text-slate-200 hover:text-white"
                          }`}
                        >
                          <FileText className="h-4 w-4 text-[#F43F5E] shrink-0" />
                          <span>PDF Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxDropdownOpen(false);
                            handleDownloadPPT(lightboxTarget);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                            light
                              ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                              : "hover:bg-[#6C56E5]/20 text-slate-200 hover:text-white"
                          }`}
                        >
                          <Presentation className="h-4 w-4 text-[#F97316] shrink-0" />
                          <span>PPT (Slide)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Share Button inside Popup */}
                  <button
                    type="button"
                    onClick={() => handleShare(lightboxTarget)}
                    disabled={sharingId === lightboxTarget.id}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                      light
                        ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm"
                        : "border-[#292D49] bg-[#14182E] text-slate-200 hover:bg-[#7564F6]/20 hover:border-[#7564F6] hover:text-white shadow-md"
                    }`}
                    aria-label="Share Chart"
                    title="Share Chart"
                  >
                    {sharingId === lightboxTarget.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#7564F6] shrink-0" />
                    ) : (
                      <Share2 className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <div className={`h-5 w-px mx-1 ${light ? "bg-slate-300" : "bg-[#292D49]"}`} />

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleCloseLightbox}
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

              {/* Lightbox Body / Content - Scaled large on desktop */}
              <div
                className={`flex-1 overflow-auto p-3 sm:p-6 md:p-8 flex items-center justify-center min-h-[350px] ${
                  light ? "bg-slate-50/50" : "bg-[#070914]"
                }`}
              >
                {lightboxLoading ? (
                  <div
                    className={`flex flex-col items-center gap-3 py-16 ${
                      light ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-[#7564F6]" />
                    <span className="text-sm font-medium">Generating high-resolution view...</span>
                  </div>
                ) : lightboxImageSrc ? (
                  <img
                    src={lightboxImageSrc}
                    alt={lightboxTarget.title || "Full View Chart"}
                    className={`max-h-[85vh] w-auto max-w-full rounded-xl object-contain border shadow-2xl transition-all ${
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

    </div>
  );
};
