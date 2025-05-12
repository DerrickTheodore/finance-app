import type { Request, Response } from "express";

// Define RequestController type alias for cleaner controller definitions
// The return type is Promise<void> because Express expects async controllers to eventually resolve without returning a value (response is sent via res object)
export type AppRequestController<
  ReqParams = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>
) => Promise<void>;

// Common Error Response Model
export interface ErrorResponseModel {
  error_code?: string;
  error_message: string;
  display_message?: string | null;
  action_required?: string;
}
