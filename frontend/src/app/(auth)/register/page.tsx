"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { AuthShell } from "@/components/shared/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApp } from "@/hooks/use-app-state";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ApiClientError } from "@/lib/api-client";

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColors = [
  "var(--accent-coral)", "var(--accent-coral)", "var(--accent-gold)", "var(--accent-emerald)", "var(--accent-violet)",
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [form, setForm] = React.useState({ name: "", username: "", email: "", password: "" });

  const strength = getStrength(form.password);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Tell us what to call you.";
    if (!form.username.trim()) next.username = "Pick a username.";
    else if (!/^[a-z0-9._]+$/i.test(form.username)) next.username = "Use only letters, numbers, dots, or underscores.";
    if (!form.email) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "That email doesn't look right.";
    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!agreed) next.agreed = "Accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast({ variant: "success", title: "Account created", description: `Welcome to InkFlow, ${form.name.split(" ")[0]}.` });
      router.push("/feed");
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        const field = err.message.includes("email") ? "email" : "username";
        setErrors((prev) => ({ ...prev, [field]: err.message }));
      } else {
        toast({
          variant: "error",
          title: "Couldn't create account",
          description:
            err instanceof ApiClientError
              ? err.message
              : "Couldn't reach the InkFlow server. Make sure the backend is running on port 5000.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell testimonialIndex={1}>
      <h1 className="font-display text-[1.85rem] font-semibold text-text-primary tracking-tight">Create your account</h1>
      <p className="text-text-secondary text-sm mt-2">Start publishing in less than a minute. No credit card needed.</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jordan Lee" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-accent-coral mt-1.5">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="jordan.lee" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} aria-invalid={!!errors.username} />
            {errors.username && <p className="text-xs text-accent-coral mt-1.5">{errors.username}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-accent-coral mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              aria-invalid={!!errors.password}
              className="pr-11"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {form.password && (
            <div className="mt-2.5">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-surface-sunken overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: i < strength ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ height: "100%", background: strengthColors[strength], transformOrigin: "left" }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-1.5 font-medium" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
            </div>
          )}
          {errors.password && <p className="text-xs text-accent-coral mt-1.5">{errors.password}</p>}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer mt-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed((a) => !a)}
            className={cn(
              "mt-0.5 h-[18px] w-[18px] shrink-0 rounded-md border flex items-center justify-center transition-colors",
              agreed ? "bg-accent-violet border-accent-violet" : "border-border-strong bg-surface"
            )}
          >
            {agreed && <Check className="h-3 w-3 text-white" />}
          </button>
          <span className="text-[13px] text-text-secondary leading-snug">
            I agree to the <Link href="#" className="text-accent-violet hover:underline">Terms of Use</Link> and{" "}
            <Link href="#" className="text-accent-violet hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-accent-coral -mt-2">{errors.agreed}</p>}

        <Button type="submit" size="lg" className="mt-2 gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <p className="text-sm text-text-secondary mt-7 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-violet font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
