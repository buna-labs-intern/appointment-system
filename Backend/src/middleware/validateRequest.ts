// src/middleware/validateRequest.ts
import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ✅ Fix: Use error.issues instead of error.errors
        const errors = error.issues.map((err: any) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        });
      } else {
        next(error);
      }
    }
  };
};

export default validateRequest;