"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { handleRegistrationCTA, RegistrationCTAInput } from "../lib/attribution";

interface VideoTemplateItem {
  id: string;
  title: string;
  desc: string;
  video: string;
}

interface InteractiveVideoTemplatesSectionProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
  onCTA?: (attribution: RegistrationCTAInput) => void;
}

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
              videoRef.current.play().catch(() => { });
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
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isReady ? "opacity-100" : "opacity-0"
            }`}
        />
      ) : (
        <div className="absolute inset-0 bg-[#070b1e]" />
      )}

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

      {/* Badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] bg-[#12141D]/95 border border-white/5 max-w-[85%]">
        <span className="w-1 h-3.5 bg-[#A855F7] rounded-full inline-block shrink-0" />
        <span className="text-[12px] sm:text-[13px] font-bold text-white tracking-wide truncate">
          {template.title}
        </span>
      </div>

      {/* Description */}
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
  { name: "Seedance", icon: "/assets/landing-page/section-2-seedream.png" },
  { name: "Runway", icon: "/assets/landing-page/section-2-runway.png" },
  { name: "Kling", icon: "/assets/landing-page/section-2-kling.png" },
  { name: "Pika", icon: "/assets/landing-page/section-2-pika.png" },
  { name: "MiniMax", icon: "/assets/landing-page/section-2-minimax.png" },
  { name: "Wan", icon: "/assets/landing-page/section-2-qwen.png" },
];

// Reordered and Filtered List based on your requested items
const TEMPLATES_DATA: VideoTemplateItem[] = [
  {
    id: "step-into-the-renaissance",
    title: "Step into the Renaissance",
    desc: "Cinematic Italian Renaissance scene. An artist or noble in velvet attire walking along the picturesque Arno riverbank.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-the-renaissance.mp4",
  },
  {
    id: "step-into-medieval-europe",
    title: "Step into Medieval Europe",
    desc: "Cinematic medieval drama scene. A knight in polished plate armor riding or walking across a stone drawbridge.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-medieval-europe.mp4",
  },
  {
    id: "step-into-ancient-rome",
    title: "Step into Ancient Rome",
    desc: "Cinematic epic ancient Roman film scene. A warrior or senator in classic Roman armor walking through the lively Roman Forum.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-ancient-rome.mp4",
  },
  {
    id: "vacation-photo-comes-alive",
    title: "Vacation Photo Comes Alive",
    desc: "Turn still holiday snapshots into stunning cinematic videos with swaying palm trees, moving waves, and breeze.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/vacation-photo-comes-alive.mp4",
  },
  {
    id: "faceless-explainer",
    title: "Faceless Explainer",
    desc: "Turn a topic, product, service, or idea into a clear explainer with AI-generated visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/faceless-explainer.mp4",
  },
  {
    id: "historical-portrait-comes-alive",
    title: "Historical Portrait Comes Alive",
    desc: "Make paintings and vintage museum portraits speak and move with lifelike eyes, expressions, and posture.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/historical-portrait-comes-alive.mp4",
  },
  {
    id: "old-photo-comes-alive",
    title: "Old Photo Comes Alive",
    desc: "Reanimate vintage black & white or sepia memories with authentic emotion, soft head movement, and nostalgic atmosphere.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/old-photo-comes-alive.mp4",
  },
  {
    id: "then-vs-now",
    title: "Then vs. Now",
    desc: "Bring two photos from different moments in time together in a nostalgic Then vs. Now video.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/then-vs-now.mp4",
  },
  {
    id: "meet-my-future-self",
    title: "Meet My Future Self",
    desc: "Create an inspiring moment where your present-day self meets a future version of yourself.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/meet-my-future-self.mp4",
  },
  {
    id: "hug-my-younger-self",
    title: "Hug My Younger Self",
    desc: "Create an emotional moment where your present-day self meets and hugs your younger self.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/hug-my-younger-self.mp4",
  },
  {
    id: "yearbook-comes-alive",
    title: "Yearbook Comes Alive",
    desc: "Bring a yearbook photo to life with natural expressions, realistic movement, and nostalgic atmosphere.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/yearbook-comes-alive.mp4",
  },
  {
    id: "360-photo-booth",
    title: "360 Photo Booth",
    desc: "Cinematic 360-degree photo booth video animation. A glamorous character (attached image) at a red carpet event while a high-speed camera rig orbits completely around them in a smooth 360-degree rotation. The background shows flashing paparazzi camera lights, elegant event lighting, and a blurred crowd, capturing a high-end award show slow-motion effect.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/360-photo-booth.mp4",
  },
  {
    id: "youtube-intro",
    title: "YouTube Intro",
    desc: "Create a polished, attention-grabbing YouTube intro that introduces your channel or video with your branding.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/youtube-intro.mp4",
  },
  {
    id: "pet-movie-star",
    title: "Pet Movie Star",
    desc: "Turn your pet into the star of their own movie with cinematic scenes, dramatic camera work.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/pet-movie-star.mp4",
  },
  {
    id: "pet-superhero",
    title: "Pet Superhero",
    desc: "Turn your pet into an epic superhero with extraordinary powers, a heroic costume, and cinematic visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/pet-superhero.mp4",
  },
  {
    id: "talking-pets",
    title: "Talking Pets",
    desc: "Talking pet video animation. Looks directly into the camera with expressive eyes and cheerful facial expressions.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/talking-pets.mp4",
  },
  {
    id: "personal-brand-intro",
    title: "Personal Brand Intro",
    desc: "Create a polished introduction for your personal brand that showcases who you are and what you do.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/personal-brand-intro.mp4",
  },
  {
    id: "creator-promo",
    title: "Creator Promo",
    desc: "Create a professional promotional video for your personal brand, channel, or creator business.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/creator-promo.mp4",
  },
  {
    id: "news-style-video",
    title: "News-Style Video",
    desc: "Turn a topic or update into a polished news-style video with professional narration and headlines.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/news-style-video.mp4",
  },
  {
    id: "step-into-victorian-london",
    title: "Step into Victorian London",
    desc: "Cinematic 19th-century Victorian scene. A gentleman or lady in authentic Victorian attire walking through cobblestone streets.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-victorian-london.mp4",
  },
  {
    id: "channel-logo-reveal",
    title: "Channel Logo Reveal",
    desc: "Turn your channel logo into a polished animated reveal with dynamic motion, visual effects.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/channel-logo-reveal.mp4",
  },
  {
    id: "product-demo",
    title: "Product Demo",
    desc: "Clean commercial product demonstration video showing practical usage, key benefits, and interaction.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-demo.mp4",
  },
  {
    id: "model-in-scene",
    title: "Model In Scene Video",
    desc: "Upload a person and a location, add an action, and generate a vertical video that brings your scene to life.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/model-in-scene-video.mp4",
  },
  {
    id: "before-after-ad",
    title: "Before & After Ad",
    desc: "Show the impact of your product or service with a compelling before-and-after transformation.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/before-after-ad.mp4",
  },
  {
    id: "product-benefits-ad",
    title: "Product Benefits Ad",
    desc: "Create a compelling product ad that clearly showcases your product’s most important benefits, demonstrates how it improves the customer’s experience, and turns features into persuasive reasons to buy.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-benefits-ad.mp4",
  },
  {
    id: "product-comparison-ad",
    title: "Product Comparison Ad",
    desc: "Create a compelling comparison ad that shows how your product stacks up against another product.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/product-comparison-ad.mp4",
  },
  {
    id: "customer-testimonial",
    title: "Customer Testimonial",
    desc: "Turn a real customer review, testimonial, or success story into a polished video ad with an AI presenter.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/customer-testimonial.mp4",
  },
  {
    id: "pet-cartoon",
    title: "Pet Cartoon",
    desc: "Transform your pet into an adorable animated character and bring them to life in a colorful cartoon world with expressive movement, playful adventures, and animated movie-style visuals.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/pet-cartoon.mp4",
  },
  {
    id: "step-into-ancient-greece",
    title: "Step into Ancient Greece",
    desc: "Cinematic epic ancient Greek scene. Step back in time to the world of philosophers and Spartans.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-ancient-greece.mp4",
  },
  {
    id: "step-into-the-viking-age",
    title: "Step into the Viking Age",
    desc: "Cinematic Scandinavian Norse historical scene. A Viking warrior or jarl (using attached image) in fur-trimmed armor holding a Norse shield, stepping off a dragon-headed longship onto a misty fjord shoreline with snow-capped cliffs and roaring campfires.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-the-viking-age.mp4",
  },
  {
    id: "step-into-the-aztec-empire",
    title: "Step into the Aztec Empire",
    desc: "Cinematic Aztec Empire scene. An Aztec warrior with obsidian weapon and quetzal feather crest (using attached image) overlooking the island city of Tenochtitlan with causeways over Lake Texcoco and the Great Temple rising majestically.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-the-aztec-empire.mp4",
  },
  {
    id: "step-into-the-ottoman-empire",
    title: "Step into the Ottoman Empire",
    desc: "Cinematic Ottoman Imperial scene. A grand vizier or palace figure in rich embroidered silk robes (using attached image) walking through the courtyards of the Topkapi Palace, with the grand domes of Istanbul and the Bosporus sparkling under radiant golden sunlight.",
    video: "https://api.onechatai.ai/uploads/video-generation-quick-tools-card-videos/step-into-the-ottoman-empire.mp4",
  }











];

export default function InteractiveVideoTemplatesSection({
  onOpenAuth,
  onCTA,
}: InteractiveVideoTemplatesSectionProps) {

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
          <h2 className="mt-5 font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] lg:whitespace-nowrap">
            Generate Any{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              AI Video
            </span>{" "}
            You Can Imagine
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base md:text-lg text-slate-300 max-w-[600px] leading-relaxed">
            Use text, images, and video to bring your ideas to life with every leading AI video model—all in one place.
          </p>
        </div>

        <div className="flex justify-center mb-10 md:mb-14 w-full">
          <div className="w-full max-w-[1024px] px-2 py-2">
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 md:gap-10">
              {AI_VIDEO_MODELS.map((model) => (
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
                  <span className="text-[13px] sm:text-[15px] font-medium text-slate-300 group-hover:text-white transition-colors">
                    {model.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Templates Grid: Directly mapping TEMPLATES_DATA without tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {TEMPLATES_DATA.map((template) => (
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