import { z } from "zod";

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    color: z.string().optional(), // Added color
    icon: z.string().optional(), // Added icon
  }),
});

export const UpdateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Category ID must be a number",
    }),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").max(255).optional(), // Optional for partial updates
    color: z.string().optional(), // Added color
    icon: z.string().optional(), // Added icon
  }),
});

export const CategoryIdParamsSchema = z.object({
  params: z.object({
    categoryId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Category ID must be a number",
    }),
  }),
});
