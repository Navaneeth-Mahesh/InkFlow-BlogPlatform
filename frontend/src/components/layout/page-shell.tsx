import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
