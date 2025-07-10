import express, { RequestHandler, Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { getMe, login, logout, signup } from "./controllers.js";
import { LoginBody, SignupBody } from "./schemas.js";

const authRouter: Router = express.Router();

authRouter.post(
  "/login",
  validateRequest({ body: LoginBody }),
  login as unknown as RequestHandler
);
authRouter.post(
  "/signup",
  validateRequest({ body: SignupBody }),
  signup as unknown as RequestHandler
);
authRouter.post("/logout", logout as unknown as RequestHandler);
authRouter.get(
  "/me",
  protect as RequestHandler,
  getMe as unknown as RequestHandler
);

export default authRouter;
