"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../src/utils/token");
const slug_1 = require("../src/utils/slug");
const readTime_1 = require("../src/utils/readTime");
const pagination_1 = require("../src/utils/pagination");
describe("token utils", () => {
    it("generates an access token that verifies back to the same payload", () => {
        const token = (0, token_1.generateAccessToken)({ sub: "user123", username: "alex", role: "user" });
        const payload = (0, token_1.verifyAccessToken)(token);
        expect(payload.sub).toBe("user123");
        expect(payload.role).toBe("user");
    });
    it("generates a refresh token that verifies back to the same subject", () => {
        const token = (0, token_1.generateRefreshToken)({ sub: "user456" });
        expect((0, token_1.verifyRefreshToken)(token).sub).toBe("user456");
    });
    it("throws when verifying a tampered access token", () => {
        const token = (0, token_1.generateAccessToken)({ sub: "user789", username: "x", role: "user" });
        expect(() => (0, token_1.verifyAccessToken)(token.slice(0, -2) + "ab")).toThrow();
    });
    it("does not verify an access token using the refresh secret", () => {
        const token = (0, token_1.generateAccessToken)({ sub: "u1", username: "x", role: "user" });
        expect(() => (0, token_1.verifyRefreshToken)(token)).toThrow();
    });
});
describe("toSlug", () => {
    it("lowercases and hyphenates a title", () => {
        expect((0, slug_1.toSlug)("The Quiet Cost of Context Switching")).toBe("the-quiet-cost-of-context-switching");
    });
    it("strips punctuation", () => {
        expect((0, slug_1.toSlug)("What's Next? A Guide.")).toBe("whats-next-a-guide");
    });
});
describe("generateUniqueSlug", () => {
    function mockModel(existingSlugs) {
        return { exists: jest.fn(async (q) => (existingSlugs.includes(q.slug) ? { _id: "x" } : null)) };
    }
    it("returns the base slug when not taken", async () => {
        expect(await (0, slug_1.generateUniqueSlug)(mockModel([]), "Hello World")).toBe("hello-world");
    });
    it("appends -2 when the base slug is taken", async () => {
        expect(await (0, slug_1.generateUniqueSlug)(mockModel(["hello-world"]), "Hello World")).toBe("hello-world-2");
    });
});
describe("estimateReadTime", () => {
    it("strips HTML before counting words", () => {
        expect((0, readTime_1.estimateReadTime)("<p>" + "word ".repeat(200) + "</p>")).toBe(1);
    });
    it("scales with word count", () => {
        expect((0, readTime_1.estimateReadTime)("<p>" + "word ".repeat(1000) + "</p>")).toBe(5);
    });
});
describe("buildMeta", () => {
    it("computes totalPages and hasMore correctly", () => {
        const meta = (0, pagination_1.buildMeta)(25, { page: 1, limit: 10, skip: 0 });
        expect(meta.totalPages).toBe(3);
        expect(meta.hasMore).toBe(true);
    });
    it("reports hasMore=false on the last page", () => {
        expect((0, pagination_1.buildMeta)(25, { page: 3, limit: 10, skip: 20 }).hasMore).toBe(false);
    });
});
//# sourceMappingURL=utils.test.js.map