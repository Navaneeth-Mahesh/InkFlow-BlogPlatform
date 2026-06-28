import { Request, Response, NextFunction } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errors = result.array().map((err) => ({
      field: err.type === "field" ? err.path : undefined,
      message: err.msg,
    }));

    next(ApiError.badRequest("Validation failed", errors));
  };
}
