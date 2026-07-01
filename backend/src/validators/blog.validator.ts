import { body, param, query } from "express-validator";

export const createBlogValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 160 }),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("excerpt").optional().trim().isLength({ max: 220 }),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ min: 2, max: 40 })
    .withMessage("Category must be between 2 and 40 characters"),
  body("tags").optional().isArray({ max: 6 }).withMessage("You can add up to 6 tags"),
  body("coverImage").optional().trim().isString(),
  body("status").optional().isIn(["published", "draft"]),
];

export const updateBlogValidator = [
  param("id").isMongoId().withMessage("Invalid blog id"),
  body("title").optional().trim().isLength({ max: 160 }),
  body("content").optional().trim().notEmpty(),
  body("excerpt").optional().trim().isLength({ max: 220 }),
  body("category").optional().trim().isLength({ min: 2, max: 40 }).withMessage("Category must be between 2 and 40 characters"),
  body("tags").optional().isArray({ max: 6 }),
  body("status").optional().isIn(["published", "draft"]),
];

export const blogIdValidator = [param("id").isMongoId().withMessage("Invalid blog id")];
export const blogSlugValidator = [param("slug").trim().notEmpty().withMessage("Slug is required")];

export const listBlogsValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("category").optional().trim(),
  query("tag").optional().trim(),
  query("author").optional().trim(),
  query("sort").optional().isIn(["latest", "popular", "discussed", "trending"]),
  query("q").optional().trim(),
];
