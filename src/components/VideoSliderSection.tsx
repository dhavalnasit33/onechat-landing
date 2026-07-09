"use client";
import React, { useState } from "react";

interface VideoItem {
  title: string;
  prompt: string;
  videoPath: string;
}

const videoData: VideoItem[] = [
  {
    title: "The white dragon",
    prompt: "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
    videoPath: "/assets/landing-page/slider-video-section/the-white-dragon-warrior-stands-still.mp4"
  },
  {
    title: "A magical timelapse",
    prompt: "A magical timelapse transition of winter to spring with flowers blooming on a large tree.",
    videoPath: "/assets/landing-page/slider-video-section/a-magical-timelapse-transition.mp4"
  },
  {
    title: "A red fox directing",
    prompt: "A red fox directing a film showing multiple scenes, including a western and lush rainforest.",
    videoPath: "/assets/landing-page/slider-video-section/a-red-fox-directing.mp4"
  },
  {
    title: "A mecha lands",
    prompt: "A mecha lands on the ground to save the city, and says \"I'm here\", in anime style.",
    videoPath: "/assets/landing-page/slider-video-section/a-mecha-lands-on-the-ground-to-save-the-city-and-says-I-m-here-in-anime-style.mp4"
  },
  {
    title: "Extreme close up of dark chocolate",
    prompt: "Extreme close-up of rich dark chocolate being poured in slow motion over a layered cake. The glossy chocolate cascades down the sides, coating every surface with a perfect mirror-like sheen. Cocoa powder dusts through the air like smoke. Shallow depth of field, warm studio lighting, food photography aesthetic. The scene is luxurious and indulgent.",
    videoPath: "/assets/landing-page/slider-video-section/extreme-close-up-of-rich-dark-chocolate.mp4"
  },
  {
    title: "Elephant walks into scene",
    prompt: "Elephant walks into scene, a modern house, and starts to play with the ball.",
    videoPath: "/assets/landing-page/slider-video-section/elephant-walks-into-scene-a-modern-house-and-starts-to-play-with-the-ball.mp4"
  },
  {
    title: "Periscope-level shot",
    prompt: "Periscope-level shot from behind tall grass of two Maasai.",
    videoPath: "/assets/landing-page/slider-video-section/periscope-level-shot-from-behind-tall-grass-of-two-Maasai.mp4"
  },
  {
    title: "A stylized animated teenager",
    prompt: "A stylized animated teenage boy leans against a graffiti-covered wall under a highway overpass at night, giving a confident thumbs-up while talking. The camera slowly dollies in with subtle handheld movement. His hoodie and jacket gently sway in the breeze, blinking naturally as his lips sync to speech. Streetlights flicker softly, distant city lights twinkle, and the graffiti glows with subtle neon reflections. Cinematic lighting, shallow depth of field, smooth character animation, high detail, realistic motion, 4K.",
    videoPath: "/assets/landing-page/slider-video-section/a-stylized-animated-teenage.mp4"
  }
];

function VideoCard({ item }: { item: VideoItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the slider pause state
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
    : (shouldTruncate ? `${item.prompt.slice(0, 57)}...` : item.prompt);

  return (
    <div className="group w-[340px] sm:w-[480px] md:w-[580px] lg:w-[640px] shrink-0 mx-4 flex flex-col justify-start transition-all duration-300 transform hover:-translate-y-1">
      {/* Video element with optimal page speed / CDN caching settings */}
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-brand-dark shadow-md border border-brand-border/40">
        <video
          src={item.videoPath}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      <div className="mt-4 px-1 text-left">
        <div>
          <h4 className="font-poppins text-base md:text-lg font-bold text-brand-dark">
            {item.title}
          </h4>
          
          <div className="mt-2.5">
            <p className="font-sans text-xs md:text-sm text-brand-slate leading-relaxed font-light">
              <strong className="font-semibold text-brand-dark">Prompt: </strong>
              {displayPrompt}
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling the slider pause state
                    setIsExpanded(!isExpanded);
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1e293b] hover:bg-black text-white text-xs font-semibold transition-colors focus:outline-none cursor-pointer ml-2 align-middle"
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
            className="text-xs md:text-sm font-bold text-brand-purple hover:text-brand-purple-light transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
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
  // Triplicate the data to match the marquee continuous loop requirement (similar to AdvantageMarquee)
  const triplicatedData = [...videoData, ...videoData, ...videoData];

  return (
    <section id="video-showcase" className="w-full py-16 md:py-24 bg-white overflow-hidden border-t border-brand-border/20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Section Header */}
        <div className="flex flex-col items-center">
          <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight max-w-[850px]">
            Access Every Leading AI Video Model, <br className="hidden sm:inline" /> All in One Place
          </h2>
        </div>
      </div>

      {/* Scrolling Cards Marquee */}
      <div 
        className="mt-12 md:mt-16 overflow-hidden relative w-full flex items-center py-4 cursor-pointer"
        onClick={() => setIsPaused(!isPaused)}
      >
        <div className={`flex animate-marquee hover:pause-marquee ${isPaused ? "pause-marquee" : ""}`}>
          {triplicatedData.map((item, idx) => (
            <VideoCard key={idx} item={item} />
          ))}
        </div>
      </div>

      {/* Play/Pause Control pill */}
      <div className="mt-6 flex justify-center lg:hidden">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          {isPaused ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Showcase Paused (Tap to Resume)</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-brand-purple animate-pulse" />
              <span>Showcase Running (Tap to Pause)</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
