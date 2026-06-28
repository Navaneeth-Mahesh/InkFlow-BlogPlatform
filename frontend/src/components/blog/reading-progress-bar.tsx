"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgressBar({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <motion.div style={{ scaleX, transformOrigin: "0% 50%" }} className="h-full bg-gradient-to-r from-accent-violet to-accent-coral" />
    </div>
  );
}
