
import { Router } from "express";
import { addProduct,deleteProduct,getAllProducts,getProductById,getProductByCollectionId } from "../controllers/product.controller.js";
import {  isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRoles.js";



const router = Router()
//TOodo: add all routes here
router.post("/add",isLoggedIn,authorize(AuthRoles.ADMIN,AuthRoles.MODERATOR), addProduct)
router.delete("/:id",isLoggedIn,authorize(AuthRoles.ADMIN,AuthRoles.MODERATOR), deleteProduct)
router.get("/",isLoggedIn, getAllProducts)
router.get("/:id",isLoggedIn, getProductById)
router.get("/collection/:id",isLoggedIn, getProductByCollectionId)

export default router;