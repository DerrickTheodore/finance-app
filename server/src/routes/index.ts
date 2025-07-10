import * as express from "express";
import { Router } from "express"; // Import Router type
import authRouter from "./auth/router.js";
import categoriesRouter from "./categories/router.js"; // Import categories router
import plaidRouter from "./plaid/router.js";
import transactionsRouter from "./transactions/router.js"; // Import transactions router

const router: Router = express.Router(); // Add Router type annotation

router.use("/auth", authRouter);
router.use("/plaid", plaidRouter);
router.use("/categories", categoriesRouter); // Use categories router
router.use("/transactions", transactionsRouter); // Use transactions router

export default router;
