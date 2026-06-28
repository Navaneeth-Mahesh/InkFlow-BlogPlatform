"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ParticleField } from "@/components/3d/particle-field";
import { GradientMesh } from "@/components/3d/gradient-mesh";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "InkFlow is the first place I've published where the comments actually engage with the argument instead of the headline.",
    name: "Priya Nair",
    role: "Climate journalist",
  },
  {
    quote: "The editor gets out of my way. I write more here in a week than I used to write in a month elsewhere.",
    name: "Marcus Webb",
    role: "Design lead",
  },
];

export function AuthShell({ children, testimonialIndex = 0 }: { children: React.ReactNode; testimonialIndex?: number }) {
  const t = testimonials[testimonialIndex % testimonials.length];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-sm">
            {children}
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-ink-900 items-center justify-center p-16">
        <GradientMesh />
        <ParticleField count={26} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="relative z-10 max-w-md">
          <Quote className="h-9 w-9 text-accent-coral/70 mb-6" />
          <p className="font-display text-2xl text-white leading-snug">{t.quote}</p>
          <div className="mt-6">
            <p className="text-white font-medium text-sm">{t.name}</p>
            <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
          </div>
          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[["12.4K", "Writers"], ["86K", "Essays"], ["340K", "Monthly readers"]].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-xl font-semibold text-white">{value}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
