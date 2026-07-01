import request from "supertest";
import { generateAccessToken } from "../src/utils/token";

jest.mock("../src/models", () => ({
  User: { exists: jest.fn().mockResolvedValue(true) },
  Blog: {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    updateOne: jest.fn(),
  },
  Comment: {},
  Bookmark: { deleteMany: jest.fn() },
  Category: { findOne: jest.fn(), create: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Blog, Category, Bookmark } = require("../src/models");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("../src/app");

const app = createApp();

const OWNER_ID = "64a000000000000000000010";
const OTHER_USER_ID = "64a000000000000000000099";
const BLOG_ID = "64a000000000000000000020";

function tokenFor(userId: string) {
  return generateAccessToken({ sub: userId, username: "tomas.bergstrom", role: "user" });
}

describe("POST /api/v1/blogs (create)", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).post("/api/v1/blogs").send({ title: "A new post", content: "<p>content</p>", category: "Technology" });
    expect(res.status).toBe(401);
  });

  it("creates a blog using an existing category matched by name", async () => {
    Category.findOne.mockResolvedValueOnce({ _id: "64a000000000000000000030", name: "Technology", slug: "technology" });
    Blog.exists.mockResolvedValueOnce(false);
    const createdBlog = {
      _id: BLOG_ID,
      title: "A new post",
      slug: "a-new-post",
      author: OWNER_ID,
      populate: jest.fn().mockResolvedValue({ _id: BLOG_ID, title: "A new post" }),
    };
    Blog.create.mockResolvedValueOnce(createdBlog);

    const res = await request(app)
      .post("/api/v1/blogs")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ title: "A new post", content: "<p>content</p>", category: "Technology" });

    expect(res.status).toBe(201);
    expect(Category.create).not.toHaveBeenCalled();
  });

  it("creates a brand-new category when the typed name doesn't already exist (issue #1 fix)", async () => {
    Category.findOne.mockResolvedValueOnce(null);
    Category.create.mockResolvedValueOnce({ _id: "64a000000000000000000031", name: "Underwater Basket Weaving", slug: "underwater-basket-weaving" });
    Blog.exists.mockResolvedValueOnce(false);
    const createdBlog = {
      _id: BLOG_ID,
      title: "A custom-category post",
      slug: "a-custom-category-post",
      author: OWNER_ID,
      populate: jest.fn().mockResolvedValue({ _id: BLOG_ID, title: "A custom-category post" }),
    };
    Blog.create.mockResolvedValueOnce(createdBlog);

    const res = await request(app)
      .post("/api/v1/blogs")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ title: "A custom-category post", content: "<p>content</p>", category: "Underwater Basket Weaving" });

    expect(res.status).toBe(201);
    expect(Category.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Underwater Basket Weaving", slug: "underwater-basket-weaving" })
    );
  });

  it("rejects a category name shorter than 2 characters", async () => {
    const res = await request(app)
      .post("/api/v1/blogs")
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ title: "A new post", content: "<p>content</p>", category: "x" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/v1/blogs/:id — issue #5 delete blog", () => {
  it("requires authentication", async () => {
    const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}`);
    expect(res.status).toBe(401);
  });

  it("returns 404 when the blog does not exist", async () => {
    Blog.findById.mockResolvedValueOnce(null);
    const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}`).set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`);
    expect(res.status).toBe(404);
  });

  it("forbids deleting another user's blog", async () => {
    Blog.findById.mockResolvedValueOnce({ _id: BLOG_ID, author: OWNER_ID });
    const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}`).set("Authorization", `Bearer ${tokenFor(OTHER_USER_ID)}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/only delete your own/i);
  });

  it("allows the owner to delete their own blog and cleans up its bookmarks", async () => {
    const deleteOne = jest.fn().mockResolvedValue(undefined);
    Blog.findById.mockResolvedValueOnce({ _id: BLOG_ID, author: OWNER_ID, deleteOne });
    Bookmark.deleteMany.mockResolvedValueOnce({ deletedCount: 2 });

    const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}`).set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(deleteOne).toHaveBeenCalled();
    expect(Bookmark.deleteMany).toHaveBeenCalledWith({ blog: BLOG_ID });
  });

  it("allows an admin to delete someone else's blog", async () => {
    const deleteOne = jest.fn().mockResolvedValue(undefined);
    Blog.findById.mockResolvedValueOnce({ _id: BLOG_ID, author: OWNER_ID, deleteOne });
    Bookmark.deleteMany.mockResolvedValueOnce({ deletedCount: 0 });

    const adminToken = generateAccessToken({ sub: OTHER_USER_ID, username: "admin", role: "admin" });
    const res = await request(app).delete(`/api/v1/blogs/${BLOG_ID}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(deleteOne).toHaveBeenCalled();
  });

  it("rejects an invalid blog id format", async () => {
    const res = await request(app).delete("/api/v1/blogs/not-a-valid-id").set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/v1/blogs/:id (update)", () => {
  it("forbids a user who does not own the blog", async () => {
    Blog.findById.mockResolvedValueOnce({ _id: BLOG_ID, author: OWNER_ID, title: "Original" });
    const res = await request(app)
      .patch(`/api/v1/blogs/${BLOG_ID}`)
      .set("Authorization", `Bearer ${tokenFor(OTHER_USER_ID)}`)
      .send({ title: "Hijacked title" });
    expect(res.status).toBe(403);
  });

  it("allows the owner to update their own blog", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const populate = jest.fn().mockResolvedValue({ _id: BLOG_ID, title: "Updated title" });
    Blog.findById.mockResolvedValueOnce({ _id: BLOG_ID, author: OWNER_ID, title: "Original", save, populate });

    const res = await request(app)
      .patch(`/api/v1/blogs/${BLOG_ID}`)
      .set("Authorization", `Bearer ${tokenFor(OWNER_ID)}`)
      .send({ title: "Updated title" });

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
  });
});

describe("GET /api/v1/blogs/slug/:slug", () => {
  it("returns 404 for a nonexistent slug", async () => {
    Blog.findOne.mockReturnValueOnce({ populate: jest.fn().mockResolvedValueOnce(null) });
    const res = await request(app).get("/api/v1/blogs/slug/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns a published blog to an anonymous reader", async () => {
    Blog.findOne.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValueOnce({ _id: BLOG_ID, slug: "a-new-post", status: "published", author: { _id: OWNER_ID }, title: "A new post" }),
    });
    const res = await request(app).get("/api/v1/blogs/slug/a-new-post");
    expect(res.status).toBe(200);
    expect(res.body.data.blog.title).toBe("A new post");
  });
});
