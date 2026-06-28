import request from "supertest";

jest.mock("../src/models", () => ({
  User: { findOne: jest.fn(), findById: jest.fn(), create: jest.fn(), exists: jest.fn() },
  Blog: { exists: jest.fn() },
  Comment: {},
  Bookmark: {},
  Category: {},
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { User } = require("../src/models");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require("../src/app");

const app = createApp();

describe("POST /api/v1/auth/register", () => {
  it("rejects a request missing required fields", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("rejects when email or username is already taken", async () => {
    User.findOne.mockResolvedValueOnce({ email: "naomi@inkflow.app", username: "naomi.whitfield" });
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Naomi Whitfield",
      username: "naomi.whitfield",
      email: "naomi@inkflow.app",
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("creates an account and returns an access token on success", async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: "64a000000000000000000001",
      name: "Felix Adeyemi",
      username: "felix.adeyemi",
      role: "user",
      toJSON() {
        return { id: this._id, name: this.name, username: this.username };
      },
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Felix Adeyemi",
      username: "felix.adeyemi",
      email: "felix@inkflow.app",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});

describe("POST /api/v1/auth/login", () => {
  it("rejects when user does not exist", async () => {
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(null) });
    const res = await request(app).post("/api/v1/auth/login").send({ email: "nouser@example.com", password: "password123" });
    expect(res.status).toBe(401);
  });

  it("logs in successfully with correct credentials", async () => {
    const fakeUser = {
      _id: "64a000000000000000000003",
      username: "sofia.marchetti",
      role: "user",
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ username: "sofia.marchetti" }),
    };
    User.findOne.mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(fakeUser) });
    const res = await request(app).post("/api/v1/auth/login").send({ email: "sofia@inkflow.app", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});

describe("404 handling", () => {
  it("returns a standardized 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/this-route-does-not-exist");
    expect(res.status).toBe(404);
  });
});
