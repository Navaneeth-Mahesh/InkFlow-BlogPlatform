/* eslint-disable no-console */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import { User, Blog, Category, Comment, Bookmark } from "../models";
import { generateUniqueSlug } from "../utils/slug";
import { estimateReadTime } from "../utils/readTime";

const categorySeed = [
  { name: "Technology", slug: "technology", color: "#6750E3" },
  { name: "Design", slug: "design", color: "#E35D6A" },
  { name: "Climate", slug: "climate", color: "#1E8E6B" },
  { name: "Business", slug: "business", color: "#C77D2E" },
  { name: "Science", slug: "science", color: "#2E7DC7" },
  { name: "Culture", slug: "culture", color: "#A347C7" },
  { name: "Productivity", slug: "productivity", color: "#D4A017" },
  { name: "Cities", slug: "cities", color: "#5B8C8C" },
];

// Eight distinct people, no repeated first or last names, nothing resembling
// any real individual. Used once each as a blog author below.
const userSeed = [
  {
    name: "Naomi Whitfield",
    username: "naomi.whitfield",
    email: "demo@inkflow.app",
    password: "password123",
    bio: "Staff engineer writing about distributed systems, on-call culture, and the parts of the job nobody puts in a conference talk.",
  },
  {
    name: "Felix Adeyemi",
    username: "felix.adeyemi",
    email: "felix@inkflow.app",
    password: "password123",
    bio: "Product designer. I write about typography, design systems, and the craft decisions that never make it into a case study.",
  },
  {
    name: "Sofia Marchetti",
    username: "sofia.marchetti",
    email: "sofia@inkflow.app",
    password: "password123",
    bio: "Climate reporter, formerly a field hydrologist. I try to make the data feel like it matters, because it does.",
  },
  {
    name: "Desmond Carter",
    username: "desmond.carter",
    email: "desmond@inkflow.app",
    password: "password123",
    bio: "Two startups, one exit, one quiet failure I learned more from than the win. Writing it down so I remember.",
  },
  {
    name: "Hana Kobayashi",
    username: "hana.kobayashi",
    email: "hana@inkflow.app",
    password: "password123",
    bio: "Cognitive science researcher. I translate dense papers into things you can actually use on a Tuesday.",
  },
  {
    name: "Tomas Bergstrom",
    username: "tomas.bergstrom",
    email: "tomas@inkflow.app",
    password: "password123",
    bio: "Backend engineer obsessed with the unglamorous infrastructure that makes APIs feel trustworthy.",
  },
  {
    name: "Aaliyah Robinson",
    username: "aaliyah.robinson",
    email: "aaliyah@inkflow.app",
    password: "password123",
    bio: "Urban planner with a soft spot for the boring infrastructure that quietly makes cities work.",
  },
  {
    name: "Mateo Fernandez",
    username: "mateo.fernandez",
    email: "mateo@inkflow.app",
    password: "password123",
    bio: "Recipe developer and former line cook. Cooking is chemistry you can eat.",
  },
];

interface BlogSeed {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorIndex: number;
}

