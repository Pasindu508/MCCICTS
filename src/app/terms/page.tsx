"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Footer from "@/components/layout/Footer";
import MenuOverlay from "@/components/layout/MenuOverlay";

export default function TermsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <PageTransition>
      <main className="min-h-screen bg-black p-4 md:p-6 overflow-hidden flex flex-col pb-24">
        <header className="relative z-20 flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-white text-sm font-bold tracking-[0.2em] cursor-pointer relative z-[110]"
              style={{ fontFamily: "'Azonix', sans-serif" }}
            >
              MCCICTS
            </Link>
          </div>
          <div
            onClick={() => setIsMenuOpen(true)}
            className="text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white cursor-pointer transition-colors font-medium"
          >
            Menu
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <MenuOverlay
              key="terms-menu"
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 relative mt-2 rounded-[32px] md:rounded-[40px] overflow-hidden px-6 sm:px-12 md:px-24 py-10 md:py-12 border border-white/5 bg-gradient-to-b from-[#05070a] via-black to-black">
          <section className="max-w-4xl mx-auto">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/30 mb-4">
              Legal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-3">
              Terms of Service
            </h1>
            <p className="text-[11px] md:text-xs uppercase tracking-[0.32em] text-white/30 mb-6">
              MCCICTS PARTICIPATION GUIDELINES
            </p>
            <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed mb-10">
              These Terms of Service outline the rules and guidelines for using
              the MCCICTS website and participating in our
              activities.
            </p>

            <div className="space-y-8">
              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  01 · Agreement
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Acceptance of terms
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  By accessing this website or taking part in MCCICTS
                  events, you agree to follow these Terms of Service, as well as
                  any additional guidelines shared by the society.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  02 · Behaviour
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Appropriate conduct
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  Members and participants are expected to behave respectfully
                  toward others, follow school rules, and use society resources
                  responsibly. Disruptive or harmful behaviour may result in
                  removal from activities.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  03 · Content usage
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Use of website content
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  Content on this website, including text, images, and designs,
                  is provided for informational and educational purposes. You
                  may not copy, redistribute, or use it for commercial purposes
                  without permission from the society.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  04 · Third parties
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Third-party services
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  Some features may link to or rely on third-party platforms,
                  such as forms or social media. Those services have their own
                  terms and policies, which you should review separately.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  05 · Responsibility
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Limitation of liability
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  While we do our best to keep information accurate and systems
                  running smoothly, the society is not responsible for any loss
                  or damage that may arise from using the website or attending
                  events.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  06 · Term changes
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Changes to these terms
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-2">
                  We may update these Terms of Service from time to time to
                  reflect changes in our activities or school policies.
                </p>
                <p className="text-white/40 text-xs md:text-sm">
                  Last updated: {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
              <p className="text-[11px] md:text-xs text-white/40">
                Participation in MCCICTS activities assumes that you
                have read and understood these terms. For clarity, speak to a
                committee member or teacher-in-charge.
              </p>
              <Link
                href="/"
                className="text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-white/60 hover:text-white transition-colors"
              >
                Back to main site
              </Link>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
