import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage("Username can only contain letters, numbers, dots and underscores"),
  body("email").trim().notEmpty().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

export const loginValidator = [
  body("email").trim().notEmpty().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidator = [
  body("name").optional().trim().isLength({ max: 80 }),
  body("bio").optional().trim().isLength({ max: 280 }),
];
