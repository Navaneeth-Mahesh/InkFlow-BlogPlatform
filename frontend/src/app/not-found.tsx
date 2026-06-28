import Link from "next/link";
import { PenLine } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { GradientMesh } from "@/components/3d/gradient-mesh";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 relative overflow-hidden flex items-center justify-center min-h-[60vh] px-4">
        <GradientMesh className="opacity-50" />
        <div className="relative z-10 text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-surface-sunken border border-border flex items-center justify-center mx-auto mb-6">
            <PenLine className="h-6 w-6 text-accent-violet" />
          </div>
          <p className="font-mono text-sm text-accent-violet mb-3">404</p>
          <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">This page ran out of ink</h1>
          <p className="text-text-secondary mt-3 leading-relaxed">The story you&apos;re looking for might have been moved, renamed, or never existed in the first place.</p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <Button asChild><Link href="/">Back home</Link></Button>
            <Button variant="secondary" asChild><Link href="/feed">Browse the feed</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
