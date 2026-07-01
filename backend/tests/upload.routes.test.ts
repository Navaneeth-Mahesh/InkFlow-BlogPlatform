import request from "supertest";
import { generateAccessToken } from "../src/utils/token";

jest.mock("../src/models", () => ({
  User: { exists: jest.fn().mockResolvedValue(true) },
  Blog: {},
  Comment: {},
  Bookmark: {},
  Category: {},
}));

jest.mock("../src/services/upload.service", () => ({
  uploadImageBuffer: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { uploadImageBuffer } = require("../src/services/upload.service");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("../src/app");

const app = createApp();
const USER_ID = "64a000000000000000000010";

function token() {
  return generateAccessToken({ sub: USER_ID, username: "felix.adeyemi", role: "user" });
}

describe("POST /api/v1/upload/image", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/v1/upload/image")
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "cover.jpg", contentType: "image/jpeg" });
    expect(res.status).toBe(401);
  });

  it("rejects a request with no file attached, with a clear message", async () => {
    const res = await request(app).post("/api/v1/upload/image").set("Authorization", `Bearer ${token()}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no image file provided/i);
  });

  it("rejects a disallowed file type with a specific message instead of a generic 500", async () => {
    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token()}`)
      .attach("image", Buffer.from("not an image"), { filename: "notes.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JPEG, PNG, WEBP, or GIF/i);
  });

  it("rejects a file over the 5MB limit with a specific message instead of a generic 500 (issue #2 fix)", async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1024);
    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token()}`)
      .attach("image", oversized, { filename: "huge.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/5MB limit/i);
  });

  it("accepts a valid image under 5MB and returns the uploaded url", async () => {
    uploadImageBuffer.mockResolvedValueOnce({ url: "/uploads/cover-123.jpg", publicId: "cover-123.jpg" });

    const small = Buffer.alloc(1024 * 200);
    const res = await request(app)
      .post("/api/v1/upload/image")
      .set("Authorization", `Bearer ${token()}`)
      .attach("image", small, { filename: "cover.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toBe("/uploads/cover-123.jpg");
  });
});
