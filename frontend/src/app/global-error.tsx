"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-[#0c0c13] px-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-6 w-6 text-[#ff6f59]" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Something tore on this page</h1>
          <p className="text-white/60 mt-3 leading-relaxed text-sm">An unexpected error interrupted this render. Try again, or head back to the home feed.</p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="secondary" asChild>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error can render when the router/providers have crashed, so a plain anchor is the safe fallback here */}
              <a href="/">Back home</a>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
