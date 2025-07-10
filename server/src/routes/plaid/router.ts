import express, { RequestHandler, Router } from "express"; // Import RequestHandler
import { protect } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createLinkToken,
  deletePlaidItemController, // Import deletePlaidItemController
  exchangePublicToken,
  getPlaidItems,
  getTransactions,
} from "./controllers.js";
import {
  CreateLinkTokenBody, // Import the new schema
  ExchangePublicTokenBody,
  GetTransactionsQuery, // Import GetTransactionsQuery
} from "./schemas.js";

const router: Router = express.Router();

// Apply the protect middleware to all routes in this router
router.use(protect as RequestHandler); // Cast protect to RequestHandler

router.post(
  "/create-link-token",
  validateRequest({ body: CreateLinkTokenBody }), // Add validation for create-link-token
  createLinkToken as unknown as RequestHandler // Cast controller to RequestHandler
);
router.post(
  "/exchange-public-token",
  validateRequest({ body: ExchangePublicTokenBody }),
  exchangePublicToken as unknown as RequestHandler // Cast controller to RequestHandler
);
router.get(
  "/transactions",
  validateRequest({ query: GetTransactionsQuery }), // Re-enable validation
  getTransactions as unknown as RequestHandler // Cast controller to RequestHandler
);

// Route to get Plaid items for the user
router.get(
  "/items",
  getPlaidItems as unknown as RequestHandler // Cast controller to RequestHandler
);

// Route to delete a Plaid item
router.delete(
  "/items/:plaidItemId", // Use :plaidItemId as a URL parameter
  // No Zod validation schema for params yet, but could be added:
  // validateRequest({ params: z.object({ plaidItemId: z.string() }) }),
  deletePlaidItemController as unknown as RequestHandler
);

export default router;
