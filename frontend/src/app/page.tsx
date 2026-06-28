import { PageShell } from "@/components/layout/page-shell";
import { Hero } from "@/components/home/hero";
import { FeaturedBlogs } from "@/components/home/featured-blogs";
import { TrendingTopics } from "@/components/home/trending-topics";
import { PopularAuthors } from "@/components/home/popular-authors";
import { CTASection } from "@/components/home/cta-section";

export default function LandingPage() {
  return (
    <PageShell>
      <Hero />
      <FeaturedBlogs />
      <TrendingTopics />
      <PopularAuthors />
      <CTASection />
    </PageShell>
  );
}
