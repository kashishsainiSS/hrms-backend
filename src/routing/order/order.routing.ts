import express from "express";
import authenticate from "../../modules/config/authenticate";
import { createOrderPaymentService, createOrderService, getUserOrderService, verifyOrderPaymentService } from "../../services/order/order.service";

const router = express.Router();

router.post("/create", authenticate, createOrderService);
router.post('/get',authenticate,getUserOrderService)
router.post('/create/payment',authenticate, createOrderPaymentService)
router.post('/verify/payment',authenticate,verifyOrderPaymentService)
export default router;