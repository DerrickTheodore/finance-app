import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

interface RequestValidators {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest =
  (validators: RequestValidators) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params);
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
        return; // Ensure void return after sending response
      }
      // For other errors, pass them to the default error handler
      next(error);
    }
  };
