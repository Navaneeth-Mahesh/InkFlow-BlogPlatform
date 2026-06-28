"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  depth: number;
  duration: number;
  delay: number;
  shape: "circle" | "ring" | "dash";
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 14,
      depth: 0.4 + Math.random() * 0.8,
      duration: 14 + Math.random() * 16,
      delay: Math.random() * -20,
      shape: i % 5 === 0 ? "ring" : i % 7 === 0 ? "dash" : "circle",
    });
  }
  return particles;
}

export function ParticleField({ count = 22 }: { count?: number }) {
  const particles = React.useMemo(() => generateParticles(count), [count]);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const [reducedMotion] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  React.useEffect(() => {
    if (reducedMotion) return;
    let frame: number;
    const handleMove = (e: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            x: reducedMotion ? 0 : mouse.x * p.depth * 14,
            y: reducedMotion ? 0 : mouse.y * p.depth * 14,
          }}
          animate={reducedMotion ? undefined : { y: ["0%", "-6%", "0%", "5%", "0%"], opacity: [0.15, 0.45, 0.3, 0.5, 0.15] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {p.shape === "circle" && (
            <span className="block rounded-full" style={{ width: p.size, height: p.size, background: p.id % 3 === 0 ? "var(--accent-coral)" : "var(--accent-violet)", opacity: 0.5, filter: "blur(0.5px)" }} />
          )}
          {p.shape === "ring" && (
            <span className="block rounded-full border-2" style={{ width: p.size * 1.6, height: p.size * 1.6, borderColor: "var(--accent-violet-soft)", opacity: 0.4 }} />
          )}
          {p.shape === "dash" && (
            <span className="block rounded-full" style={{ width: p.size * 1.8, height: 2, background: "var(--accent-coral)", opacity: 0.4, transform: `rotate(${p.id * 23}deg)` }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
