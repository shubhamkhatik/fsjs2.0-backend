import { Router } from "express";
import {
  createCollection,
  deleteCollection,
  getAllCollection,
  updateCollection,
} from "../controllers/collection.controller.js";
import { isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";

const router = Router();

router.post("/", isLoggedIn, authorize(AuthRoles.ADMIN,AuthRoles.MODERATOR), createCollection);
router.put("/:id", isLoggedIn, authorize(AuthRoles.ADMIN), updateCollection);

// delete a single collection
router.delete("/:id", isLoggedIn, authorize(AuthRoles.ADMIN), deleteCollection);

//get all collection
router.get("/", getAllCollection);

export default router;
