import Hero from "@/components/layout/Hero";
import Infrastructure from "@/components/layout/Infrastructure";
import About from "@/components/layout/About";
import Features from "@/components/layout/Features";
import Performance from "@/components/layout/Performance";
import Team from "@/components/layout/Team";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen">
        <Hero />
        <Infrastructure />
        <About />
        <Features />
        <Performance />
        <Team />
        <Footer />
      </main>
    </PageTransition>
  );
}
