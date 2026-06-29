import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "OneChat AI | The Ultimate AI + Business Super App",
  description:
    "Access every major AI model, hundreds of specialized tools for writing, marketing, design, research, video, and more under one single subscription. Start your 7-day free trial today.",
  alternates: {
    canonical: "https://onechatai.ai/",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.ico",
    apple: "/icons/Icon-192.png",
  },
  other: {
    "google-signin-client_id":
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "361874907943-e4k2cponbo6g12rpu4ssi9f4iq6uguk2.apps.googleusercontent.com",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
    "apple-mobile-web-app-title": "OneChat AI",
    robots: "index,follow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-574KPV7S";
  const mixpanelToken =
    process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ||
    "03d4baa225de32ea61053b3b47c8eed2";
  const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID || "6510949";

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        {/* Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>

        {/* Mixpanel */}
        <Script id="mixpanel-analytics" strategy="afterInteractive">
          {`
            (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}}(document,window.mixpanel||[]));
            mixpanel.init("${mixpanelToken}", {
              debug: true,
              track_pageview: false,
              persistence: "localStorage",
              record: true,
              record_sessions_percent: 100,
              autocapture: true,
            });
          `}
        </Script>

        {/* Hotjar */}
        <Script id="hotjar-analytics" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>

        {/* Reddit Pixel */}
        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){
            p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};
            p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";
            t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s);
            rdt('init','a2_j88r0c6qsh9b');
            rdt('track','PageVisit');
            }}(window,document);
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','1529554822050763');
            fbq('track','PageView');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#0E1120] font-sans">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
