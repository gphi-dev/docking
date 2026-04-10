import { Router } from "express";
import {
  listUsermobile,
  getGameByPhone,
  createUsermobile,
  getUsermobileSubscribedGame // 1. IMPORT THE MISSING CONTROLLER HERE
} from "../controllers/usermobile.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const usermobileRouter = Router();

// GET /usermobile
usermobileRouter.get("/", asyncHandler(listUsermobile));

// GET /usermobile/games/:gameId 
usermobileRouter.get("/games/:gameId", asyncHandler(getUsermobileSubscribedGame));

// GET /usermobile/:phone
usermobileRouter.get("/:phone", asyncHandler(getGameByPhone));

// POST /usermobile 
usermobileRouter.post("/usermobile", asyncHandler(createUsermobile));