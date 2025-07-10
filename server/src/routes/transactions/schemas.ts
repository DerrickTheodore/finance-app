import { z } from "zod";

export const LinkTransactionCategorySchema = z.object({
  params: z.object({
    transactionId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Transaction ID must be a number",
    }),
  }),
  body: z.object({
    categoryId: z
      .number()
      .int()
      .positive("Category ID must be a positive integer"),
  }),
});

export const UnlinkTransactionCategorySchema = z.object({
  params: z.object({
    transactionId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Transaction ID must be a number",
    }),
    categoryId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Category ID must be a number",
    }),
  }),
});

export const GetTransactionsQuerySchema = z.object({
  plaidItemId: z.string(),
  account_ids: z.array(z.string()),
  startDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Start date must be in YYYY-MM-DD format",
  }),
  endDate: z.string().refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "End date must be in YYYY-MM-DD format",
  }),
});

export const TransactionIdParamSchema = z.object({
  params: z.object({
    transactionId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Transaction ID must be a number",
    }),
  }),
});
