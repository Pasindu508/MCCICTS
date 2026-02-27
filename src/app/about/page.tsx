import AboutHero from "@/components/about/AboutHero";
import AboutDetails from "@/components/about/AboutDetails";
import HistoryTimeline from "@/components/about/HistoryTimeline";
import Team from "@/components/layout/Team";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-black">
        <AboutHero />
        <AboutDetails />
        <HistoryTimeline />
        <Team />
        <Footer />
      </main>
    </PageTransition>
  );
}
