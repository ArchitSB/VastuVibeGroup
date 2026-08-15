import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { CustomCursor } from "@/components/shell/CustomCursor";
import { Footer } from "@/components/shell/Footer";
import { Nav } from "@/components/shell/Nav";
import { Preloader } from "@/components/shell/Preloader";
import { SmoothScroll } from "@/components/shell/SmoothScroll";
import { WhatsAppFloat } from "@/components/shell/WhatsAppFloat";
import { motionTheme } from "@/lib/motion-theme";
import logo from "../../public/media/logo/logo-manifest.json";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "optional",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: "variable",
  style: "normal",
  variable: "--font-instrument-sans",
  display: "optional",
});

export const metadata: Metadata = {
  title: "VastuVibe Group | Dubai Properties in Tanzania",
  description: "Dubai's finest addresses, delivered in Tanzania.",
  icons: {
    icon: logo.available
      ? [{ url: logo.icons.favicon, sizes: "32x32", type: "image/png" }, { url: logo.icons.large, sizes: "512x512", type: "image/png" }]
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 42 32'%3E%3Crect width='42' height='32' fill='%230b0b0f'/%3E%3Cg fill='none' stroke='%23c9a96a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 3 13.6 29 25.2 3'/%3E%3Cpath d='M16.8 3 28.4 29 40 3'/%3E%3C/g%3E%3C/svg%3E",
    apple: logo.available ? [{ url: logo.icons.apple, sizes: "180x180", type: "image/png" }] : undefined,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const bootWatchdog = `
    (() => {
      const ready = (reason) => {
        if (reason === 'watchdog' && document.documentElement.dataset.siteReadyReason === 'animated') return;
        document.documentElement.dataset.siteReady = 'true';
        document.documentElement.dataset.siteReadyReason = reason;
        delete document.documentElement.dataset.preloader;
        try { sessionStorage.setItem('vastuvibe-intro-seen', 'true'); } catch {}
        window.dispatchEvent(new Event('vastuvibe:ready'));
      };
      try {
        if (sessionStorage.getItem('vastuvibe-intro-seen') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches || innerWidth < 1024 || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) ready('instant');
        else {
          document.documentElement.dataset.preloader = 'show';
          setTimeout(() => ready('watchdog'), ${motionTheme.duration.preloaderMax * 1000});
        }
      } catch { setTimeout(() => ready('watchdog'), ${motionTheme.duration.preloaderMax * 1000}); }
    })();
  `;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootWatchdog }} />
      </head>
      <body>
        <Preloader />
        <Nav />
        <SmoothScroll>
          {children}
          <div className="footer-reveal-spacer" aria-hidden="true" />
        </SmoothScroll>
        <Footer />
        <WhatsAppFloat />
        <CustomCursor />
      </body>
    </html>
  );
}
