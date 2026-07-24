import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import AppError from "../utils/AppError";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Something went wrong";
    let errorMessages: any[] = [];

    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errorMessages = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
    });
};

export default globalErrorHandler;