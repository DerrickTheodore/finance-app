import authenicate from "@/middleware/authMiddleware.js";
import express, { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { login, logout, me, signup } from "./controllers/index.js";
import { LoginBody, SignupBody } from "./schemas.js";

const authRouter: Router = express.Router();

authRouter.post("/login", validateRequest({ body: LoginBody }), login);
authRouter.post("/signup", validateRequest({ body: SignupBody }), signup);
authRouter.post("/logout", logout);
authRouter.get("/me", authenicate, me);

export default authRouter;
