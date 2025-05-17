import express, { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createLinkTokenController,
  exchangePublicTokenController,
  getTransactionsController,
  GetTransactionsQuerySchema,
} from "./controllers.js";

const router: Router = express.Router();

router.post("/create_link_token", createLinkTokenController);
router.post("/exchange_public_token", exchangePublicTokenController);
router.get(
  "/transactions",
  validateRequest({ query: GetTransactionsQuerySchema }),
  getTransactionsController
);

export default router;
