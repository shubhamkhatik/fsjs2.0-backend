import mongoose from "mongoose";
import asyncHandler from "../service/asyncHandler.js";

export const withSession = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  req.session = session;
  next();
});
