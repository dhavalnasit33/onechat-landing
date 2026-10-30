"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  handleRegistrationCTA,
  RegistrationCTAInput,
} from "../lib/attribution";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import apiService from "@/lib/apiService";

interface ImageTemplateItem {
  id: string;
  promt: string;
  image: string;
  category?: string;
  ratio?: number;
}

interface InteractiveImageTemplatesSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
  paused?: boolean;
}

interface CardState {
  faces: [number, number | null]; // pool indexes for the two sides of the card
  flips: number; // total flips so far. even => side 0 is in front, odd => side 1
  ready: boolean; // hidden side has fully loaded
  busy: boolean; // flipping or loading the hidden side
  lastFlip: number;
  history: number[]; // recent pool indexes so a card does not repeat soon
}

interface ApiImagePrompt {
  _id: string;
  image: string;
  image_prompt: string;
  style?: {
    _id: string;
    name: string;
  };
  is_active: boolean;
}

interface ImagePromptsResponse {
  success: boolean;
  data: ApiImagePrompt[];
}

const CONFIG = {
  slots: 15,
  flipsPerTick: 3,
  tickMs: 1000,
  reducedTickMs: 5000,
  flipMs: 700,
  settleMs: 250,
  restMs: 1000,
  startDelayMs: 1400,
  visibleThreshold: 0.15, // part of card that must be on screen to flip
  ratioTolerance: 0.25, // how different the next image shape may be
  historySize: 4,
};

const AI_image_MODELS = [
  { name: "Nano Banana 2", icon: "/assets/landing-page/section-2-gemini.png" },
  { name: "ChatGPT Image", icon: "/assets/landing-page/section-2-chatgpt.png" },
  { name: "Flux", icon: "/assets/landing-page/section-2-flux.png" },
  {
    name: "Stable Diffusion",
    icon: "/assets/landing-page/section-2-stable-diffusion.png",
  },
  { name: "Ideogram", icon: "/assets/landing-page/section-2-ideogram.png" },
  { name: "Recraft", icon: "/assets/landing-page/section-2-recraft.png" },
  { name: "Seedream", icon: "/assets/landing-page/section-2-seedream.png" },
  { name: "Qwen", icon: "/assets/landing-page/section-2-qwen.png" },
  { name: "Kling", icon: "/assets/landing-page/section-2-kling.png" },
];

const STYLES = `
.ift-root { --ift-r: 14px; }
@media (max-width: 699px) { .ift-root { --ift-r: 12px; } }

@keyframes ift-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.ift-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #141724 0%, #262c40 50%, #141724 100%);
  animation: ift-shimmer 1.5s infinite;
}
@keyframes ift-shade { 0% { opacity: 0 } 50% { opacity: .6 } 100% { opacity: 0 } }
@keyframes ift-sheen {
  0%   { transform: translateX(-130%) skewX(-18deg); opacity: 0 }
  25%  { opacity: 1 }
  100% { transform: translateX(260%) skewX(-18deg); opacity: 0 }
}
.ift-shade { animation: ift-shade ${CONFIG.flipMs}ms ease-in-out both; }
.ift-sheen {
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
  animation: ift-sheen 800ms ease-out ${CONFIG.flipMs - 50}ms both;
}

.ift-overlay { opacity: 0; pointer-events: none; transition: opacity .3s ease; }
.ift-card[data-active="true"] .ift-overlay,
.ift-card:focus-visible .ift-overlay,
.ift-card:focus-within .ift-overlay { opacity: 1; pointer-events: auto; }
.ift-card[data-active="true"] .ift-ring,
.ift-card:focus-visible .ift-ring { border-color: #7c3aed; box-shadow: 0 0 14px rgba(124,58,237,.35); }
@media (hover: hover) {
  .ift-card:hover .ift-overlay { opacity: 1; pointer-events: auto; }
  .ift-card:hover .ift-ring { border-color: #7c3aed; box-shadow: 0 0 14px rgba(124,58,237,.35); }
}
@media (max-width: 699px) { .ift-card[data-active="true"] .ift-label { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .ift-inner { transition: none !important; }
  .ift-shade, .ift-sheen { display: none; }
}
`;

