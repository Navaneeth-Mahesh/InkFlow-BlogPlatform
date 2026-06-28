"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/3d/particle-field";
import { GradientMesh } from "@/components/3d/gradient-mesh";

const stats = [
  { label: "Writers publishing weekly", value: "12,400+" },
  { label: "Essays published this year", value: "86,200" },
  { label: "Avg. reading time saved from clutter", value: "3.2 min" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <GradientMesh />
      <ParticleField count={20} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-text-secondary"
          >
            <PenLine className="h-3.5 w-3.5 text-accent-violet" />
            Where ideas get the space to develop
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-[2.75rem] sm:text-[3.75rem] lg:text-[4.5rem] font-semibold leading-[1.04] tracking-tight text-text-primary mt-6"
          >
            Writing that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic text-accent-violet">flows</span>
              <motion.svg viewBox="0 0 200 16" className="absolute -bottom-2 left-0 w-full h-4 z-0" preserveAspectRatio="none">
                <motion.path
                  d="M2 10C40 3 80 14 100 8C130 0 160 12 198 6"
                  stroke="var(--accent-coral)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                />
              </motion.svg>
            </span>{" "}
            from the first draft to the last reader.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl"
          >
            InkFlow is a quieter place to publish — built for writers who want their words read closely, and readers
            who are tired of skimming past the same ten headlines.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" asChild className="gap-2">
              <Link href="/register">
                Start writing free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/feed">Read the feed</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass-panel px-5 py-4 border border-border">
              <p className="font-display text-2xl font-semibold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-tertiary mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
