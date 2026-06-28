"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { getCategories } from "@/lib/services";
import { mapCategory } from "@/lib/mappers";
import { Category } from "@/types";
import { AtSign, Rss, Globe } from "lucide-react";

export function Footer() {
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    getCategories()
      .then((raw) => setCategories(raw.map(mapCategory).slice(0, 5)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="border-t border-border bg-bg-elevated mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Logo animated={false} />
            <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-xs">
              A home for writers and readers who care about the craft. No noise, just writing worth your attention.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[AtSign, Rss, Globe].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="h-9 w-9 rounded-full flex items-center justify-center text-text-tertiary hover:text-accent-violet hover:bg-surface-sunken transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-4">Explore</h4>
            <ul className="flex flex-col gap-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/search?category=${c.slug}`} className="text-sm text-text-secondary hover:text-accent-violet transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              {["About InkFlow", "Writer guidelines", "Membership", "Careers"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-text-secondary hover:text-accent-violet transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary mb-4">Legal</h4>
            <ul className="flex flex-col gap-2.5">
              {["Terms of use", "Privacy policy", "Cookie policy"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-text-secondary hover:text-accent-violet transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">© {new Date().getFullYear()} InkFlow. Built for people who still read to the end.</p>
          <p className="text-xs text-text-tertiary font-mono">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