type LoadStatus = "loading" | "ready" | "error";

function useImagePrompts() {
  const [pool, setPool] = useState<ImageTemplateItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function fetchImagePrompts() {
      try {
        const response = await apiService<ImagePromptsResponse>(
          "/image-prompts/list",
          {
            params: {
              page: 1,
              limit: 40,
            },
          },
        );

        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Invalid image prompts API response");
        }

        const items: ImageTemplateItem[] = response.data
          .filter(
            (item) =>
              item.is_active &&
              typeof item.image === "string" &&
              typeof item.image_prompt === "string",
          )
          .map((item) => ({
            id: item._id,
            image: item.image,
            promt: item.image_prompt,
            category: item.style?.name ?? "AI Image",
          }));

        if (!items.length) {
          throw new Error("No active image prompts found");
        }

        if (cancelled) return;

        setPool(items);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to fetch image prompts:", error);

        if (!cancelled) {
          setPool([]);
          setStatus("error");
        }
      }
    }

    fetchImagePrompts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { pool, status };
}

/** Masonry: put each card in the currently shortest column. Returns slot indexes per column. */
function distribute(ratios: number[], colCount: number): number[][] {
  const cols = Array.from({ length: colCount }, () => ({
    h: 0,
    items: [] as number[],
  }));
  ratios.forEach((r, i) => {
    const target = cols.reduce((a, b) => (b.h < a.h ? b : a));
    target.items.push(i);
    target.h += 1 / r;
  });
  return cols.map((c) => c.items);
}

function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#141724] z-10 transition-opacity duration-300 pointer-events-none">
      <div className="ift-shimmer" />
    </div>
  );
}

function UnusedSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#070b1e] z-10 transition-opacity duration-300">
      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/15 border-t-[#A855F7] rounded-full animate-spin" />
    </div>
  );
}

