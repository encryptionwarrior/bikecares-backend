import { Router } from "express";
import { validate } from "../../validators/validate.js";
import { registerMechanicValidaor } from "../../validators/mechanic/mechanic.validators.js";
import { lastServiceBooked, mechanicgetAllBookings, mechanicgetAllPendingNearbyBookings, registerMechanic, verifyMechanicPhone } from "../../controllers/mechanic/mechanic.controllers.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getMechanicCompletedBookings, getMechanicOngoingBooking, getMechanicUpcomingBookings } from "../../controllers/bookings/booking.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/register-mechanic").post(
 upload.fields([
      {
        name: "adhar_card",
        maxCount: 1,
      },
      {
        name: "dl_card",
        maxCount: 1,
      },
    ]),
    registerMechanicValidaor(), validate, 
       registerMechanic);

    router.route("/verify-mechanic").get(verifyJWT, registerMechanicValidaor(), verifyMechanicPhone);
    router.route("/booking-pending").get(mechanicgetAllPendingNearbyBookings);
    router.route("/booking").get(mechanicgetAllBookings);
    router.route("/last-booking").get(lastServiceBooked);
    router.route("/upcoming").get(getMechanicUpcomingBookings);
    router.route("/completed").get(getMechanicCompletedBookings);
    router.route("/on-going").get(getMechanicOngoingBooking);

export default router;