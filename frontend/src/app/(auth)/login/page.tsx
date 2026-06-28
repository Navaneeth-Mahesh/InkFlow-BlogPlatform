"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/shared/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/use-app-state";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [form, setForm] = React.useState({ email: "", password: "" });

  function validate() {
    const next: typeof errors = {};
    if (!form.email) next.email = "Enter the email you signed up with.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "That email doesn't look right.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function performLogin(email: string, password: string, isDemo: boolean) {
    isDemo ? setDemoLoading(true) : setLoading(true);
    try {
      await login(email, password);
      toast({ variant: "success", title: "Welcome back", description: "You're signed in." });
      router.push("/feed");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Couldn't reach the InkFlow server. Make sure the backend is running on port 5000.";
      toast({ variant: "error", title: "Couldn't sign in", description: message });
    } finally {
      isDemo ? setDemoLoading(false) : setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    performLogin(form.email, form.password, false);
  }

  function handleDemoLogin() {
    // Matches the account created by the backend's seed script (npm run seed).
    performLogin("demo@inkflow.app", "password123", true);
  }

  return (
    <AuthShell testimonialIndex={0}>
      <h1 className="font-display text-[1.85rem] font-semibold text-text-primary tracking-tight">Welcome back</h1>
      <p className="text-text-secondary text-sm mt-2">Sign in to keep reading and pick up your drafts.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-accent-coral mt-1.5">
              {errors.email}
            </motion.p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-xs text-accent-violet hover:underline mb-1.5">Forgot password?</Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              aria-invalid={!!errors.password}
              className="pr-11"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-accent-coral mt-1.5">
              {errors.password}
            </motion.p>
          )}
        </div>

        <Button type="submit" size="lg" className="mt-2 gap-2" disabled={loading || demoLoading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </Button>

        <div className="relative flex items-center my-1">
          <div className="flex-1 h-px bg-border" />
          <span className="px-3 text-xs text-text-tertiary">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button type="button" variant="secondary" size="lg" onClick={handleDemoLogin} disabled={loading || demoLoading} className="gap-2">
          {demoLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue with demo account
        </Button>
      </form>

      <p className="text-sm text-text-secondary mt-8 text-center">
        New to InkFlow?{" "}
        <Link href="/register" className="text-accent-violet font-medium hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
