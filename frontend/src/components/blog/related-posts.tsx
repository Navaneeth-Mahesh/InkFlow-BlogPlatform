import { Post } from "@/types";
import { BlogCard } from "@/components/shared/blog-card";
import { Reveal } from "@/components/shared/reveal";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="border-t border-border pt-14">
      <Reveal>
        <h2 className="font-display text-2xl font-semibold text-text-primary tracking-tight mb-7">You might also like</h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.08}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
