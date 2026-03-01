import { Metadata } from "next";
import Team from "@/components/layout/Team";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import TeamHero from "@/components/layout/TeamHero";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the dedicated team members leading the ICT Society of Mayurapada Central College.",
};

export default function TeamPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black">
        <TeamHero />
        <Team hideHeading />
        <Footer />
      </main>
    </PageTransition>
  );
}
