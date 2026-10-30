export default function ViralAiVideoSection({
    imageSrc = "assets/landing-page/Viral_AI_Videos.png",
}: {
    imageSrc?: string;
} = {}) {
    return (
        <section className="relative w-full bg-[#050711] py-12 md:py-16 px-3 sm:px-6 lg:px-8 overflow-hidden text-white">
            <div className="relative max-w-[1380px] mx-auto flex flex-col items-center z-10">
                <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 relative z-10">
                    <div className="text-center max-w-[950px] mx-auto mb-10 flex flex-col items-center">
                        <h2 className="mt-5 font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] lg:whitespace-nowrap">
                            Viral{" "}
                            <span className="bg-gradient-to-r from-[#00A3FF] via-[#8B5CF6] via-[#D946EF] to-[#FF2ED9] bg-clip-text text-transparent">
                                AI Videos
                            </span>{" "}
                        </h2>
                        <p className="mt-4 font-sans text-[14px] md:text-[16px] text-slate-400 max-w-[800px] leading-relaxed">
                            Turn your ideas into scroll-stopping AI videos in minutes. Create
                            engaging, viral-ready content for TikTok, Instagram Reels, YouTube
                            Shorts, and more. Simply enter your topic, choose your style and
                            voice, and let AI bring your vision to life. No filming, editing
                            skills, or expensive equipment required.
                        </p>
                    </div>
                </div>

                {/* image */}
                <div className="w-full mx-auto rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-[#0B0F24]/60 p-1 sm:p-1.5 md:p-2 shadow-[0_0_60px_rgba(108,86,229,0.22)] backdrop-blur-xl">
                    <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#030614]">
                        <img
                            src={imageSrc}
                            alt="preview"
                            loading="eager"
                            className="w-full h-auto block object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
