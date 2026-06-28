"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PenSquare, Bell, Menu, X, Bookmark, User, LogOut, Settings, FileText } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/hooks/use-app-state";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Explore" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [scrolled, setScrolled] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "glass-panel shadow-[var(--shadow-token-sm)]" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Logo animated={false} className="shrink-0" />

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium transition-colors",
                  active ? "text-text-primary bg-surface-sunken" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-sm ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search articles, authors, topics…"
              className="w-full h-10 rounded-full border border-border bg-surface-sunken pl-10 pr-4 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-violet focus:ring-4 focus:ring-accent-violet/10 transition-all"
            />
          </div>
        </form>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-1.5">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((s) => !s)}
            className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-sunken transition-colors"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <button
                aria-label="Notifications"
                className="relative h-10 w-10 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-sunken transition-colors"
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-accent-coral" />
              </button>

              <Button variant="primary" size="sm" asChild className="ml-1 gap-1.5">
                <Link href="/create">
                  <PenSquare className="h-3.5 w-3.5" />
                  Write
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1.5 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-accent-violet">
                  <InitialsAvatar name={user.name} size="sm" className="border-2 border-border" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case font-normal px-2.5 py-2">
                    <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                    <span className="text-xs text-text-tertiary">@{user.username}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`}>
                      <User className="h-4 w-4" /> Your profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}?tab=drafts`}>
                      <FileText className="h-4 w-4" /> Your drafts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}?tab=saved`}>
                      <Bookmark className="h-4 w-4" /> Saved posts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="h-10 w-10 rounded-full flex items-center justify-center text-text-primary hover:bg-surface-sunken transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block lg:hidden overflow-hidden border-t border-border"
          >
            <form onSubmit={handleSearchSubmit} className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus type="search" placeholder="Search articles, authors, topics…" className="pl-10 rounded-full" />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border bg-bg-elevated"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search InkFlow…" className="pl-10 rounded-full" />
              </form>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="px-3 py-2.5 rounded-xl text-[15px] font-medium text-text-primary hover:bg-surface-sunken transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="h-px bg-border" />

              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <InitialsAvatar name={user.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-tertiary">@{user.username}</p>
                    </div>
                  </div>
                  <Link href="/create" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] font-medium text-text-primary hover:bg-surface-sunken transition-colors">
                    <PenSquare className="h-4 w-4" /> Write a post
                  </Link>
                  <Link href={`/profile/${user.username}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] font-medium text-text-primary hover:bg-surface-sunken transition-colors">
                    <User className="h-4 w-4" /> Your profile
                  </Link>
                  <Link href={`/profile/${user.username}?tab=saved`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] font-medium text-text-primary hover:bg-surface-sunken transition-colors">
                    <Bookmark className="h-4 w-4" /> Saved posts
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] font-medium text-accent-coral hover:bg-accent-coral/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button variant="primary" asChild>
                    <Link href="/register">Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
