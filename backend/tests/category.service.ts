jest.mock("../src/models", () => ({
  Category: { findOne: jest.fn(), create: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Category } = require("../src/models");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { findOrCreateCategory } = require("../src/services/category.service");

describe("findOrCreateCategory", () => {
  it("returns an existing category matched by slug", async () => {
    const existing = { _id: "1", name: "Technology", slug: "technology" };
    Category.findOne.mockResolvedValueOnce(existing);

    const result = await findOrCreateCategory("Technology");

    expect(result).toBe(existing);
    expect(Category.create).not.toHaveBeenCalled();
  });

  it("matches an existing category case-insensitively", async () => {
    const existing = { _id: "1", name: "Technology", slug: "technology" };
    Category.findOne.mockResolvedValueOnce(existing);

    const result = await findOrCreateCategory("technology");

    expect(result).toBe(existing);
  });

  it("creates a brand-new category when no match exists, with a derived slug and color", async () => {
    Category.findOne.mockResolvedValueOnce(null);
    const created = { _id: "2", name: "Underwater Basket Weaving", slug: "underwater-basket-weaving" };
    Category.create.mockResolvedValueOnce(created);

    const result = await findOrCreateCategory("Underwater Basket Weaving");

    expect(Category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Underwater Basket Weaving",
        slug: "underwater-basket-weaving",
        color: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
      })
    );
    expect(result).toBe(created);
  });

  it("trims whitespace from the typed category name before creating", async () => {
    Category.findOne.mockResolvedValueOnce(null);
    Category.create.mockResolvedValueOnce({ _id: "3", name: "Travel", slug: "travel" });

    await findOrCreateCategory("   Travel   ");

    expect(Category.create).toHaveBeenCalledWith(expect.objectContaining({ name: "Travel" }));
  });

  it("falls back to a 'general' slug for a name with no slugifiable characters", async () => {
    Category.findOne.mockResolvedValueOnce(null);
    Category.create.mockResolvedValueOnce({ _id: "4", name: "!!!", slug: "general" });

    await findOrCreateCategory("!!!");

    expect(Category.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "general" }));
  });
});
