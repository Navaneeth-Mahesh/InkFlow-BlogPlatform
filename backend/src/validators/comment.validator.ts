import { body, param } from "express-validator";

export const addCommentValidator = [
  param("blogId").isMongoId().withMessage("Invalid blog id"),
  body("content").trim().notEmpty().withMessage("Comment cannot be empty").isLength({ max: 2000 }).withMessage("Comment cannot exceed 2000 characters"),
  body("parentComment").optional().isMongoId().withMessage("Invalid parent comment id"),
];

export const updateCommentValidator = [
  param("id").isMongoId().withMessage("Invalid comment id"),
  body("content").trim().notEmpty().withMessage("Comment cannot be empty").isLength({ max: 2000 }),
];

export const commentIdValidator = [param("id").isMongoId().withMessage("Invalid comment id")];
