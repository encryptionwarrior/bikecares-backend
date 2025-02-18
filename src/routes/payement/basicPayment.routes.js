import {Router} from "express";
import { generateRazorPayOrder, verifyRazorpayPayment } from "../../controllers/payment/basicPayment.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { verifyRazorpayPaymentValidator } from "../../validators/payment/payment.validators.js";
import { mongoIdPathVariableValidator, mongoIdPathRequestBodyValidator } from "../../validators/common/mongodb.validators.js";
import { validate } from "../../validators/validate.js";

const router = Router();

router.use(verifyJWT);

router.route("/provider/razorpay").post(mongoIdPathRequestBodyValidator("bookingId"), validate, generateRazorPayOrder);

router.route("/provider/razorpay/verify-payment").post(verifyRazorpayPaymentValidator(), validate, verifyRazorpayPayment);


export default router;