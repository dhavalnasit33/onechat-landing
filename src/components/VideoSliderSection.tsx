"use client";
import React, { useState, useEffect, useRef } from "react";

interface VideoItem {
  title: string;
  prompt: string;
  videoPath: string;
}

// Replace "api.onechatai.com" with your actual domain or CDN endpoint if it differs
const CDN_BASE_URL = `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/uploads/landing-page-video`;

const videoData: VideoItem[] = [
  {
    title: "The white dragon warrior",
    prompt:
      "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
    videoPath: `${CDN_BASE_URL}/the-white-dragon-warrior-stands-still.mp4`,
  },
  {
    title: "A magical timelapse",
    prompt:
      "A magical timelapse transition of winter to spring with flowers blooming on a large tree.",
    videoPath: `${CDN_BASE_URL}/a-magical-timelapse-transition.mp4`,
  },
  {
    title: "A red fox directing",
    prompt:
      "A red fox directing a film showing multiple scenes, including a western and lush rainforest.",
    videoPath: `${CDN_BASE_URL}/a-red-fox-directing.mp4`,
  },
  {
    title: "A mecha lands",
    prompt:
      'A mecha lands on the ground to save the city, and says "I\'m here", in anime style.',
    videoPath: `${CDN_BASE_URL}/a-mecha-lands-on-the-ground-to-save-the-city-and-says-I-m-here-in-anime-style.mp4`, // Note: ensure exact filename matches the server
  },
  {
    title: "Extreme close up of dark chocolate",
    prompt:
      "Extreme close-up of rich dark chocolate being poured in slow motion over a layered cake. The glossy chocolate cascades down the sides, coating every surface with a perfect mirror-like sheen. Cocoa powder dusts through the air like smoke. Shallow depth of field, warm studio lighting, food photography aesthetic. The scene is luxurious and indulgent.",
    videoPath: `${CDN_BASE_URL}/extreme-close-up-of-rich-dark-chocolate.mp4`,
  },
  {
    title: "Elephant walks into scene",
    prompt:
      "Elephant walks into scene, a modern house, and starts to play with the ball.",
    videoPath: `${CDN_BASE_URL}/elephant-walks-into-scene-a-modern-house-and-starts-to-play-with-the-ball.mp4`, // Note: ensure exact filename matches the server
  },
  {
    title: "Periscope-level shot",
    prompt: "Periscope-level shot from behind tall grass of two Maasai.",
    videoPath: `${CDN_BASE_URL}/periscope-level-shot-from-behind-tall-grass-of-two-Maasai.mp4`, // Note: ensure exact filename matches the server
  },
  {
    title: "A stylized animated teenager",
    prompt:
      "A stylized animated teenage boy leans against a graffiti-covered wall under a highway overpass at night, giving a confident thumbs-up while talking. The camera slowly dollies in with subtle handheld movement. His hoodie and jacket gently sway in the breeze, blinking naturally as his lips sync to speech. Streetlights flicker softly, distant city lights twinkle, and the graffiti glows with subtle neon reflections. Cinematic lighting, shallow depth of field, smooth character animation, high detail, realistic motion, 4K.",
    videoPath: `${CDN_BASE_URL}/a-stylized-animated-teenage.mp4`,
  },
];

function VideoCard({ item }: { item: VideoItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // NEW: State and Ref for lazy loading
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // NEW: Intersection Observer to detect when the video is on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true); // Load the video
            // Play the video once it's in view
            videoRef.current
              ?.play()
              .catch((err) => console.log("Autoplay blocked:", err));
          } else {
            // Pause the video when it scrolls off-screen to save CPU/Memory
            videoRef.current?.pause();
          }
        });
      },
      {
        rootMargin: "300px", // Start loading 300px before it enters the screen
        threshold: 0.1,
      },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const shouldTruncate = item.prompt.length > 60;
  const displayPrompt = isExpanded
    ? item.prompt
    : shouldTruncate
      ? `${item.prompt.slice(0, 57)}...`
      : item.prompt;

  return (
    <div className="group w-[340px] sm:w-[480px] md:w-[580px] lg:w-[640px] shrink-0 mx-4 flex flex-col justify-start transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#0F1426] shadow-lg border border-white/10 group-hover:border-purple-500/40 group-hover:shadow-[0_8px_30px_rgba(108,86,229,0.2)] transition-all duration-300">
        <video
          ref={videoRef}
          // NEW: Only set the src if the video is in view!
          src={isInView ? item.videoPath : ""}
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      <div className="mt-4 px-1 text-left">
        <div>
          <h4 className="font-poppins text-base md:text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
            {item.title}
          </h4>

          <div className="mt-2.5">
            <p className="font-sans text-xs md:text-sm text-slate-400 leading-relaxed font-light">
              <strong className="font-semibold text-slate-200">
                Prompt:{" "}
              </strong>
              {displayPrompt}
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors focus:outline-none cursor-pointer ml-2 align-middle border border-white/10"
                  title={isExpanded ? "Show Less" : "Show More"}
                >
                  {isExpanded ? "-" : "+"}
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="mt-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleCopy}
            className="text-xs md:text-sm font-semibold text-brand-purple-light hover:text-white transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoSliderSection() {
  const [isPaused, setIsPaused] = useState(false);
  // Triplicate the data to match the marquee continuous loop requirement
  const triplicatedData = [...videoData, ...videoData, ...videoData];

  return (
    <section
      id="video-showcase"
      className="relative w-full py-16 sm:py-20 md:py-24 bg-[#070913] overflow-hidden text-white border-t border-white/5"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(108,86,229,0.15),transparent)] pointer-events-none" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-4 text-center">
        <div className="flex flex-col items-center">
          <h2 className="mt-5 font-poppins text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-[950px]">
            Generate Any{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
              AI Video
            </span>{" "}
            You Can Imagine
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base text-slate-400 max-w-[600px] leading-relaxed">
            Use text, images, and video to bring your ideas to life with every leading AI video model—all in one place.
          </p>
        </div>
      </div>

      {/* Scrolling Cards Marquee */}
      <div 
        // Changed: Added lg:cursor-default so it doesn't look clickable on desktop
        className="relative mt-12 md:mt-16 overflow-hidden w-full flex items-center py-4 cursor-pointer"
        onClick={() => {
          // Changed: Only toggle state on mobile/tablet (width < 1024px)
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsPaused(!isPaused);
          }
        }}
      >
        {/* Changed: Added lg:hover:pause-marquee to prevent sticky hover states on mobile taps */}
        <div className={`flex animate-marquee lg:hover:pause-marquee ${isPaused ? "pause-marquee" : ""}`}>
          {triplicatedData.map((item, idx) => (
            <VideoCard key={idx} item={item} />
          ))}
        </div>
      </div>

      <div className="relative mt-6 flex justify-center lg:hidden">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none backdrop-blur-sm"
        >
          {isPaused ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showcase Paused (Tap to Resume)</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-purple-light animate-pulse" />
              <span>Showcase Running (Tap to Pause)</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}