/** One image with its own loading spinner. */
function FaceImage({ src, priority }: { src: string; priority: boolean }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIsReady(false);
    setFailed(false);
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setIsReady(true); // already cached
  }, [src]);

  return (
    <>
      {!isReady && !failed && <ShimmerOverlay />}
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsReady(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full select-none object-cover transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

const SKELETON_RATIOS = Array.from(
  { length: 15 },
  (_, i) => 1.0 / (i % 3 === 0 ? 1.8 : i % 3 === 1 ? 1.3 : 1.0),
);

function SkeletonGrid({ colCount, gap }: { colCount: number; gap: number }) {
  const cols = distribute(SKELETON_RATIOS, colCount);
  return (
    <div className="flex items-start w-full overflow-hidden" style={{ gap }}>
      {cols.map((items, ci) => (
        <div key={ci} className="flex min-w-0 flex-1 flex-col" style={{ gap }}>
          {items.map((i) => (
            <div
              key={i}
              className="relative w-full overflow-hidden rounded-[var(--ift-r)] border border-white/10 bg-[#030614]"
              style={{ aspectRatio: SKELETON_RATIOS[i] }}
            >
              <ShimmerOverlay />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function useColumnCount() {
  const [n, setN] = useState(5);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setN(w >= 1100 ? 5 : w >= 700 ? 3 : 2);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return n;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickNext(
  slot: number,
  cards: CardState[],
  pool: ImageTemplateItem[],
  baseRatio: number,
): number {
  // Collect all images currently visible OR already reserved on any hidden side
  const inUse = new Set<number>();
  cards.forEach((c) => {
    c.faces.forEach((f) => {
      if (f !== null) inUse.add(f);
    });
  });

  const me = cards[slot];
  const current = me.faces[me.flips % 2];
  const recent = me.history;
  const diff = (i: number) =>
    Math.abs((pool[i].ratio ?? 0.8) - baseRatio) / baseRatio;

  // Strict tiers: Never pick an image that is already on screen or reserved
  const tiers: Array<(i: number) => boolean> = [
    (i) => !inUse.has(i) && !recent.includes(i),
    (i) => !inUse.has(i),
    (i) => i !== current && !recent.includes(i),
    (i) => i !== current,
  ];

  const indexes = pool.map((_, i) => i);
  for (const ok of tiers) {
    const list = indexes.filter(ok);
    if (!list.length) continue;
    const close = list.filter((i) => diff(i) <= CONFIG.ratioTolerance);
    const base = close.length
      ? close
      : list.sort((a, b) => diff(a) - diff(b)).slice(0, 3);
    return base[Math.floor(Math.random() * base.length)];
  }
  return current ?? 0;
}

interface FlipCardProps {
  slot: number;
  ratio: number;
  card: CardState;
  pool: ImageTemplateItem[];
  active: boolean;
  priority: boolean;
  onVisible: (slot: number, enough: boolean, any: boolean) => void;
  onHover: (slot: number, on: boolean) => void;
  onSelect: (item: ImageTemplateItem) => void;
  onActivate: (slot: number | null) => void;
}

const FlipCard = React.memo(function FlipCard({
  slot,
  ratio,
  card,
  pool,
  active,
  priority,
  onVisible,
  onHover,
  onSelect,
  onActivate,
}: FlipCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        onVisible(
          slot,
          e.isIntersecting,
          e.isIntersecting,
        );
      },
      { threshold: [0, 0.1, CONFIG.visibleThreshold, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      onVisible(slot, false, false);
    };
  }, [slot, onVisible]);

  const shownIdx = card.faces[card.flips % 2] ?? slot;
  const sample = pool[shownIdx];
  const faceStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  const isTouch = () => window.matchMedia("(hover: none)").matches;

  return (
    <div
      ref={ref}
      data-ift-slot={slot}
      data-active={active}
      role="button"
      tabIndex={0}
      aria-label={`${sample.category ?? "AI image"} sample. ${sample.promt}. Open to create your own.`}
      className="ift-card group relative w-full cursor-pointer outline-none"
      style={{ aspectRatio: ratio, perspective: 1200 }}
      onMouseEnter={() => onHover(slot, true)}
      onMouseLeave={() => onHover(slot, false)}
      onFocus={() => onHover(slot, true)}
      onBlur={() => onHover(slot, false)}
      onClick={() => {
        if (isTouch() && !active) {
          onActivate(slot);
          return;
        }
        onSelect(sample);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(sample);
        }
      }}
    >
      <div
        className="ift-inner absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${card.flips * 180}deg)`,
          transition: `transform ${CONFIG.flipMs}ms cubic-bezier(0.45, 0.05, 0.25, 1)`,
        }}
      >
        {[0, 1].map((side) => {
          const idx = card.faces[side];
          return (
            <div
              key={side}
              className="absolute inset-0 overflow-hidden rounded-[var(--ift-r)] bg-[#0b0d1f]"
              style={{
                ...faceStyle,
                transform: side === 1 ? "rotateY(180deg)" : undefined,
              }}
            >
              {idx !== null && (
                <FaceImage src={pool[idx].image} priority={priority} />
              )}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[var(--ift-r)]">
        {card.flips > 0 && (
          <div
            key={`shade-${card.flips}`}
            className="ift-shade absolute inset-0 bg-black"
          />
        )}
        {card.flips > 0 && (
          <div
            key={`sheen-${card.flips}`}
            className="ift-sheen absolute inset-y-0 left-0"
          />
        )}
      </div>

      <span className="ift-label pointer-events-none absolute left-2.5 top-2.5 z-20 max-w-[85%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[15px] font-semibold text-white backdrop-blur-sm transition-opacity">
        {sample.category}
      </span>

      <div className="ift-overlay absolute inset-x-0 bottom-0 z-20 rounded-b-[var(--ift-r)] bg-gradient-to-t from-black/95 via-black/75 to-transparent p-3 pt-14 sm:p-4 sm:pt-16">
        <p className="line-clamp-4 font-mono text-[10px] leading-snug text-white/90 sm:text-[12px]">
          {sample.promt}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(sample);
            onActivate(null);
          }}
          className="mt-2.5 w-full rounded-lg bg-gradient-to-r from-[#6366F1] to-[#A855F7] px-3 py-2 text-[11px] font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:brightness-110 sm:mt-3 sm:text-[13px] flex gap-1.5 justify-center items-center cursor-pointer select-none"
        >
          Create this
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="ift-ring pointer-events-none absolute inset-0 z-30 rounded-[var(--ift-r)] border border-white/10 transition-all duration-300" />
    </div>
  );
});

function ImageTemplatesGallery({
  pool,
  status,
  onOpenAuth,
  onCTA,
  paused = false,
}: InteractiveImageTemplatesSectionProps & {
  pool: ImageTemplateItem[];
  status: LoadStatus;
}) {
  const slotCount = Math.min(CONFIG.slots, pool.length);
  const baseRatios = useMemo(
    () =>
      Array.from({ length: slotCount }, (_, index) => {
        const mod = index % 3;

        const heightFactor = mod === 0 ? 1.3 : mod === 1 ? 1.1 : 0.8;
        return 0.8 / heightFactor;
      }),
    [slotCount],
  );
  const [mounted, setMounted] = useState(false);
  const colCount = useColumnCount();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [cards, setCards] = useState<CardState[]>(() =>
    Array.from({ length: slotCount }, (_, i) => ({
      faces: [i < pool.length ? i : i % Math.max(1, pool.length), null] as [
        number,
        number | null,
      ],
      flips: 0,
      ready: false,
      busy: true,
      lastFlip: 0,
      history: [i],
    })),
  );

  const cardsRef = useRef(cards);
  const visibleRef = useRef(new Set<number>());
  const hoverRef = useRef(new Set<number>());
  const startedRef = useRef(new Set<number>());
  const lastBatchRef = useRef<number[]>([]);
  const activeRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const aliveRef = useRef(true);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    aliveRef.current = true;
    setMounted(true);
    const timers = timersRef.current;
    return () => {
      aliveRef.current = false;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timersRef.current.delete(t);
      if (aliveRef.current) fn();
    }, ms);
    timersRef.current.add(t);
  }, []);

  const update = useCallback(
    (slot: number, fn: (c: CardState) => CardState) => {
      const next = cardsRef.current.slice();
      next[slot] = fn(next[slot]);
      cardsRef.current = next;
      setCards(next);
    },
    [],
  );

  const loadHidden: (slot: number, attempt?: number) => void = useCallback(
    (slot, attempt = 0) => {
      if (!aliveRef.current) return;
      const idx = pickNext(slot, cardsRef.current, pool, baseRatios[slot]);
      
      // Reserve the index immediately on the hidden side so other cards won't pick it
      update(slot, (c) => {
        const side = c.flips % 2 === 0 ? 1 : 0;
        const faces: [number, number | null] = [c.faces[0], c.faces[1]];
        faces[side] = idx;
        return {
          ...c,
          faces,
          ready: false,
          busy: true,
        };
      });

      const im = new window.Image();
      im.onload = () => {
        if (!aliveRef.current) return;
        update(slot, (c) => ({
          ...c,
          ready: true,
          busy: false,
          history: [...c.history, idx].slice(-CONFIG.historySize),
        }));
      };
      im.onerror = () => {
        if (attempt < 3) {
          loadHidden(slot, attempt + 1);
        } else {
          update(slot, (c) => ({ ...c, busy: false, ready: false }));
        }
      };
      im.src = pool[idx].image;
    },
    [pool, baseRatios, update],
  );

  const flip = useCallback(
    (slot: number) => {
      update(slot, (c) => ({
        ...c,
        flips: c.flips + 1,
        ready: false,
        busy: true,
        lastFlip: Date.now(),
      }));
      later(() => loadHidden(slot), CONFIG.flipMs + CONFIG.settleMs);
    },
    [update, later, loadHidden],
  );

  const onVisible = useCallback(
    (slot: number, enough: boolean, any: boolean) => {
      if (enough) visibleRef.current.add(slot);
      else visibleRef.current.delete(slot);
      if (any && !startedRef.current.has(slot)) {
        startedRef.current.add(slot);
        loadHidden(slot);
      }
    },
    [loadHidden],
  );

  const onHover = useCallback((slot: number, on: boolean) => {
    if (on) hoverRef.current.add(slot);
    else if (activeRef.current !== slot) hoverRef.current.delete(slot);
  }, []);

  const onActivate = useCallback((slot: number | null) => {
    const prev = activeRef.current;
    if (prev !== null) hoverRef.current.delete(prev);
    activeRef.current = slot;
    if (slot !== null) hoverRef.current.add(slot);
    setActiveSlot(slot);
  }, []);

  const onSelect = useCallback(
    (item: ImageTemplateItem) => {
      const attributionInput: RegistrationCTAInput = {
        cta_id: "image_templates",
        cta_label: "Image Templates",
        section_id: "image_templates_showcase",
        section_label: "Interactive Image Templates Gallery",
        item_id: item.id,
        item_label: item.category ?? item.id,
      };

      if (onCTA) {
        onCTA(attributionInput);
      } else {
        handleRegistrationCTA(attributionInput, onOpenAuth);
      }
    },
    [onCTA, onOpenAuth],
  );

  useEffect(() => {
    const h = (e: PointerEvent) => {
      if (activeRef.current === null) return;
      const el = (e.target as Element | null)?.closest?.("[data-ift-slot]");
      if (!el || Number(el.getAttribute("data-ift-slot")) !== activeRef.current)
        onActivate(null);
    };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [onActivate]);

  useEffect(() => {
    if (!mounted) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tickMs = reduce ? CONFIG.reducedTickMs : CONFIG.tickMs;
    let interval: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      if (pausedRef.current || document.hidden) return;
      const now = Date.now();
      const eligible: number[] = [];
      const retry: number[] = [];
      cardsRef.current.forEach((c, i) => {
        if (!visibleRef.current.has(i)) return;
        if (!c.ready && !c.busy) retry.push(i);
        else if (
          c.ready &&
          !c.busy &&
          !hoverRef.current.has(i) &&
          now - c.lastFlip >= CONFIG.restMs &&
          !lastBatchRef.current.includes(i)
        )
          eligible.push(i);
      });
      retry.forEach((i) => {
        update(i, (c) => ({ ...c, busy: true }));
        loadHidden(i);
      });
      const picked = shuffle(eligible).slice(0, CONFIG.flipsPerTick);
      lastBatchRef.current = picked;
      picked.forEach(flip);
    };

    const start = setTimeout(() => {
      interval = setInterval(tick, tickMs);
    }, CONFIG.startDelayMs);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [mounted, flip, loadHidden, update]);

  const columns = useMemo(
    () => distribute(baseRatios, colCount),
    [colCount, baseRatios],
  );

  const gap = colCount === 2 ? 10 : 16;

  return (
    <section className="ift-root relative w-full overflow-hidden bg-[#04050f] px-4 py-12 text-white sm:px-6 sm:py-20">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="mx-auto max-w-[1440px] w-full overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] max-w-full h-[350px] rounded-full bg-gradient-to-r from-[#007BFF]/15 via-[#713BFF]/15 to-[#E54BFF]/15 blur-[100px] pointer-events-none" />

        {/* title description */}
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 relative z-10">
          <div className="text-center max-w-[950px] mx-auto mb-10 flex flex-col items-center">
            <h2 className="mt-5 font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] lg:whitespace-nowrap">
              Generate Amazing{" "}
              <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
                AI Images
              </span>{" "}
            </h2>
            <p className="mt-4 font-sans text-[14px] md:text-[16px] text-slate-400 max-w-[700px] leading-relaxed">
              Create stunning images with Nano Banana, ChatGPT Image, FLUX,
              Stable Diffusion, Ideogram, Recraft, Seedream, Qwen, Kling, and
              more — all in one place.
            </p>
          </div>
        </div>

        {/* image model row */}
        <div className="flex justify-center mb-10 md:mb-14 w-full">
          <div className="w-full max-w-[1180px] px-2 py-2">
            {/* Mobile: 2 lines (5 items on 1st line, 4 items on 2nd line) */}
            <div className="flex flex-col items-center gap-3.5 md:hidden">
              <div className="grid grid-cols-5 gap-2 w-full justify-items-center">
                {AI_image_MODELS.slice(0, 5).map((model) => (
                  <div
                    key={model.name}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer transition-transform hover:scale-105 w-full max-w-[64px]"
                  >
                    <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-[14px] bg-[#0A0D1E] border border-white/10 p-2 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#A855F7]/60 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                      <Image
                        src={model.icon}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="object-contain filter group-hover:brightness-110 w-full h-full"
                        unoptimized
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition-colors text-center leading-tight line-clamp-2">
                      {model.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                {AI_image_MODELS.slice(5).map((model) => (
                  <div
                    key={model.name}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer transition-transform hover:scale-105 w-[60px]"
                  >
                    <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-[14px] bg-[#0A0D1E] border border-white/10 p-2 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#A855F7]/60 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                      <Image
                        src={model.icon}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="object-contain filter group-hover:brightness-110 w-full h-full"
                        unoptimized
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition-colors text-center leading-tight line-clamp-2">
                      {model.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop / Tablet */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-4 lg:gap-6">
              {AI_image_MODELS.map((model) => (
                <div
                  key={model.name}
                  className="flex flex-col items-center gap-2.5 sm:gap-3 group cursor-pointer transition-transform hover:scale-105"
                >
                  <div className="w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] rounded-[18px] sm:rounded-[22px] bg-[#0A0D1E] border border-white/10 p-3 sm:p-3.5 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#A855F7]/60 shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_24px_rgba(147,51,234,0.35)]">
                    <Image
                      src={model.icon}
                      alt={model.name}
                      width={44}
                      height={44}
                      className="object-contain filter group-hover:brightness-110 w-full h-full"
                      unoptimized
                    />
                  </div>
                  <span className="text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors">
                    {model.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Masonry flip gallery */}
        <div
          className="mt-8 sm:mt-12 w-full overflow-hidden"
          style={{
            minHeight: !mounted || status === "loading" ? 600 : undefined,
          }}
        >
          {mounted && status === "loading" && (
            <SkeletonGrid colCount={colCount} gap={gap} />
          )}
          {mounted && pool.length > 0 && (
            <div
              className="flex items-start w-full overflow-hidden"
              style={{ gap }}
            >
              {columns.map((slots, ci) => (
                <div
                  key={ci}
                  className="flex min-w-0 flex-1 flex-col"
                  style={{ gap }}
                >
                  {slots.map((slot) => (
                    <FlipCard
                      key={slot}
                      slot={slot}
                      ratio={baseRatios[slot]}
                      card={cards[slot]}
                      pool={pool}
                      active={activeSlot === slot}
                      priority={slot < 8}
                      onVisible={onVisible}
                      onHover={onHover}
                      onSelect={onSelect}
                      onActivate={onActivate}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function InteractiveImageTemplatesSection(
  props: InteractiveImageTemplatesSectionProps,
) {
  const { pool, status } = useImagePrompts();
  return (
    <ImageTemplatesGallery
      key={pool.length}
      pool={pool}
      status={status}
      {...props}
    />
  );
}

export { InteractiveImageTemplatesSection, AI_image_MODELS };
