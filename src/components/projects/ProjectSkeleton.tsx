"use client";

import { motion } from "framer-motion";

export function ProjectCardSkeleton() {
  return (
    <div className="bg-[#050505] border border-white/5 rounded-[24px] overflow-hidden">
      {/* Project Image Skeleton */}
      <div className="aspect-[16/10] bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>

      {/* Project Info Skeleton */}
      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="w-full bg-black">
      {/* 1. Main Content Skeleton (Image + Text) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="py-20">
          {/* Image Skeleton */}
          <div className="aspect-[21/9] w-full bg-[#050505] border border-white/5 rounded-[32px] overflow-hidden mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pb-20">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-24 bg-white/5 border border-white/5 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
