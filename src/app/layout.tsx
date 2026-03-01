import type { Metadata } from "next";
import "./globals.css";
import "react-quill/dist/quill.snow.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import AnalyticsLoader from "@/components/layout/AnalyticsLoader";
import CookieConsent from "@/components/layout/CookieConsent";
import BackgroundAudio from "@/components/layout/BackgroundAudio";

export const metadata: Metadata = {
  title: {
    default: "MCCICTS | ICT Society of Mayurapada Central College",
    template: "%s | MCCICTS"
  },
  description: "The official website of the ICT Society of Mayurapada Central College. Empowering students through technology, innovation, and digital literacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.cdnfonts.com/css/azonix" rel="stylesheet" />
      </head>
      <body className="antialiased bg-black text-foreground">
        <SmoothScroll>
          {children}
          <AnalyticsLoader />
          <CookieConsent />
          <BackgroundAudio />
        </SmoothScroll>
      </body>
    </html>
  );
}
