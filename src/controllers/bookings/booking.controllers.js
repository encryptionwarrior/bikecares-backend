import { serviceTypeEnum } from "../../constants";
import { Booking } from "../../models/booking/booking.models";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { bookingSuccessMailgenContent, emailVerificationMailgenContent, sendEmail } from "../../utils/mail";


export const createBooking = asyncHandler(async(req, res) => {
    // Create booking
    const { serviceType, location, serviceDate, serviceTime, serviceDescription, garage  } = req.body;

    // booking steps:
    // 1. Validate the booking data
    // 2. Check if the garage is available for the provided date and time
    // 3. Create a new booking document in the database
    // 4. Send a notification to the garage owner about the new booking request
    // 5. Return the booking confirmation response to the client
    // 6. Optionally, save the booking data in a separate booking history collection in the database
    // 7. Optionally, send a notification to the customer about the new booking request

    const booking = await Booking.create({
        serviceType,
        location,
        serviceDate,
        serviceTime,
        serviceDescription,
        customer: req.user._id,
    })

    if(serviceType === serviceTypeEnum.InGarage) {
        booking.garage = garage
    }

    await booking.save({validateBeforeSave: false});

    if(!booking){
        throw new ApiError(404, "Something went wrong while creating booking")
    }

    const user = req.user;
    await sendEmail({
        email: user?.email,
        subject: "Booking successful",
        mailgenContent: bookingSuccessMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/booking/${booking._id}`,
            [
                { label: "Service Type", value: booking.serviceType },
                { label: "Location", value: booking.location },
                { label: "Service Date", value: booking.serviceDate.toDateString() },
                { label: "Service Time", value: booking.serviceTime },
                { label: "Service Description", value: booking.serviceDescription || "N/A" },
            ]
        ),
    });
    // Send booking confirmation email
    return res.status(201).json(new ApiResponse(200, {user: booking}, "Your booking has been confirmed successfully"))
});

const getBookings = asyncHandler(async (req, res) => {
    // Fetch bookings for the current user
    const bookings = await Booking.find({ customer: req.user._id })
       .populate("garage", "name")
       .exec();

    return res.json(new ApiResponse(200, { bookings }, "Your bookings"));
});

const getBookingById = asyncHandler(async (req, res) => {
    // Fetch booking by ID
    const booking = await Booking.findById(req.params.id)
       .populate("garage", "name")
       .exec();

    return res.json(new ApiResponse(200, { booking }, "Your booking has been fetched successfully"))
})

const cancelBooking = asyncHandler(async (req, res) => {
    // Cancel booking by ID
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "Canceled" }, { new: true })
       .populate("garage", "name")
       .exec();
});

const updateBooking = asyncHandler(async (req, res) => {
    // Update booking by ID
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
       .populate("garage", "name")
       .exec();

       return res.json(new ApiResponse(200, { booking }, "Your booking has been updated successfully"))
});


const changeBookingStatus = asyncHandler(async (req, res) => {
    // Change booking status by ID
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
       .populate("garage", "name")
       .exec();

    
       return res.json(new ApiResponse(200, { booking }, "Your booking status has been updated successfully"))
})

export { createBooking, getBookings, cancelBooking, changeBookingStatus, updateBooking };