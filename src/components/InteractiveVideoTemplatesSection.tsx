"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface VideoTemplateItem {
  id: string;
  title: string;
  desc: string;
  video: string;
  category: "most-popular" | "photo-experiences" | "products-ecommerce" | "youtube-creators";
}

interface InteractiveVideoTemplatesSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
}

// Individual Template Card with Lazy Loading, Poster fallback, Spinner, and Responsive Mobile handling
// Individual Template Card with Lazy Loading, Poster fallback, Spinner, and Responsive Mobile handling
function VideoTemplateCard({
  template,
  onClick,
}: {
  template: VideoTemplateItem;
  onClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use generous margin (600px) so videos load smoothly BEFORE user scrolls to them
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasStartedLoading(true);
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          } else {
            // When scrolled far away, pause to save mobile memory/battery
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        rootMargin: "600px 0px",
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      // AHIA CHANGE: hover shadow no glow occho kari ne border crisp kari che
     className="group relative w-full aspect-[4/5] rounded-[14px] sm:rounded-[18px] overflow-hidden bg-[#030614] border-2 border-white/10 hover:border-2 hover:border-[#7C3AED] hover:shadow-[0_0_12px_rgba(124,58,237,0.3)] cursor-pointer transition-all duration-300 flex flex-col hover:scale-[1.02]"
    >
      {/* Loading Spinner */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#070b1e] z-10 transition-opacity duration-300">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/15 border-t-[#A855F7] rounded-full animate-spin" />
        </div>
      )}

      {/* Video Element */}
      {hasStartedLoading ? (
        <video
          ref={videoRef}
          src={template.video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsReady(true)}
          onCanPlay={() => setIsReady(true)}
          onPlaying={() => setIsReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-[#070b1e]" />
      )}

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* AHIA CHANGE: Badge 2nd image jevu (Rectangle box, solid color, solid line) */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-[#12141D]/95 border border-white/5 max-w-[85%]">
        <span className="w-1 h-3.5 bg-[#A855F7] rounded-full inline-block shrink-0" />
        <span className="text-[12px] sm:text-[13px] font-bold text-white tracking-wide truncate">
          {template.title}
        </span>
      </div>

      {/* AHIA CHANGE: Description na text mota karya che (text-[12px] sm:text-[14px]) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10 flex flex-col justify-end p-3 sm:p-5 pointer-events-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-[12px] sm:text-[14px] font-medium text-white/95 leading-snug line-clamp-3">
          {template.desc}
        </p>
      </div>
    </div>
  );
}

// 8 Leading AI Video Model Logos
const AI_VIDEO_MODELS = [
  { name: "Veo", icon: "/assets/landing-page/section-2-gemini.png" },
  { name: "PixVerse", icon: "/assets/landing-page/section-2-pix-verse.png" },
  { name: "Seedance", icon: "/assets/landing-page/section-2-seedream.png" }, // Or your actual seedance logo path
  { name: "Runway", icon: "/assets/landing-page/section-2-runway.png" },
  { name: "Kling", icon: "/assets/landing-page/section-2-kling.png" },
  { name: "Pika", icon: "/assets/landing-page/section-2-pika.png" },
  { name: "MiniMax", icon: "/assets/landing-page/section-2-minimax.png" },
  { name: "Wan", icon: "/assets/landing-page/section-2-qwen.png" }, // Update Wan logo path if needed
];

const CATEGORIES = [
  { id: "most-popular", label: "Most Popular" },
  { id: "photo-experiences", label: "Photo Experiences" },
  { id: "products-ecommerce", label: "Products & E-Commerce" },
  { id: "youtube-creators", label: "YouTube & Creators" },
] as const;

// All videos categorized as per user input, without poster images
const TEMPLATES_DATA: VideoTemplateItem[] = [
  // ==========================================
  // 1. Most Popular
  // ==========================================
  {
    id: "talking-pets",
    title: "Talking Pets",
    desc: "Talking pet video animation. Looks directly into the camera with expressive eyes and cheerful facial expressions.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/talking-pets.mp4",
    category: "most-popular",
  },
  {
    id: "pet-superhero",
    title: "Pet Superhero",
    desc: "Turn your pet into an epic superhero with extraordinary powers, a heroic costume, and cinematic visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/pet-superhero.mp4",
    category: "most-popular",
  },
  {
    id: "pet-movie-star",
    title: "Pet Movie Star",
    desc: "Turn your pet into the star of their own movie with cinematic scenes, dramatic camera work.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/pet-movie-star.mp4",
    category: "most-popular",
  },
  {
    id: "youtube-intro",
    title: "YouTube Intro",
    desc: "Create a polished, attention-grabbing YouTube intro that introduces your channel or video with your branding.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/youtube-intro.mp4",
    category: "most-popular",
  },
  {
    id: "youtube-outro",
    title: "YouTube Outro",
    desc: "Create a polished YouTube outro that ends your video with your branding, channel name, calls to action.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/youtube-outro.mp4",
    category: "most-popular",
  },
  {
    id: "channel-logo-reveal",
    title: "Channel Logo Reveal",
    desc: "Turn your channel logo into a polished animated reveal with dynamic motion, visual effects.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/channel-logo-reveal.mp4",
    category: "most-popular",
  },
  {
    id: "faceless-video",
    title: "Faceless Video",
    desc: "Turn a topic, idea, or script into a complete faceless video with engaging visuals, AI voiceover.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-video.mp4",
    category: "most-popular",
  },
  {
    id: "faceless-story-video",
    title: "Faceless Story Video",
    desc: "Turn a story, idea, or plot into an engaging faceless video with AI-generated characters and scenes, cinematic visuals, narration.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-story-video.mp4",
    category: "most-popular",
  },
  {
    id: "news-style-video",
    title: "News-Style Video",
    desc: "Turn a topic or update into a polished news-style video with professional narration and headlines.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/news-style-video.mp4",
    category: "most-popular",
  },
  {
    id: "creator-promo",
    title: "Creator Promo",
    desc: "Create a professional promotional video for your personal brand, channel, or creator business.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/creator-promo.mp4",
    category: "most-popular",
  },
  {
    id: "channel-trailer",
    title: "Channel Trailer",
    desc: "Create an engaging trailer that introduces your YouTube channel, showcases what your content is about.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/channel-trailer.mp4",
    category: "most-popular",
  },
  {
    id: "personal-brand-intro",
    title: "Personal Brand Intro",
    desc: "Create a polished introduction for your personal brand that showcases who you are and what you do.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/personal-brand-intro.mp4",
    category: "most-popular",
  },
  {
    id: "step-into-ancient-rome",
    title: "Step into Ancient Rome",
    desc: "Cinematic epic ancient Roman film scene. A warrior or senator in classic Roman armor walking through the lively Roman Forum.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-ancient-rome.mp4",
    category: "most-popular",
  },
  {
    id: "step-into-medieval-europe",
    title: "Step into Medieval Europe",
    desc: "Cinematic medieval drama scene. A knight in polished plate armor riding or walking across a stone drawbridge.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-medieval-europe.mp4",
    category: "most-popular",
  },
  {
    id: "step-into-the-renaissance",
    title: "Step into the Renaissance",
    desc: "Cinematic Italian Renaissance scene. An artist or noble in velvet attire walking along the picturesque Arno riverbank.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-the-renaissance.mp4",
    category: "most-popular",
  },
  {
    id: "step-into-victorian-london",
    title: "Step into Victorian London",
    desc: "Cinematic 19th-century Victorian scene. A gentleman or lady in authentic Victorian attire walking through cobblestone streets.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-victorian-london.mp4",
    category: "most-popular",
  },

  // ==========================================
  // 2. Photo Experiences
  // ==========================================
  {
    id: "photo-comes-alive",
    title: "Photo Comes Alive",
    desc: "Bring any portrait to life with natural facial expressions, blinking, gentle smiles, and realistic camera motion.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/photo-comes-alive.mp4",
    category: "photo-experiences",
  },
  {
    id: "old-photo-comes-alive",
    title: "Old Photo Comes Alive",
    desc: "Reanimate vintage black & white or sepia memories with authentic emotion, soft head movement, and nostalgic atmosphere.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/old-photo-comes-alive.mp4",
    category: "photo-experiences",
  },
  {
    id: "historical-portrait-comes-alive",
    title: "Historical Portrait Comes Alive",
    desc: "Make paintings and vintage museum portraits speak and move with lifelike eyes, expressions, and posture.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/historical-portrait-comes-alive.mp4",
    category: "photo-experiences",
  },
  {
    id: "vacation-photo-comes-alive",
    title: "Vacation Photo Comes Alive",
    desc: "Turn still holiday snapshots into stunning cinematic videos with swaying palm trees, moving waves, and breeze.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/vacation-photo-comes-alive.mp4",
    category: "photo-experiences",
  },
  {
    id: "yearbook-comes-alive",
    title: "Yearbook Comes Alive",
    desc: "Bring a yearbook photo to life with natural expressions, realistic movement, and nostalgic atmosphere.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/yearbook-comes-alive.mp4",
    category: "photo-experiences",
  },
  {
    id: "hug-my-younger-self",
    title: "Hug My Younger Self",
    desc: "Create an emotional moment where your present-day self meets and hugs your younger self.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/hug-my-younger-self.mp4",
    category: "photo-experiences",
  },
  {
    id: "meet-my-future-self",
    title: "Meet My Future Self",
    desc: "Create an inspiring moment where your present-day self meets a future version of yourself.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/meet-my-future-self.mp4",
    category: "photo-experiences",
  },
  {
    id: "then-vs-now",
    title: "Then vs. Now",
    desc: "Bring two photos from different moments in time together in a nostalgic Then vs. Now video.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/then-vs-now.mp4",
    category: "photo-experiences",
  },
  {
    id: "360-photo-booth",
    title: "360 Photo Booth",
    desc: "Cinematic 360-degree photo booth video animation. A glamorous character at a red carpet event while a high-speed camera rig orbits.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/360-photo-booth.mp4",
    category: "photo-experiences",
  },
  {
    id: "instant-animate",
    title: "Instant Animate",
    desc: "Upload a photo and generate an animation that matches the context - no prompt needed.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/instant-animate.mp4",
    category: "photo-experiences",
  },
  {
    id: "photo-slideshow",
    title: "Photo Slideshow",
    desc: "Cinematic photo slideshow commercial video with smooth pan-and-zoom transitions and elegant light leaks.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/photo-slideshow.mp4",
    category: "photo-experiences",
  },
  {
    id: "zoom-in",
    title: "Zoom In Video",
    desc: "Upload an image to create a forward push‑in shot (dolly in) for a dramatic close‑up feel.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/zoom-in-video.mp4",
    category: "photo-experiences",
  },
  {
    id: "zoom-out",
    title: "Zoom Out Video",
    desc: "Upload an image to generate a smooth pullback shot that reveals more of the scene around your subject.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/zoom-out-video.mp4",
    category: "photo-experiences",
  },
  {
    id: "left-glide",
    title: "Left Glide",
    desc: "Upload an image to generate a leftward lateral camera move (truck left) for a cinematic glide.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/left-glide.mp4",
    category: "photo-experiences",
  },

  // ==========================================
  // 3. Products & E-Commerce
  // ==========================================
  {
    id: "product-showcase",
    title: "Product Showcase",
    desc: "Professional commercial studio display with 360 rotation, dramatic studio lighting, and glossy reflections.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-showcase.mp4",
    category: "products-ecommerce",
  },
  {
    id: "motion-showcase",
    title: "Motion Showcase",
    desc: "Dynamic camera angles with particle burst, floating ingredients, and high-energy product reveals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/motion-product-showcase.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-demo",
    title: "Product Demo",
    desc: "Clean commercial product demonstration video showing practical usage, key benefits, and interaction.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-demo.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-unboxing",
    title: "Product Unboxing",
    desc: "Generate a 10-second vertical unboxing video highlighting the exact product and packaging.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-unboxing-1.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-spin",
    title: "Product Spin Video",
    desc: "Upload a photo of your product and generate a rotating pan shot.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-spin-video.mp4",
    category: "products-ecommerce",
  },
  {
    id: "consistent-character",
    title: "Cinematic Scenario Product Film",
    desc: "Generate a 10-second product film placing the exact hero product in a dramatic environment.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/cinematic-scenario-product-film.mp4",
    category: "products-ecommerce",
  },
  {
    id: "model-in-scene",
    title: "Model In Scene Video",
    desc: "Upload a person and a location, add an action, and generate a vertical video that brings your scene to life.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/model-in-scene-video.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-launch",
    title: "Product Launch",
    desc: "High-energy cinematic product launch commercial highlighting features, sleek motion graphics.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-launch.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-comparison-ad",
    title: "Product Comparison Ad",
    desc: "Create a compelling comparison ad that shows how your product stacks up against another product.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-comparison-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "product-benefits-ad",
    title: "Product Benefits Ad",
    desc: "Create a compelling product ad that clearly showcases your product’s most important benefits.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-benefits-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "before-after-ad",
    title: "Before & After Ad",
    desc: "Show the impact of your product or service with a compelling before-and-after transformation.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/before-after-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "problem-solution-ad",
    title: "Problem → Solution Ad",
    desc: "Turn your product or service into a compelling ad that first shows a relatable customer problem.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/problem-solution-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "limited-time-offer-ad",
    title: "Limited-Time Offer Ad",
    desc: "Create a high-converting promotional ad that highlights a limited-time deal, discount, or special offer.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/limited-time-offer-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "sale-promotion-ad",
    title: "Sale / Promotion Ad",
    desc: "Create an attention-grabbing promotional ad for your sale, discount, special event, or campaign.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/sale-promotion-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "customer-testimonial",
    title: "Customer Testimonial",
    desc: "Turn a real customer review, testimonial, or success story into a polished video ad with an AI presenter.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/customer-testimonial.mp4",
    category: "products-ecommerce",
  },
  {
    id: "brand-story-ad",
    title: "Brand Story Ad",
    desc: "Turn your brand’s story into an emotional, cinematic ad that shows where you started.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/brand-story-ad.mp4",
    category: "products-ecommerce",
  },
  {
    id: "perfume-commercial",
    title: "Luxury Perfume Commercial",
    desc: "Ethereal vapor effects, crystal water ripples, golden hour warmth, and ultra-high-end fashion commercial style.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/perfume-commercial.mp4",
    category: "products-ecommerce",
  },
  {
    id: "luxury-commercial",
    title: "Luxury Commercial",
    desc: "Turn your premium product or brand into an elegant luxury commercial with cinematic product shots.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/luxury-commercial.mp4",
    category: "products-ecommerce",
  },

  // ==========================================
  // 4. YouTube & Creators
  // ==========================================
  {
    id: "youtube-intro-1",
    title: "YouTube Intro",
    desc: "Create a polished, attention-grabbing YouTube intro that introduces your channel or video with your branding.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/youtube-intro.mp4",
    category: "youtube-creators",
  },
  {
    id: "youtube-outro-1",
    title: "YouTube Outro",
    desc: "Create a polished YouTube outro that ends your video with your branding, channel name, calls to action.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/youtube-outro.mp4",
    category: "youtube-creators",
  },
  {
    id: "video-hook-1",
    title: "Video Hook",
    desc: "Create an attention-grabbing opening designed to capture viewers in the first few seconds of your video.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/video-hook.mp4",
    category: "youtube-creators",
  },
  {
    id: "subscribe-animation-1",
    title: "Subscribe Animation",
    desc: "Create an eye-catching subscribe animation for YouTube videos with your channel branding.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/subscribe-animation.mp4",
    category: "youtube-creators",
  },
  {
    id: "channel-logo-reveal-1",
    title: "Channel Logo Reveal",
    desc: "Turn your channel logo into a polished animated reveal with dynamic motion, visual effects.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/channel-logo-reveal.mp4",
    category: "youtube-creators",
  },
  {
    id: "logo-reveal-1",
    title: "Logo Reveal",
    desc: "Cinematic logo reveal animation. The elegant golden line-art logo draws itself smoothly.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/logo-reveal.mp4",
    category: "youtube-creators",
  },
  {
    id: "faceless-video-1",
    title: "Faceless Video",
    desc: "Turn a topic, idea, or script into a complete faceless video with engaging visuals, AI voiceover.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "faceless-explainer-1",
    title: "Faceless Explainer",
    desc: "Turn a topic, product, service, or idea into a clear explainer with AI-generated visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-explainer.mp4",
    category: "youtube-creators",
  },
  {
    id: "faceless-documentary-1",
    title: "Faceless Documentary",
    desc: "Turn a topic, event, person, or story into an engaging documentary with cinematic visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-documentary.mp4",
    category: "youtube-creators",
  },
  {
    id: "faceless-story-video-1",
    title: "Faceless Story Video",
    desc: "Turn a story, idea, or plot into an engaging faceless video with AI-generated characters and scenes.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-story-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "motivational-video-1",
    title: "Motivational Video",
    desc: "Turn a motivational message into an inspiring video with powerful visuals and uplifting narration.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/motivational-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "quote-video-1",
    title: "Quote Video",
    desc: "Turn an inspiring or memorable quote into an engaging video with beautiful visuals and animated text.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/quote-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "news-style-video-1",
    title: "News-Style Video",
    desc: "Turn a topic or update into a polished news-style video with professional narration and headlines.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/news-style-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "creator-promo-1",
    title: "Creator Promo",
    desc: "Create a professional promotional video for your personal brand, channel, or creator business.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/creator-promo.mp4",
    category: "youtube-creators",
  },
  {
    id: "channel-trailer-1",
    title: "Channel Trailer",
    desc: "Create an engaging trailer that introduces your YouTube channel, showcases what your content is about.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/channel-trailer.mp4",
    category: "youtube-creators",
  },
  {
    id: "personal-brand-intro-1",
    title: "Personal Brand Intro",
    desc: "Create a polished introduction for your personal brand that showcases who you are and what you do.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/personal-brand-intro.mp4",
    category: "youtube-creators",
  },
  {
    id: "reaction-video-1",
    title: "Reaction Video",
    desc: "Create an engaging reaction-style video that combines a person or creator with the content.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/reaction-video.mp4",
    category: "youtube-creators",
  },
  {
    id: "meme-me-1",
    title: "Meme Me",
    desc: "Reaction meme video. An extreme close-up, zoomed-in shot with exaggerated expression and meme text.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/meme-me.mp4",
    category: "youtube-creators",
  },
  {
    id: "montage-1",
    title: "Montage",
    desc: "Stop-motion postcard montage animation with handwritten text, postage stamps and dynamic video memories.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/montage.mp4",
    category: "youtube-creators",
  },
];

export default function InteractiveVideoTemplatesSection({
  onOpenAuth,
  onCTA,
}: InteractiveVideoTemplatesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<
    "most-popular" | "photo-experiences" | "products-ecommerce" | "youtube-creators"
  >("most-popular");

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES_DATA.filter(
    (item) => item.category === activeCategory
  );

  const handleTemplateClick = (template: VideoTemplateItem) => {
    const attributionInput: RegistrationCTAInput = {
      cta_id: "video_templates",
      cta_label: "Video Templates",
      section_id: "video_templates_showcase",
      section_label: "Interactive Video Templates Gallery",
      item_id: template.id,
      item_label: template.title,
    };

    if (onCTA) {
      onCTA(attributionInput);
    } else {
      handleRegistrationCTA(attributionInput, onOpenAuth);
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#050713] overflow-hidden text-white border-t border-white/5">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-gradient-to-r from-[#007BFF]/15 via-[#713BFF]/15 to-[#E54BFF]/15 blur-[100px] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 relative z-10">
        
        {/* Header Text */}
        <div className="text-center max-w-[950px] mx-auto mb-10 flex flex-col items-center">
          <h2 className="mt-5 font-poppins text-[32px] md:text-[48px] font-extrabold text-white tracking-tight leading-[1.15] lg:whitespace-nowrap">
            Generate Any{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              AI Video
            </span>{" "}
            You Can Imagine
          </h2>
          <p className="mt-4 font-sans text-[14px] md:text-[16px] text-slate-400 max-w-[600px] leading-relaxed">
            Use text, images, and video to bring your ideas to life with every leading AI video model—all in one place.
          </p>
        </div>

       <div className="flex justify-center mb-10 md:mb-14 w-full">
          {/* AHIA CHANGE: Main background box, border ane shadow remove karya che jethi 2nd image jevu clean dekhay */}
          <div className="w-full max-w-[1024px] px-2 py-2">
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 md:gap-10">
              {AI_VIDEO_MODELS.map((model) => (
                <div
                  key={model.name}
                  className="flex flex-col items-center gap-2.5 sm:gap-3 group cursor-pointer transition-transform hover:scale-105"
                >
                  {/* AHIA CHANGE: Box ni size moti kari che (w-[64px] thi w-[76px] sudhi) ane border radius vadharu che */}
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
                  {/* AHIA CHANGE: Text size moti kari che */}
                  <span className="text-[13px] sm:text-[15px] font-medium text-slate-300 group-hover:text-white transition-colors">
                    {model.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        {/* AHIA: justify-center ni jagya a justify-start md:justify-center add karyu che jethi first item clip na thai */}
        <div className="flex items-center justify-start md:justify-center gap-3 mb-10 overflow-x-auto no-scrollbar px-4 py-2 w-full">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 md:px-7 md:py-3 rounded-full text-[12px] md:text-[14px] font-semibold tracking-wide transition-all duration-300 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#FF2ED9] text-white shadow-[0_0_24px_rgba(139,92,246,0.45)]"
                    : "bg-[#0B1024]/90 text-slate-300 border border-white/10 hover:text-white hover:border-purple-500/50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Video Templates Grid: 2 columns on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {filteredTemplates.map((template) => (
            <VideoTemplateCard
              key={template.id}
              template={template}
              onClick={() => handleTemplateClick(template)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}