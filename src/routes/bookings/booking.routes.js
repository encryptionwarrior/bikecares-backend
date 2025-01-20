import {Router} from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createBooking, getBookings } from "../../controllers/bookings/booking.controllers.js";
import { createBookingValidate } from "../../validators/booking/booking.validators.js";
import { mongoIdPathRequestBodyValidator } from "../../validators/common/mongodb.validators.js";
import { validate } from "../../validators/validate.js";



const router = Router();

router.use(verifyJWT);
router.route("/").get(getBookings)
router.route("/create").post(createBookingValidate(), validate, createBooking)



export default router;
