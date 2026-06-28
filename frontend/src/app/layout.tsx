import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AppProvider } from "@/hooks/use-app-state";
import { Toaster } from "@/components/shared/toaster";

export const metadata: Metadata = {
  title: "InkFlow — Writing that flows",
  description:
    "InkFlow is a home for writers and readers who care about the craft. Publish, discover, and discuss long-form writing without the noise.",
  keywords: ["blogging platform", "writing", "publishing", "InkFlow"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
