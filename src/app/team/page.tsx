import Team from "@/components/layout/Team";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import TeamHero from "@/components/layout/TeamHero";

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
