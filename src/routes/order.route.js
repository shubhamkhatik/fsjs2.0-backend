import { Router } from "express";
import { generateOrder, generateRazorpayOrderId, getAllOrders, getMyOrders, updateOrderStatus,cancelOrder } from "../controllers/order.controller.js";
import {  isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import { withSession } from "../middlewares/session.transaction.js";
import AuthRoles from "../utils/authRoles.js";



const router = Router()
//TOodo: add all routes here
router.post("/",isLoggedIn, generateRazorpayOrderId)
router.post("/generateorder",isLoggedIn,withSession, generateOrder)
router.get("/",isLoggedIn, getMyOrders)
router.get("/getallorders",isLoggedIn, authorize(AuthRoles.ADMIN),getAllOrders)
router.put("/",isLoggedIn, authorize(AuthRoles.ADMIN),updateOrderStatus)
router.put("/cancel",isLoggedIn, authorize(AuthRoles.USER),cancelOrder)

export default router;