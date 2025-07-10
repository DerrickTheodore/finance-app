import { Router } from "express";
import { protect as authMiddleware } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./controllers.js";
import {
  CategoryIdParamsSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from "./schemas.js";

const router: Router = Router();

// Apply auth middleware to all category routes
router.use(authMiddleware);

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
