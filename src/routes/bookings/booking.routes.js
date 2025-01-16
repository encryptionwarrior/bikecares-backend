import {Router} from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import { createBooking } from "../../controllers/bookings/booking.controllers";
import { createBookingValidate } from "../../validators/booking/booking.validators";
import { mongoIdPathRequestBodyValidator } from "../../validators/common/mongodb.validators";



const router = Router();

router.use(verifyJWT);
router.route("/create").post(createBookingValidate(), validate, createBooking)



export default router;
