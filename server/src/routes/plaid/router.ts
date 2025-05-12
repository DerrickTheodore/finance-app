import express, { Router } from "express";
import {
  createLinkTokenController,
  exchangePublicTokenController,
  getTransactionsController,
} from "./controllers.js";

const router: Router = express.Router();

router.post("/create_link_token", createLinkTokenController);
router.post("/exchange_public_token", exchangePublicTokenController);
router.get("/transactions", getTransactionsController);

export default router;
