export function GradientMesh({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className ?? ""}`} aria-hidden="true">
      <div className="mesh-blob absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, var(--accent-violet) 0%, transparent 70%)" }} />
      <div className="mesh-blob absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle, var(--accent-coral) 0%, transparent 70%)", animationDelay: "-8s" }} />
      <div className="mesh-blob absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)", animationDelay: "-14s" }} />
    </div>
  );
}
