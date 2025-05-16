import * as express from "express";
import authRouter from "./auth/router.js";
import plaidRouter from "./plaid/router.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/plaid", plaidRouter);

export default router;
