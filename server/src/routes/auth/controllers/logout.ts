import { NextFunction, Request, Response } from "express";

export const logout = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};
