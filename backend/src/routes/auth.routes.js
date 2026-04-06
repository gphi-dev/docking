import { Router } from "express";
import { loginAdmin } from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginAdmin));
