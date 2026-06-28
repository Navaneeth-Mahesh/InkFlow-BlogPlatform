"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/3d/gradient-mesh";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 sm:px-16 py-16 sm:py-20 text-center"
      >
        <GradientMesh className="opacity-60" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-[2.75rem] font-semibold text-white leading-[1.1] tracking-tight">
            Your next essay deserves a quieter home.
          </h2>
          <p className="mt-4 text-white/65 text-base sm:text-lg leading-relaxed">
            No ad-driven feed, no engagement bait — just a clean editor, a reader who finishes what they start, and a
            platform that gets out of the way.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="coral" asChild className="gap-2">
              <Link href="/register">
                Create your account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/25 text-white hover:bg-white/10">
              <Link href="/feed">Explore stories</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
