"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import PageTransition from "@/components/layout/PageTransition";
import Footer from "@/components/layout/Footer";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import MenuOverlay from "@/components/layout/MenuOverlay";
import { FileUpload } from "@/components/ui/file-upload";

export default function RegisterPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [statusEmail, setStatusEmail] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [acceptanceInfo, setAcceptanceInfo] = useState<{
    found: boolean;
    accepted: boolean;
    fullName?: string;
    gradeClass?: string;
  } | null>(null);
  const [acceptanceBodyOverride, setAcceptanceBodyOverride] = useState<
    string | null
  >(null);

  const defaultAcceptanceBody =
    "We are pleased to inform you that your application to join the MCCICTS has been accepted. We are excited to have you as a member of the ICT Society.\n\nPlease stay tuned for further details about upcoming meetings, events, and projects. Make sure to check your school announcements or email for official updates.\n\nBest regards,\nMCCICTS Committee";

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const ref = doc(db, "settings", "acceptanceLetter");
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data() as { body?: string };
          if (data.body && typeof data.body === "string") {
            setAcceptanceBodyOverride(data.body);
          }
        }
      } catch (error) {
        console.error("Error fetching acceptance letter template:", error);
      }
    };

    fetchTemplate();
  }, []);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(false);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = formData.get("fullName")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const gradeClass = formData.get("gradeClass")?.toString().trim() || "";
    const admissionNumber =
      formData.get("admissionNumber")?.toString().trim() || "";
    const contactNumber = formData.get("contactNumber")?.toString().trim() || "";
    const reason = formData.get("reason")?.toString().trim() || "";
    const interests = formData.getAll("interests").map((value) => value.toString());

    try {
      const documents: { name: string; url: string }[] = [];

      for (const file of docFiles) {
        const storageRef = ref(
          storage,
          `registrations/docs/${Date.now()}-${file.name}`
        );
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        documents.push({
          name: file.name,
          url,
        });
      }

      await addDoc(collection(db, "registrations"), {
        fullName,
        email,
        gradeClass,
        admissionNumber,
        contactNumber,
        interests,
        reason,
        documents,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      form.reset();
      setStep(1);
      setDocFiles([]);
      setUploadResetKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting registration:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckStatus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = statusEmail.trim().toLowerCase();
    if (!email) {
      return;
    }

    setCheckingStatus(true);
    setAcceptanceInfo(null);

    try {
      const q = query(
        collection(db, "registrations"),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setAcceptanceInfo({
          found: false,
          accepted: false,
        });
        return;
      }

      const docs = snapshot.docs.slice().sort((a, b) => {
        const aTime = (a.data().createdAt?.seconds as number | undefined) || 0;
        const bTime = (b.data().createdAt?.seconds as number | undefined) || 0;
        return bTime - aTime;
      });

      const latest = docs[0].data() as {
        fullName?: string;
        gradeClass?: string;
        handled?: boolean;
      };

      setAcceptanceInfo({
        found: true,
        accepted: !!latest.handled,
        fullName: latest.fullName,
        gradeClass: latest.gradeClass,
      });
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingStatus(false);
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black p-4 md:p-6 overflow-hidden flex flex-col">
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
              key="register-menu"
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 relative mt-2 bg-[#05070a] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden px-6 sm:px-12 md:px-24 py-10 md:py-12">
          <section className="max-w-5xl mx-auto w-full flex flex-col">
            <div className="mb-10 md:mb-16">
            <p className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-white/30 mb-4">
              MCCICTS REGISTRATION
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-4">
              Join the MCCICTS
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-xl leading-relaxed">
              Fill out the form below to register as a member of the ICT Society. 
              We will review your details and contact you with next steps.
            </p>
          </div>

          <div className="relative bg-[#05070a] border border-white/5 rounded-[28px] md:rounded-[32px] p-6 md:p-10 overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-32 w-72 h-72 bg-blue-500/10 blur-3xl pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6 md:space-y-7">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        step === 1
                          ? "w-7 h-7 rounded-full bg-white text-black text-[11px] flex items-center justify-center tracking-[0.18em]"
                          : "w-7 h-7 rounded-full border border-white/30 text-white/60 text-[11px] flex items-center justify-center tracking-[0.18em]"
                      }
                    >
                      1
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                      Details
                    </span>
                  </div>
                  <div className="h-px w-8 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        step === 2
                          ? "w-7 h-7 rounded-full bg-white text-black text-[11px] flex items-center justify-center tracking-[0.18em]"
                          : "w-7 h-7 rounded-full border border-white/30 text-white/60 text-[11px] flex items-center justify-center tracking-[0.18em]"
                      }
                    >
                      2
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                      Documentation
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Step {step} of 2
                </span>
              </div>

              <div className={step === 1 ? "space-y-6 md:space-y-7" : "space-y-6 md:space-y-7 hidden"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                      Full Name
                    </label>
                    <input
                      required
                      name="fullName"
                      type="text"
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                      Email
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                      Grade / Class
                    </label>
                    <input
                      required
                      name="gradeClass"
                      type="text"
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      placeholder="e.g. Grade 10 - B"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                      Admission Number
                    </label>
                    <input
                      required
                      name="admissionNumber"
                      type="text"
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      placeholder="e.g. 12345"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                      Contact Number
                    </label>
                    <input
                      required
                      name="contactNumber"
                      type="tel"
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                      placeholder="e.g. 071 234 5678"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                    Areas of Interest
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Web Development",
                      "Mobile Apps",
                      "UI / UX Design",
                      "AI / Machine Learning",
                      "Cybersecurity",
                      "Robotics",
                      "Graphic Design",
                    ].map((label) => (
                      <label
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[11px] text-white/60 hover:border-white/40 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          name="interests"
                          value={label}
                          className="h-3 w-3 rounded-sm border border-white/30 bg-transparent"
                        />
                        <span className="uppercase tracking-[0.18em]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                    Why do you want to join?
                  </label>
                  <textarea
                    required
                    name="reason"
                    rows={4}
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                    placeholder="Tell us about your goals, experience, or what you hope to learn."
                  />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-8 py-3 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500"
                  >
                    Next: Documentation
                  </button>

                  <p className="text-xs md:text-sm text-white/40">
                    You can upload your supporting documents in the next step.
                  </p>
                </div>
              </div>

              <div className={step === 2 ? "space-y-6 md:space-y-7" : "space-y-6 md:space-y-7 hidden"}>
                <div className="space-y-2">
                  <label className="text-white/60 text-xs uppercase tracking-[0.25em]">
                    Documentation upload
                  </label>
                  <p className="text-white/40 text-xs md:text-sm mb-2">
                    Upload any certificates, portfolios, or other documents that support your application.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <FileUpload
                      key={uploadResetKey}
                      onChange={(files) =>
                        setDocFiles((prev) => [...prev, ...files])
                      }
                    />
                  </div>
                  {docFiles.length > 0 && (
                    <p className="text-[11px] text-white/40 mt-2">
                      {docFiles.length} file{docFiles.length === 1 ? "" : "s"} selected.
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-full border border-white/15 bg-transparent text-[11px] uppercase tracking-[0.25em] text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 rounded-full border border-white/15 bg-white text-black text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-accent hover:text-white hover:border-accent transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>

                  {submitted && !submitting && (
                    <p className="text-xs md:text-sm text-green-400/80">
                      Thank you for registering. We will get back to you soon.
                    </p>
                  )}
                </div>
              </div>
            </form>

            <div className="relative z-10 mt-10 pt-6 border-t border-white/5">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-white/40 mb-3">
                Check your application status
              </p>
              <form
                onSubmit={handleCheckStatus}
                className="flex flex-col md:flex-row gap-3 md:items-center"
              >
                <input
                  type="email"
                  required
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  placeholder="Enter the email you used to register"
                  className="flex-1 rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={checkingStatus}
                  className="px-6 py-2.5 rounded-full border border-white/15 bg-transparent text-[11px] uppercase tracking-[0.25em] text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {checkingStatus ? "Checking..." : "View letter"}
                </button>
              </form>

              {acceptanceInfo && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 md:px-5 md:py-5">
                  {acceptanceInfo.found ? (
                    acceptanceInfo.accepted ? (
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-green-400/80">
                          Acceptance letter
                        </p>
                        <p className="text-sm text-white">
                          Dear{" "}
                          {acceptanceInfo.fullName
                            ? acceptanceInfo.fullName
                            : "Student"}
                          ,
                        </p>
                        {(acceptanceBodyOverride ?? defaultAcceptanceBody)
                          .split(/\n{2,}/)
                          .map((para, idx) => (
                            <p
                              key={idx}
                              className={
                                idx ===
                                (acceptanceBodyOverride ?? defaultAcceptanceBody)
                                  .split(/\n{2,}/).length -
                                1
                                  ? "text-sm text-white/70"
                                  : "text-sm text-white/80"
                              }
                            >
                              {para}
                            </p>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/75">
                        We found your application. It is currently still being
                        reviewed. Please check back later for your acceptance
                        letter.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-red-300/80">
                      We could not find a registration with that email address.
                      Please make sure you entered the same email used in the
                      registration form.
                    </p>
                  )}
                </div>
              )}
            </div>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}
