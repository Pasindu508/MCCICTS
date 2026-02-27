import type { Metadata } from "next";
import "./globals.css";
import "react-quill/dist/quill.snow.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import AnalyticsLoader from "@/components/layout/AnalyticsLoader";
import CookieConsent from "@/components/layout/CookieConsent";
import BackgroundAudio from "@/components/layout/BackgroundAudio";

export const metadata: Metadata = {
  title: "ICT Society | Mayurapada Central College",
  description: "The ICT Society of Mayurapada Central College is a student-led organization advancing digital literacy, coding expertise, and AI research in education.",
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
