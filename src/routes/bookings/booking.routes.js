import {Router} from "express";
import { verifyJWT, verifyPermission } from "../../middlewares/auth.middleware.js";
import { acceptBookingByPaterner, cancelBooking, changeBookingStatus, createBooking, getBookings, getCompletedBookings, getOngoingBooking, getUpcomingBookings } from "../../controllers/bookings/booking.controllers.js";
import { createBookingValidate } from "../../validators/booking/booking.validators.js";
import { mongoIdPathRequestBodyValidator, mongoIdPathVariableValidator } from "../../validators/common/mongodb.validators.js";
import { validate } from "../../validators/validate.js";
import { UserRolesEnum } from "../../constants.js";



const router = Router();

router.use(verifyJWT);
router.route("/").get(getBookings)
router.route("/create").post(createBookingValidate(), validate, createBooking);
router.route("/action/:bookingId").get(mongoIdPathVariableValidator("bookingId"), verifyPermission([UserRolesEnum.MECHANIC]), validate, acceptBookingByPaterner).delete(mongoIdPathVariableValidator("bookingId"), verifyPermission(UserRolesEnum.USER), validate, cancelBooking).put(mongoIdPathVariableValidator("bookingId"), verifyPermission(UserRolesEnum.MECHANIC), validate, changeBookingStatus);
router.route("/upcoming").get(getUpcomingBookings);
router.route("/completed").get(getCompletedBookings);
router.route("/on-going").get(getOngoingBooking);

export default router;
