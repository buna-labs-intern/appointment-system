import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next();
  };
};

export default validateRequest;