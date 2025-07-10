import {
  Category,
  PlaidItemModel,
  Transaction,
} from "@myfi/infra/database/drizzle/schema/models";
import { Request, Response } from "express";
import { ParsedQs } from "qs"; // Import ParsedQs

// Define a structure for the user object that will be attached to the request
export interface AuthenticatedUser {
  id: string; // Or number, depending on your user ID type
  // Add other user properties if needed, e.g., email, roles
}

// Extend Express Request type to include the authenticated user
export interface AuthenticatedRequest<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: AuthenticatedUser; // User is optional as not all requests will be authenticated
  validatedParams?: P;
  validatedBody?: ReqBody;
  validatedQuery?: ReqQuery;
}

// For controllers that expect an authenticated request, ensuring req.user is present
export interface AppRouteAuthenticatedController<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  // Ensure ReqQuery defaults to ParsedQs if not provided by Zod schema inference
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> extends AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: AuthenticatedUser; // User is explicitly required for these controllers
  // validatedParams, validatedBody, validatedQuery are inherited from AuthenticatedRequest
  // and will be typed based on P, ReqBody, ReqQuery respectively.
  // If Zod parsing occurs, these will hold the parsed values.
  // Specifically, ReqQuery will be inferred from the Zod schema if provided to validateRequest.
}

// Standard controller type (can be used for unauthenticated routes or as a base)
export interface AppRouteController<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {}

// For response bodies that are simple messages
export interface MessageResponse {
  message: string;
}

// For responses that might send a known error structure or a success payload
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Specific type for Express responses to allow for more type-safe res.send/json usage
export interface TypedResponse<ResBody> extends Response {
  json(body?: ResBody): this;
  send(body?: ResBody): this;
}

export type {
  Category,
  NewCategory,
  NewPlaidItemModel,
  NewTransaction,
  NewTransactionCategory,
  NewUser,
  PlaidItemModel,
  Transaction,
  TransactionCategory,
  User,
} from "@myfi/infra/database/drizzle/schema/models";

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  verification_status: string | null;
  class_type: string | null;
  balances: {
    available: number | null;
    current: number;
    iso_currency_code: string;
    limit: number | null;
    unofficial_currency_code: string | null;
  };
}

export interface PlaidItemWithAccounts extends PlaidItemModel {
  accounts: PlaidAccount[];
}

export interface TransactionWithCategories extends Transaction {
  categories: Category[];
}