const blogSeed: BlogSeed[] = [
  {
    title: "The quiet cost of context switching",
    excerpt:
      "Every notification is a small tax on the thing you were actually trying to think about. Here's what eleven years of engineering management taught me about protecting attention.",
    category: "productivity",
    tags: ["focus", "engineering", "management"],
    authorIndex: 0,
    content: `
<p>There's a moment, maybe four minutes into a hard problem, where your brain finally stops loading the page. The variables you need are warm. The shape of the solution is starting to resolve out of the fog. And that is, without fail, the exact moment a Slack notification slides in from the corner of the screen.</p>
<p>I used to think the cost of that interruption was four seconds — the time it takes to read the message and decide it doesn't need a reply. I was wrong by an order of magnitude. The actual cost is the eleven to twenty-three minutes it takes to rebuild the mental state you were in before the interruption, according to research that's been replicated often enough that I've stopped being surprised by it and started being annoyed by it.</p>
<h2>The myth of the quick reply</h2>
<p>Every team I've managed has had at least one person who prides themselves on being responsive. They answer in under a minute, every time, and they wear it like a badge. I used to reward this. Now I think it's one of the most quietly expensive habits an engineering org can cultivate, because responsiveness and depth are not the same currency, and you cannot spend one to buy the other.</p>
<blockquote>Protecting attention isn't about discipline. It's about design — designing your day so the default path doesn't require willpower to follow.</blockquote>
<h2>What actually changed our team's output</h2>
<ul>
<li>We made "do not disturb" the default state during the first 90 minutes of the day.</li>
<li>We separated "needs a reply today" from "needs a reply now" as an explicit field, not a vibe.</li>
<li>We started ending stand-up with one question: what's the one thing that, if interrupted, costs you the most today?</li>
</ul>
<p>None of this is revolutionary. It's almost embarrassingly simple. But simple isn't the same as easy, and the org-level habit of treating every message as equally urgent is one of the hardest things to unwind once it's load-bearing in your culture.</p>
<h2>The part that's actually about trust</h2>
<p>If you dig into why teams over-index on responsiveness, it's rarely about the work. It's about anxiety. Managers worry that if they can't see activity, nothing is happening. The fix isn't a tool. It's an explicit conversation about what "doing well" looks like that doesn't route through response time.</p>
<p>I still get the urge to reply instantly. Eleven years in, the instinct hasn't gone away. What's changed is that I now recognize it as exactly that — an instinct, not a virtue.</p>`,
  },
  {
    title: "Designing type scales that don't fight back",
    excerpt: "Most type scales fall apart at the extremes — too cramped at small sizes, too loose at large ones. Here's a more honest way to build one.",
    category: "design",
    tags: ["typography", "design-systems"],
    authorIndex: 1,
    content: `
<p>Open the design tokens file of almost any product built in the last five years and you'll find a type scale built on a single ratio — 1.25, 1.333, the golden ratio if someone was feeling ambitious — applied uniformly from a 12px caption all the way up to a 64px hero. It looks principled in Figma. It falls apart the moment real content hits it.</p>
<p>The problem is that ratios are a single-variable solution to a problem with at least three variables: size, line length, and reading distance.</p>
<h2>Where uniform scales break</h2>
<p>At small sizes — captions, metadata, table cells — a tight ratio keeps things from feeling arbitrary. At the body-to-subhead range, you have the most freedom and the most responsibility, because this is where people actually read.</p>
<p>At display sizes, ratios stop being useful entirely. Nobody perceives a 48px headline as "1.25x more important" than a 38px one in any meaningful way. What you actually want at the top of the scale is a small number of hand-picked sizes that correspond to real use cases.</p>
<blockquote>A type scale isn't a formula you apply. It's a formula you start with and then argue with, size by size, until it earns its place.</blockquote>
<h2>A more honest process</h2>
<ol>
<li>Start with body text. Get the 16–18px reading size exactly right for your actual columns.</li>
<li>Build downward with a tight ratio for two or three utility sizes.</li>
<li>Build upward by ratio for two steps, then break from the formula and hand-pick your display sizes.</li>
<li>Pair every size with its own line-height and letter-spacing value.</li>
</ol>
<p>This takes longer than typing a ratio into a generator. It also produces a scale that reads like it was designed for the product instead of generated for a slide.</p>
<h2>The part about restraint</h2>
<p>The best type systems I've used in production have somewhere between seven and nine sizes total. Constraint is the feature, not the cost.</p>`,
  },
  {
    title: "The rivers that forecasts can't see",
    excerpt: "Atmospheric rivers move more water than the Amazon, and most of our flood models still treat them as noise. A look at the science we're only starting to catch up to.",
    category: "climate",
    tags: ["climate-science", "weather"],
    authorIndex: 2,
    content: `
<p>There's a river running through the sky over the Pacific right now, and it is carrying roughly twenty-five times the volume of water the Mississippi discharges at its mouth. It has no banks, no name most people would recognize, and until about fifteen years ago, it barely had a place in operational forecasting at all.</p>
<p>Atmospheric rivers — long, narrow corridors of concentrated water vapor that stretch thousands of kilometers across an ocean — are responsible for a wildly disproportionate share of the world's flood damage and, when they're weak or absent, a wildly disproportionate share of its drought relief.</p>
<h2>Why the models still struggle</h2>
<p>The technical challenge is one of scale mismatch. Atmospheric rivers are narrow — often less than 500 kilometers wide — embedded in a global circulation pattern that climate models traditionally render in cells far coarser than that.</p>
<blockquote>We've gotten good at knowing a river is coming. We're still catching up on knowing exactly where it intends to step ashore.</blockquote>
<h2>The forecasting tool nobody outside the field has heard of</h2>
<p>The most useful recent addition to the forecaster's toolkit has a deliberately unglamorous name: the AR Scale, a five-category system ranking rivers by both intensity and duration rather than intensity alone.</p>
<p>What's notable about the scale is what it implicitly admits: that duration, not just peak intensity, is often the variable that turns a normal storm into a disaster.</p>
<h2>What getting this right is worth</h2>
<p>Water agencies in California have started using ensemble forecasts of atmospheric rivers to inform reservoir operations — releasing water proactively ahead of a known incoming river instead of holding it defensively. That's the quiet promise underneath all of this: an old, underappreciated feature of the water cycle that we're only now building the instruments to actually see.</p>`,
  },
  {
    title: "What my second failed startup actually taught me",
    excerpt: "The first failure taught me about product. The second one, the quiet one, taught me about myself — and that lesson was much more expensive.",
    category: "business",
    tags: ["startups", "founder-life"],
    authorIndex: 3,
    content: `
<p>My first startup failed loudly. We ran out of money, I sent the email everyone dreads writing, and within a month I was telling the story at dinner parties with enough rehearsed self-deprecation that it almost sounded charming. My second startup failed quietly, over about fourteen months, and it took me nearly two years after to understand what it had actually taught me.</p>
<h2>The trap of competence</h2>
<p>Here's what made the second one dangerous: I was good at it. I knew the playbook. I shipped fast, I talked to customers every week, I had the unit economics dashboard a YC partner would nod approvingly at. Every individual decision was defensible. And the whole thing was wrong, because I had built a product I was skilled at building rather than a product anyone was desperate for.</p>
<blockquote>The scariest failures aren't the ones where you can see your mistakes. They're the ones where you executed your plan flawlessly and the plan still wasn't worth executing.</blockquote>
<h2>How I actually figured it out</h2>
<p>It wasn't a single epiphany. It was a slow accumulation of small, uncomfortable data points I'd been explaining away — customers who signed up enthusiastically and then quietly churned, every month, without complaint. I'd been treating "no complaints" as a positive signal. It wasn't. It was indifference.</p>
<h2>What I do differently now</h2>
<p>The question I ask every week isn't "is this going well." It's "who would be genuinely upset if this disappeared tomorrow." If I can't name real people for that question, I treat it as the most urgent problem in the company, regardless of what the rest of the metrics say.</p>`,
  },
  {
    title: "Why your brain lies to you about multitasking",
    excerpt: "You're not actually doing two things at once. You never were. A look at what the switching-cost research actually shows.",
    category: "science",
    tags: ["neuroscience", "cognition"],
    authorIndex: 4,
    content: `
<p>Ask someone if they can multitask and most people will say yes, with mild confidence, often while doing two things at the time you ask. Ask a cognitive scientist the same question and you'll get a much flatter answer: no, not in any sense that matters.</p>
<h2>The switch has a cost, and it's not small</h2>
<p>Each switch carries what researchers call a "switch cost" — a measurable delay and accuracy drop that occurs every time you reorient from one task's rules to another's. It's small per-switch, which is exactly why it feels free. But the cost compounds, and it compounds nonlinearly as task complexity increases.</p>
<blockquote>The brain isn't running two programs. It's a single-core processor with a very convincing UI that makes rapid switching feel like parallel execution.</blockquote>
<h2>Why the myth survives anyway</h2>
<p>People persist in believing they multitask well because the feeling of being busy and the fact of being productive are not the same signal, and the brain is much better at registering the first one.</p>
<h2>What the research actually recommends</h2>
<p>Not heroic four-hour blocks — the evidence for those is thinner than productivity culture suggests. The more consistent finding is that batching similar-type tasks together recovers most of the switching cost without requiring monastic discipline. The honest takeaway is knowing which kind of task you're actually in before you let yourself switch.</p>`,
  },
  {
    title: "The unsexy infrastructure behind every good API",
    excerpt: "Nobody writes a blog post about their rate limiter. They should — it's usually the difference between an API that scales gracefully and one that falls over.",
    category: "technology",
    tags: ["engineering", "apis", "backend"],
    authorIndex: 5,
    content: `
<p>Every API tutorial teaches you how to define a route, validate a request, and return a response. Almost none of them teach you what happens the first time a client sends ten thousand requests in a minute because their retry logic has a bug — and that gap is where most production incidents I've actually debugged have come from.</p>
<h2>Rate limiting is a product decision, not just an engineering one</h2>
<p>The most common mistake is a fixed window — exactly sixty requests per exact clock minute — which sounds reasonable until you realize a client can send sixty requests at 11:59:59 and another sixty at 12:00:01, doubling their effective rate for two seconds with the rule technically intact.</p>
<blockquote>The best rate limiter is the one your well-behaved clients never notice and your misbehaving ones can't get around.</blockquote>
<h2>The part everyone forgets: communicating the limit</h2>
<p>A rate limit that returns a bare 429 with no further information is functionally hostile to the developer on the other end. Return the limit, the remaining count, and the reset time in response headers on every request, not just the rejected ones.</p>
<h2>Idempotency keys: the other unglamorous hero</h2>
<p>Without idempotency key support on endpoints with side effects, a client's retry after a timeout — correct, defensive behavior on their end — can create a duplicate side effect on yours. Implementing it isn't complicated. Almost nobody designs for it until after the first incident makes the cost concrete.</p>`,
  },
  {
    title: "The intersection that explains a whole city",
    excerpt: "Most people walk past the infrastructure that makes their commute possible without ever seeing it. A close look at one unglamorous intersection and everything it's quietly doing.",
    category: "cities",
    tags: ["urban-planning", "infrastructure"],
    authorIndex: 6,
    content: `
<p>There's an intersection three blocks from where I used to work that I must have crossed two thousand times before I actually looked at it as a planner instead of a pedestrian. It is, on its face, completely unremarkable. It is also one of the most quietly over-engineered pieces of infrastructure I've ever studied.</p>
<h2>The turn lane that isn't really about turning</h2>
<p>The dedicated left-turn lane exists, ostensibly, to let turning cars clear the intersection without blocking through traffic. Its primary function, in this intersection's signal timing, is actually to create a protected window during which the crosswalk gets an extended "walk" phase.</p>
<blockquote>The best infrastructure is invisible by design. You only notice it when it's gone.</blockquote>
<h2>The bus stop placement nobody questions</h2>
<p>The bus stop sits just past the intersection rather than just before it — "far-side" placement. Near-side stops force buses to stop, then immediately wait through a red light, compounding delay. Far-side placement also keeps a stopped bus from blocking the sightline between a turning driver and the crosswalk.</p>
<h2>Why most people never notice any of this</h2>
<p>Good infrastructure doesn't generate stories. It prevents them. Most of the time, the difference between a street that frustrates people and one that doesn't isn't a grand redesign — it's two or three small decisions like this one, made correctly, that nobody will ever think to thank anyone for.</p>`,
  },
  {
    title: "The physics of a perfect sauce",
    excerpt: "Emulsification isn't kitchen magic, it's colloid chemistry, and understanding the actual mechanism will fix more broken sauces than any recipe tip.",
    category: "culture",
    tags: ["cooking", "food-science"],
    authorIndex: 7,
    content: `
<p>A broken hollandaise looks like a small culinary tragedy and is, mechanically, an extremely boring physics problem: you asked oil and water to mix permanently, and they declined, because that is what oil and water do unless you force the issue with the right intermediary.</p>
<h2>What an emulsifier is actually doing</h2>
<p>An emulsifier molecule has two ends with different personalities: one end is hydrophilic, happy in water, and the other is lipophilic, happy in fat. When you whisk, the emulsifier molecules position themselves at the boundary between every tiny droplet of fat and the surrounding water.</p>
<blockquote>A sauce doesn't break because you did something wrong in a moral sense. It breaks because the droplets got too big, too fast, for the emulsifier you gave them to keep up.</blockquote>
<h2>Why sauces actually break</h2>
<p>Breaking happens when fat droplets coalesce faster than your emulsifier can coat new surface area — usually because you added fat too quickly, or because heat thinned the mixture enough that droplets could move and merge more freely.</p>
<h2>The practical upshot</h2>
<ul>
<li>Add fat slowly at the start of any emulsion, because early droplets need time to get coated.</li>
<li>Mustard in vinaigrette isn't flavor, primarily — it's a genuinely effective emulsifier.</li>
<li>A "broken" sauce is almost always salvageable, because the emulsifier and fat are both still there.</li>
</ul>
<p>None of this makes cooking less of a craft. Knowing the mechanism makes the craft more interesting, because you stop following instructions and start making decisions.</p>`,
  },
  {
    title: "Building a second brain that doesn't become a second job",
    excerpt: "Most note-taking systems collapse under their own maintenance burden within three months. Here's the minimal version that's survived four years for me.",
    category: "productivity",
    tags: ["notes", "systems"],
    authorIndex: 0,
    content: `
<p>I have started, and abandoned, four different elaborate note-taking systems over the years. Each one had tags, backlinks, a review cadence, and a YouTube video that made it look effortless. Each one died the same way: the maintenance cost quietly exceeded the value it returned.</p>
<h2>The one rule that matters</h2>
<p>Every note-taking system I abandoned had an organizing step between capturing a thought and finding it again. That step is where all of them died, because organizing well takes judgment, and judgment takes energy you don't have at capture time.</p>
<blockquote>A note system that requires a decision at capture time will lose to your actual schedule eventually.</blockquote>
<h2>Where the organizing actually happens</h2>
<p>Instead of organizing at capture time, I organize at retrieval time, and only for notes I'm actually using for something. This inverts the standard advice: most systems ask you to do speculative organizing work upfront, betting that future-you will benefit. In practice, future-you rarely benefits, because present-you doesn't actually know yet which notes will matter.</p>
<h2>The honest tradeoff</h2>
<p>This system is genuinely bad at serendipitous discovery. If that's valuable to your work, you may need more structure than this. The deeper lesson wasn't really about note-taking software — it was recognizing that a system's theoretical capability and its actual sustained use are different metrics.</p>`,
  },
  {
    title: "A design system's postmortem, three years in",
    excerpt: "We built a design system to move faster. Three years later, it's the thing slowing us down the most. What we'd do differently.",
    category: "design",
    tags: ["design-systems", "product"],
    authorIndex: 1,
    content: `
<p>Three years ago, we built a design system with the explicit promise that it would make us faster. For about eighteen months, it did. Then, slowly, it became one of the heaviest things to change in the entire product.</p>
<h2>The early win was real</h2>
<p>The first year was genuinely great. We went from five inconsistent button implementations to one. The win was real and it was fast, which is exactly why it's the part everyone quotes.</p>
<h2>What the case studies don't mention</h2>
<p>What they don't mention is what happens in year two, when the system has enough adoption that changing it requires coordinating across a dozen teams instead of one.</p>
<blockquote>A design system doesn't fail by being abandoned. It fails by becoming the slow path, until every team finds a faster path around it.</blockquote>
<h2>The actual root cause</h2>
<p>We'd built the system to optimize for consistency as the primary goal, when consistency should have been a downstream effect of a system optimized for velocity. Optimizing for consistency first produces a system that resists change, because change threatens the thing it's optimizing for.</p>
<h2>What we're changing</h2>
<p>We're restructuring around a tiered model: a small, genuinely stable core, and a much looser, faster-moving layer of composed patterns that individual teams can fork and extend without needing central approval to ship.</p>`,
  },
  {
    title: "What coral bleaching actually looks like up close",
    excerpt: "Bleaching is usually described in statistics. I spent a week with researchers who see it happen in real time, and the statistics undersell what's actually being lost.",
    category: "climate",
    tags: ["climate-science", "oceans"],
    authorIndex: 2,
    content: `
<p>The first thing the researchers told me, before we even got in the water, was not to expect it to look dramatic. Bleached coral doesn't look destroyed. It looks pale, almost luminous, the way a photograph looks washed out when you push the exposure too far.</p>
<h2>What's actually happening biologically</h2>
<p>Coral gets its color, and most of its energy, from a symbiotic relationship with microscopic algae living inside its tissue. When water temperatures rise even one or two degrees above the seasonal norm for an extended period, the coral expels those algae — and with them, both the color and the primary energy source.</p>
<blockquote>A reef can survive one bad summer. What it's increasingly being asked to survive is one bad summer after another, with less recovery time between them.</blockquote>
<h2>The thing the data can't quite convey</h2>
<p>I've written the statistic many times — global coral cover has declined by roughly half since the 1950s — and it never quite lands the way being in the water does. The bleached section, even before any structural collapse, goes quiet in a way that's hard to describe without sounding sentimental.</p>
<h2>The researchers who keep doing this anyway</h2>
<p>Several of them have been surveying the same reef sections for over a decade, which means they have a kind of grief that's also a kind of expertise. After a decade of watching the same patch of reef, the line between data point and something closer to a relationship gets harder to hold than any methodology section would suggest.</p>`,
  },
  {
    title: "The economics of being a working musician now",
    excerpt: "Streaming didn't kill the music business. It just moved the money somewhere most musicians never see. Here's where it actually goes.",
    category: "culture",
    tags: ["music", "creator-economy"],
    authorIndex: 3,
    content: `
<p>I spent six years touring in a band that, by most outside measures, was doing well. We sold out mid-size venues. And for most of those six years, three of the five of us had a second job, because the math of recorded music in the streaming era doesn't work the way audiences assume it does.</p>
<h2>The split nobody explains clearly</h2>
<p>A stream generates revenue that gets divided between the platform, the rights holders for the recording, and the rights holders for the composition — and the recording side is where most independent musicians lose the most ground, because unless you own your master recordings outright, a meaningful share goes to a label or distributor before it ever reaches you.</p>
<blockquote>Streaming pays like a lottery with very good odds for a tiny number of players and very bad odds for everyone else.</blockquote>
<h2>So where does the money actually come from</h2>
<p>For every working musician I know who's actually paying rent from music, the order of revenue importance looks almost nothing like the order the public imagines. Streaming is rarely above fourth. Above it: live performance, merchandise, and sync licensing.</p>
<h2>What I'd tell someone starting now</h2>
<p>Treat streaming as discovery infrastructure, not income, from day one. Build the direct relationship with listeners early, because it's the only revenue channel that isn't controlled by an intermediary who can change the terms without asking you.</p>`,
  },
];

