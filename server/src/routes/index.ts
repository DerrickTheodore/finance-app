import * as express from "express";
import { Router } from "express"; // Import Router type
import authRouter from "./auth/router.js";
import plaidRouter from "./plaid/router.js";

const router: Router = express.Router(); // Add Router type annotation

router.use("/auth", authRouter);
router.use("/plaid", plaidRouter);

export default router;
