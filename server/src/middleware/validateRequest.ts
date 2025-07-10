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
        (req as any).validatedParams = await validators.params.parseAsync(
          req.params
        );
        // console.log('[validateRequest] req.params after validation:', JSON.stringify(req.params));
      }
      if (validators.body) {
        (req as any).validatedBody = await validators.body.parseAsync(req.body);
        // console.log('[validateRequest] req.body after validation:', JSON.stringify(req.body));
      }
      if (validators.query) {
        const parsedQuery = await validators.query.parseAsync(req.query);
        (req as any).validatedQuery = parsedQuery; // Use req.validatedQuery
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
