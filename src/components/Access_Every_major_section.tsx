export default function AccessEveryMajorSection() {
    return (
        <section className="w-full bg-[#050713] py-16 sm:py-20 lg:py-24">
            <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-gradient-to-r from-[#007BFF] via-[#713BFF] to-[#E54BFF] p-[1px]">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[17px] bg-[#030614]">
                        <img
                            src="assets/landing-page/Access_Every_major_section.png"
                            alt="OneChat AI bringing major AI models together in one chat interface"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                <div className="text-center lg:text-left w-full flex flex-col justify-center items-start max-w-[550px] lg:max-w-[520px] mx-auto lg:ml-auto lg:mr-0
                ">
                    <h2 className="mx-auto max-w-2xl break-words text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl lg:mx-0 lg:text-3xl xl:text-4xl">
                        Access Every Major AI Model
                    </h2>
                    <p className="mx-auto mt-8 max-w-xl break-words text-sm leading-6 text-white/90 sm:text-base sm:leading-7 lg:mx-0">
                        Chat with ChatGPT, Claude, Gemini, DeepSeek, Grok, and more — all
                        from one powerful platform. Switch between leading AI models and
                        get the answers you need without juggling multiple apps or
                        subscriptions.
                    </p>
                </div>
            </div>
        </section>
    );
}
