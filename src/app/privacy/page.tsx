"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Footer from "@/components/layout/Footer";
import MenuOverlay from "@/components/layout/MenuOverlay";

export default function PrivacyPage() {
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
              key="privacy-menu"
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
              Privacy Policy
            </h1>
            <p className="text-[11px] md:text-xs uppercase tracking-[0.32em] text-white/30 mb-6">
              MCCICTS DATA PRACTICES
            </p>
            <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed mb-10">
              This Privacy Policy explains how MCCICTS collects,
              uses, and protects information when you interact with our
              website, register as a member, or participate in our events and
              activities.
            </p>

            <div className="space-y-8">
              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  01 · Data we collect
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Information we collect
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  We may collect information such as your name, email address,
                  grade and class, contact number, areas of interest, and any
                  details you provide when submitting registration forms or
                  contacting us. This information is used only for society
                  operations and communication.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  02 · How it is used
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  How we use your information
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  Your information helps us manage memberships, organize
                  events, share announcements, and improve our activities. We
                  do not sell or share your personal information with third
                  parties for marketing purposes.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  03 · Keeping data safe
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Data security
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  We use reasonable technical and organizational measures to
                  keep your information safe. However, no system is completely
                  secure, and we cannot guarantee absolute security of data
                  transmitted over the internet.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  04 · Your control
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Your choices
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">
                  If you want to update or remove your information from our
                  records, you can contact a committee member or use the
                  contact details provided by the society. We will do our best
                  to respond within a reasonable time.
                </p>
              </div>

              <div className="bg-[#05070a] border border-white/5 rounded-[24px] p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/35 mb-2">
                  05 · Policy updates
                </p>
                <h2 className="text-white text-lg md:text-xl font-light mb-3">
                  Changes to this policy
                </h2>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-2">
                  We may update this Privacy Policy from time to time to
                  reflect changes in our activities or legal requirements.
                </p>
                <p className="text-white/40 text-xs md:text-sm">
                  Last updated: {new Date().getFullYear()}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
              <p className="text-[11px] md:text-xs text-white/40">
                If you have questions about this policy, speak to a committee
                member or contact MCCICTS through the official
                school channels.
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
