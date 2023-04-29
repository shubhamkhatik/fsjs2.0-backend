import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
  disableCoupon,
} from "../controllers/coupon.controller.js";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";

const router = Router();

router.post("/", isLoggedIn, authorize(AuthRoles.ADMIN), createCoupon);

router.delete(
  "/:id",
  isLoggedIn,
  authorize(AuthRoles.ADMIN, AuthRoles.MODERATOR),
  deleteCoupon
);

router.put(
  "/action/:id",
  isLoggedIn,
  authorize(AuthRoles.ADMIN, AuthRoles.MODERATOR),
  updateCoupon
);

router.get(
  "/",
  isLoggedIn,
  authorize(AuthRoles.ADMIN, AuthRoles.MODERATOR),
  getAllCoupons
);
router.put(
  "/disableCoupon/:id",
  isLoggedIn,
  authorize(AuthRoles.ADMIN, AuthRoles.MODERATOR),
  disableCoupon
);

export default router;
