import { z } from "zod";

// Define Zod schema for getTransactions query parameters
export const GetTransactionsQuery = z.object({
  plaidItemId: z.string().min(1, "Plaid Item ID is required."), // Changed from accessToken to plaidItemId
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format."),
  account_ids: z.preprocess(
    (val) => {
      if (val === undefined) {
        return undefined;
      }
      if (typeof val === "string") {
        const result = [val];
        return result;
      }
      if (Array.isArray(val)) {
        return val;
      }
      return val; // Let Zod catch other invalid types
    },
    z
      .array(z.string().min(1, "Account ID string in array cannot be empty.")) // Each string in array must be non-empty
      .min(1, "If 'account_ids' is provided, it must be a non-empty array.") // The array itself must be non-empty if present
      .optional() // The entire 'account_ids' field is optional
  ),
  count: z.coerce.number().int().positive().optional(), // Added count as top-level
  offset: z.coerce.number().int().nonnegative().optional(), // Added offset as top-level
});

// Define Zod schema for exchangePublicToken request body
export const ExchangePublicTokenBody = z.object({
  public_token: z.string().min(1, "Public token is required."),
  metadata: z
    .object({
      institution: z
        .object({
          name: z.string().optional(),
          institution_id: z.string().optional(),
        })
        .optional(),
      accounts: z // Use the imported Account type for validation
        .array(
          z.object({
            id: z.string(), // id is required for Account type
            name: z.string(), // name is required for Account type
            mask: z.string().nullable().optional(), // mask is optional and can be null
            type: z.string(), // type is required for Account type
            subtype: z.string().nullable().optional(), // subtype is optional and can be null
            verification_status: z.string().nullable().optional(),
            // Add other fields from the shared Account type if necessary for validation
            // For example, if balance fields are expected from Plaid Link metadata:
            // current_balance: z.number().nullable().optional(),
            // available_balance: z.number().nullable().optional(),
            // iso_currency_code: z.string().nullable().optional(),
          })
        )
        .optional(),
      link_session_id: z.string().optional(),
    })
    .optional(),
});

// Define Zod schema for createLinkToken request body (expects an empty object or specific, optional params)
export const CreateLinkTokenBody = z.object({}).strict(); // Strict ensures no extra properties are allowed

export const DeletePlaidItemParams = z.object({
  plaidItemId: z.string().min(1, "Plaid Item ID is required."),
});
