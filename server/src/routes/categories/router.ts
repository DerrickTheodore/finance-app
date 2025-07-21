import authorize from "@/middleware/authMiddleware.js";
import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./controllers/index.js";
import {
  CategoryIdParamsSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from "./schemas.js";

const router: Router = Router();

router.use(authorize); // Ensure the user is authenticated

router.post(
  "/",
  validateRequest({ body: CreateCategorySchema.shape.body }), // Pass the inner body schema
  createCategory
);

router.get("/", getCategories);

router.get(
  "/:categoryId",
  validateRequest({ params: CategoryIdParamsSchema.shape.params }), // Pass the inner params schema
  getCategoryById
);

router.put(
  "/:categoryId",
  validateRequest({
    params: UpdateCategorySchema.shape.params,
    body: UpdateCategorySchema.shape.body,
  }), // Pass inner params and body schemas
  updateCategory
);

router.delete(
  "/:categoryId",
  validateRequest({ params: CategoryIdParamsSchema.shape.params }), // Pass the inner params schema
  deleteCategory
);

export default router;
