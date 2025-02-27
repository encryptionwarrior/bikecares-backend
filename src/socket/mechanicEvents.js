import { BookingEventEnum, bookingStatusEnum } from "../constants.js";
import { getPendingBoookingOfNearbyMechanics, getUpcomingBookings } from "../controllers/bookings/booking.controllers.js";
import { Booking } from "../models/booking/booking.models.js";
import { Mechanic } from "../models/mechanic/mechanic.model.js";
import { getCompletedBookingsMechanic, getCompletedBookingsUser, getOngoingBookingsUser, getUpcomingBookingForUser } from "./booking.controllers.js";


export const mechanicSocketEvents = (socket, io) => {
    socket.on("findAllNearbyRequests", async(user) => {
            const mechanic = await Mechanic.findOne({ user: user._id });
              const nearbyBooking = await getPendingBoookingOfNearbyMechanics(mechanic);
            io.to(user._id).emit( BookingEventEnum?.BOOKING_REQUEST_EVENT, nearbyBooking);
    })

    socket.on("getupcomingBookings", async(user) => {
      const upomingBookings = await getUpcomingBookingForUser(user);

      io.to(user._id).emit(BookingEventEnum?.UPCOMING_BOOKING_EVENT, upomingBookings);
    })

    socket.on("getcompletedBookings", async(user) => {
      const completeBookings =  await getCompletedBookingsUser(user);
      io.to(user._id).emit(BookingEventEnum?.COMPLETED_BOOKING_EVENT, completeBookings);
    })
    socket.on("getOngoingBookings", async(user) => {
      const completeBookings =  await getOngoingBookingsUser(user);
      io.to(user._id).emit(BookingEventEnum?.ONGOING_BOOKING_EVENT, completeBookings);
    })


    socket.on("getMechaniccompletedBookings", async(user) => {
      const completeBookings =  await getCompletedBookingsMechanic(user);
      io.to(user._id).emit(BookingEventEnum?.MECHANIC_COMPLETED_BOOKING_EVENT, completeBookings);
    })
}

