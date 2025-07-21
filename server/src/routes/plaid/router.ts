import authorize from "@/middleware/authMiddleware.js";
import express, { Router } from "express"; // Import RequestHandler
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createLinkToken,
  deletePlaidItemController, // Import deletePlaidItemController
  exchangePublicToken,
  getPlaidItems,
  getTransactions,
} from "./controllers/index.js";
import {
  DeletePlaidItemParams,
  ExchangePublicTokenBody,
  GetTransactionsQuery,
} from "./schemas.js";

const router: Router = express.Router();

router.use(authorize);

router.post("/create-link-token", createLinkToken);
router.post(
  "/exchange-public-token",
  validateRequest({ body: ExchangePublicTokenBody }),
  exchangePublicToken
);
router.get("/items", getPlaidItems);
router.get(
  "/transactions",
  validateRequest({ query: GetTransactionsQuery }),
  getTransactions
);
router.delete(
  "/items/:plaidItemId",
  validateRequest({ params: DeletePlaidItemParams }),
  deletePlaidItemController
);

export default router;