async function seed() {
  await connectDB();
  console.log("Connected. Clearing existing data (deleting collection documents)...");
  await Promise.all([
    User.deleteMany({}),
    Blog.deleteMany({}),
    Category.deleteMany({}),
    Comment.deleteMany({}),
    Bookmark.deleteMany({}),
  ]);

  console.log("Rebuilding indexes...");
  await Promise.all([
    User.createIndexes(),
    Blog.createIndexes(),
    Category.createIndexes(),
    Comment.createIndexes(),
    Bookmark.createIndexes(),
  ]);

  console.log("Seeding categories...");
  const categories = await Category.insertMany(categorySeed);
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  console.log("Seeding users...");
  const users = [];
  for (const u of userSeed) {
    users.push(await User.create(u));
  }

  console.log("Seeding blogs...");
  for (const b of blogSeed) {
    const category = categoryBySlug.get(b.category);
    if (!category) continue;
    const slug = await generateUniqueSlug(Blog, b.title);
    await Blog.create({
      title: b.title,
      slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: "",
      category: category._id,
      tags: b.tags,
      author: users[b.authorIndex]._id,
      status: "published",
      publishedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
      readTime: estimateReadTime(b.content),
      views: Math.floor(Math.random() * 5000) + 200,
    });
  }

  console.log("Seed complete:");
  console.log(`  ${categories.length} categories`);
  console.log(`  ${users.length} users (password for all: "password123")`);
  console.log(`  Demo login: demo@inkflow.app / password123`);
  console.log(`  ${blogSeed.length} blogs`);

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
