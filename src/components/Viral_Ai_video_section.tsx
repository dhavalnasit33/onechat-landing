export default function ViralAiVideoSection({
    imageSrc = "assets/landing-page/Viral_AI_Videos.png",
}: {
    imageSrc?: string;
} = {}) {
    return (
        <section className="w-full bg-[#050713] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-12 xl:gap-16">
                <div className="order-2 lg:order-1 text-center lg:text-left w-full flex flex-col justify-center items-start max-w-[550px] lg:max-w-[520px] mx-auto lg:mr-auto lg:ml-0">
                    <h2 className="mx-auto max-w-2xl break-words text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:mx-0 lg:text-3xl xl:text-4xl">
                        Viral AI Videos
                    </h2>
                    <p className="mx-auto mt-8 max-w-xl break-words text-sm leading-6 text-white/90 sm:text-base sm:leading-7 lg:mx-0">
                        Turn your ideas into scroll-stopping AI videos in minutes. Create
                        engaging, viral-ready content for TikTok, Instagram Reels, YouTube
                        Shorts, and more. Simply enter your topic, choose your style and
                        voice, and let AI bring your vision to life. No filming, editing
                        skills, or expensive equipment required.
                    </p>
                </div>

                <div className="order-1 lg:order-2 relative aspect-[4/3] overflow-hidden rounded-[18px] bg-gradient-to-r from-[#007BFF] via-[#713BFF] to-[#E54BFF] p-[1px] h-auto lg:h-[405px] w-full max-w-[720px] mx-auto lg:ml-auto lg:mr-0 justify-self-end">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[17px] bg-[#030614]">
                        <img
                            src={imageSrc}
                            alt="Viral AI Videos"
                            className="h-full w-full object-fill"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
