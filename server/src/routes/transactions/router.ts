import { Router } from "express";
import { authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  getTransactionsHandler,
  linkTransactionToCategoryHandler,
  unlinkTransactionFromCategoryHandler,
} from "./controllers/index.js";
import {
  GetTransactionsQuerySchema,
  LinkTransactionCategorySchema,
  UnlinkTransactionCategorySchema,
} from "./schemas.js";

const router: Router = Router();

router.use(authorize);

router.get(
  "/",
  validateRequest({ query: GetTransactionsQuerySchema }),
  getTransactionsHandler
);

// Link a category to a transaction
router.post(
  "/:transactionId/categories",
  validateRequest({
    params: LinkTransactionCategorySchema.shape.params,
    body: LinkTransactionCategorySchema.shape.body,
  }),
  linkTransactionToCategoryHandler
);

// Unlink a category from a transaction
router.delete(
  "/:transactionId/categories/:categoryId",
  validateRequest({ params: UnlinkTransactionCategorySchema.shape.params }),
  unlinkTransactionFromCategoryHandler
);

export default router;
