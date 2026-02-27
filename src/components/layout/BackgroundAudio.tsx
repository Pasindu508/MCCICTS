"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import playPauseAnimation from "../../../public/system-solid-26-play-morph-play-pause.json";

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const refDoc = doc(db, "settings", "backgroundAudio");
        const snapshot = await getDoc(refDoc);
        if (snapshot.exists()) {
          const data = snapshot.data() as { url?: string };
          if (data.url && typeof data.url === "string") {
            setAudioUrl(data.url);
          }
        }
      } catch (error) {
        console.error("Error fetching background audio:", error);
      }
    };

    fetchAudio();
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (enabled && audioUrl) {
      el
        .play()
        .catch(() => {});
    } else {
      el.pause();
    }
  }, [enabled, audioUrl]);

  useEffect(() => {
    const handleGlobalPointerDown = () => {
      const el = audioRef.current;
      if (!el) return;
      if (!enabled || !audioUrl) return;
      if (!el.paused) return;

      el
        .play()
        .catch(() => {});
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", handleGlobalPointerDown);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pointerdown", handleGlobalPointerDown);
      }
    };
  }, [enabled, audioUrl]);

  useEffect(() => {
    if (!lottieRef.current) return;
    lottieRef.current.setDirection(enabled ? 1 : -1);
    lottieRef.current.play();
  }, [enabled]);

  const handleToggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      const el = audioRef.current;
      if (el && audioUrl) {
        if (next) {
          el
            .play()
            .catch(() => {});
        } else {
          el.pause();
        }
      }

      return next;
    });
  };

  return (
    <>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
        />
      )}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-[9998] p-2.5 text-[10px] text-white/60 hover:text-white transition-colors flex items-center justify-center"
        aria-label="Toggle background music"
        title={enabled ? "Mute music" : "Play music"}
        disabled={!audioUrl}
      >
        <div className="bg-audio-icon w-6 h-6">
          <Lottie
            lottieRef={lottieRef}
            animationData={playPauseAnimation}
            loop={false}
            autoplay={false}
          />
        </div>
      </button>
    </>
  );
}
