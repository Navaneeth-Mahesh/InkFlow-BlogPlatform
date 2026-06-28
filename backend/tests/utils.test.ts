import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../src/utils/token";
import { toSlug, generateUniqueSlug } from "../src/utils/slug";
import { estimateReadTime } from "../src/utils/readTime";
import { buildMeta } from "../src/utils/pagination";
import { Model } from "mongoose";

describe("token utils", () => {
  it("generates an access token that verifies back to the same payload", () => {
    const token = generateAccessToken({ sub: "user123", username: "alex", role: "user" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user123");
    expect(payload.role).toBe("user");
  });

  it("generates a refresh token that verifies back to the same subject", () => {
    const token = generateRefreshToken({ sub: "user456" });
    expect(verifyRefreshToken(token).sub).toBe("user456");
  });

  it("throws when verifying a tampered access token", () => {
    const token = generateAccessToken({ sub: "user789", username: "x", role: "user" });
    expect(() => verifyAccessToken(token.slice(0, -2) + "ab")).toThrow();
  });

  it("does not verify an access token using the refresh secret", () => {
    const token = generateAccessToken({ sub: "u1", username: "x", role: "user" });
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});

describe("toSlug", () => {
  it("lowercases and hyphenates a title", () => {
    expect(toSlug("The Quiet Cost of Context Switching")).toBe("the-quiet-cost-of-context-switching");
  });
  it("strips punctuation", () => {
    expect(toSlug("What's Next? A Guide.")).toBe("whats-next-a-guide");
  });
});

describe("generateUniqueSlug", () => {
  function mockModel(existingSlugs: string[]): Model<any> {
    return { exists: jest.fn(async (q: { slug: string }) => (existingSlugs.includes(q.slug) ? { _id: "x" } : null)) } as unknown as Model<any>;
  }

  it("returns the base slug when not taken", async () => {
    expect(await generateUniqueSlug(mockModel([]), "Hello World")).toBe("hello-world");
  });

  it("appends -2 when the base slug is taken", async () => {
    expect(await generateUniqueSlug(mockModel(["hello-world"]), "Hello World")).toBe("hello-world-2");
  });
});

describe("estimateReadTime", () => {
  it("strips HTML before counting words", () => {
    expect(estimateReadTime("<p>" + "word ".repeat(200) + "</p>")).toBe(1);
  });
  it("scales with word count", () => {
    expect(estimateReadTime("<p>" + "word ".repeat(1000) + "</p>")).toBe(5);
  });
});

describe("buildMeta", () => {
  it("computes totalPages and hasMore correctly", () => {
    const meta = buildMeta(25, { page: 1, limit: 10, skip: 0 });
    expect(meta.totalPages).toBe(3);
    expect(meta.hasMore).toBe(true);
  });
  it("reports hasMore=false on the last page", () => {
    expect(buildMeta(25, { page: 3, limit: 10, skip: 20 }).hasMore).toBe(false);
  });
});
