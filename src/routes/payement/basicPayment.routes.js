import {Router} from "express";

const router = Router();

router.use(verifyJWT);

router.route("/provider/razorpay").post(mongoIdRequestBodyValidator("razorpayId"), validate, generateRazorpayOrder);

router.route("/provider/razorpay/verify-payment").post(verifyRazorpayPaymentValidator(), validate, verifyRazorpayPayment);

export default router;