import {
  BookingEventEnum,
  bookingStatusEnum,
  ChatEventEnum,
  serviceTypeEnum,
} from "../../constants.js";
import { Booking } from "../../models/booking/booking.models.js";
import { Mechanic } from "../../models/mechanic/mechanic.model.js";
import { ServiceTimeline } from "../../models/serviceTimeline/serviceTimeline.models.js";
import { emitSocketEvent } from "../../socket/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  bookingSuccessMailgenContent,
  emailVerificationMailgenContent,
  sendEmail,
} from "../../utils/mail.js";

const findNearbyMechanics = async (latitude, longitude, radiusInKm) => {
  const radiusInMeter = radiusInKm * 1000;

  const nearbyMechanics = await Mechanic.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusInMeter,
      },
    },
  });

  return nearbyMechanics;
};

const createBooking = asyncHandler(async (req, res) => {
  // Create booking
  const {
    serviceType,
    address,
    serviceDate,
    serviceTime,
    serviceDescription,
    garage,
    latitude,
    longitude,
  } = req.body;

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
    address,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    serviceDate,
    serviceTime,
    serviceDescription,
    user: req.user._id,
    basicCharge: 199
  });

  if (serviceType === serviceTypeEnum.InGarage) {
    booking.garage = garage;
  }

  await booking.save({ validateBeforeSave: false });

  if (!booking) {
    throw new ApiError(404, "Something went wrong while creating booking");
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
        {
          label: "Service Description",
          value: booking.serviceDescription || "N/A",
        },
      ]
    ),
  });

  const nearbyPartners = await findNearbyMechanics(latitude, longitude, 10);

  nearbyPartners.forEach(async (partner) => {
    // Use the partner's socket ID to emit the booking details
    //   io.to(partner.socketId).emit("newBooking", {
    //     message: "New booking in your area!",
    //     bookingDetails,
    //   });
    const alreadyBookingExist = partner?.bookingrequest?.find(
      (item) => item.bookingId.toString() === booking?._id
    );

    if (!alreadyBookingExist) {
      partner.bookingrequest.push({
        bookingId: booking?._id,
        status: bookingStatusEnum.PENDING,
      });
    }

    await partner.save({ validateBeforeSave: true });

    emitSocketEvent(
      req,
      // participantObjectId.toString(),
      partner?.user?.toString(),
      BookingEventEnum?.BOOKING_REQUEST_EVENT,
      booking
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: booking, nearbyPartners: nearbyPartners },
        "Your booking has been confirmed successfully"
      )
    );
});

const acceptBookingByPaterner = asyncHandler(async (req, res) => {
  // Accept booking by partner
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    { status: bookingStatusEnum.ACCEPTED, acceptedBy: req.user._id },
    { new: true }
  )
    .populate("garage", "name")
    .exec();

  if (!booking) {
    throw new ApiError(404, "Something went wrong while accepting booking");
  }

  await ServiceTimeline.findOneAndUpdate({booking: booking._id}, {requestAcceptedTime: Date.now()})

  // remove booking from other nearby partner
  const nearbyPartners = await findNearbyMechanics(
    booking.location.coordinates[1],
    booking.location.coordinates[0],
    10
  );

  nearbyPartners.forEach(async (partner) => {
    const bookingIndex = partner.bookingrequest.findIndex(
      (item) => item.bookingId.toString() === booking?._id?.toString()
    );

    if (bookingIndex >= 0) {
      if (partner.user?.toString() === req.user._id?.toString()) {
        const bookingRequests = partner.bookingrequest?.find(
          (item) => item.bookingId
        );
        bookingRequests.status = bookingStatusEnum.ACCEPTED;
        await partner.save({ validateBeforeSave: true });
      } else {
        partner.bookingrequest.splice(bookingIndex, 1);
        await partner.save({ validateBeforeSave: true });

        emitSocketEvent(
          req,
          // participantObjectId.toString(),
          partner?.user?.toString(),
          BookingEventEnum?.BOOKING_ACCEPTED_EVENT,
          booking
        );
      }
    }
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
       booking,
        "You have accepted the booking request successfully"
      )
    );
});

const getBookings = asyncHandler(async (req, res) => {
  // Fetch bookings for the current user
  const bookings = await Booking.aggregate([
    {
      $match: {
        user: req.user._id, // Filter by the logged-in user
      },
    },
    {
      $lookup: {
        from: "mechanics", // Reference the "mechanics" collection
        localField: "acceptedBy", // Field in Booking referencing Mechanic
        foreignField: "_id", // Field in Mechanic used for matching
        as: "mechanicInfo", // The field to store the joined mechanic information
      },
    },
    {
      $unwind: {
        path: "$mechanicInfo", // Unwind the mechanic info array to simplify the structure
        preserveNullAndEmptyArrays: true, // Optional: Include bookings with no mechanic assigned
      },
    },
    {
      $project: {
        _id: 1,
        serviceType: 1,
        address: 1,
        location: 1,
        serviceDate: 1,
        serviceTime: 1,
        status: 1,
        "mechanicInfo._id": 1, // Include specific mechanic fields
        "mechanicInfo.first_name": 1,
        "mechanicInfo.last_name": 1,
        "mechanicInfo.phone_number": 1,
        "mechanicInfo.experience": 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, bookings, "All upcoming bookings fetched successfully")
  );
});

const getBookingById = asyncHandler(async (req, res) => {
  // Fetch booking by ID
  const booking = await Booking.findById(req.params.id)
    .populate("garage", "name")
    .exec();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { booking },
        "Your booking has been fetched successfully"
      )
    );
});

const cancelBooking = asyncHandler(async (req, res) => {
  // Cancel booking by ID
  const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    { status: bookingStatusEnum.CANCELLED },
    { new: true }
  )
    .populate("garage", "name")
    .exec();

    if (!booking) {
    throw new ApiError(404, "Something went wrong while canceling booking");
  }

  const nearbyPartners = await findNearbyMechanics(
    booking.location.coordinates[1],
    booking.location.coordinates[0],
    10
  );

  nearbyPartners.forEach(async (partner) => {
    const bookingIndex = partner.bookingrequest.findIndex(
      (item) => item.bookingId.toString() === booking?._id?.toString()
    );
    if (bookingIndex >= 0) {
        if(booking?.acceptedBy?.toString() === partner?._id?.toString()){
            const bookingRequests = partner.bookingrequest?.find(
              (item) => item.bookingId
            );
            bookingRequests.status = bookingStatusEnum.CANCELLED;
            await partner.save({ validateBeforeSave: true });
        } else {
            partner.bookingrequest.splice(bookingIndex, 1);
            await partner.save({ validateBeforeSave: true });
        }
 
    }
})

  return res.status(200).json(new ApiResponse(201, booking, "you have successfully canceled the booking"))

});

const updateBooking = asyncHandler(async (req, res) => {
  // Update booking by ID
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
    .populate("garage", "name")
    .exec();

  return res.json(
    new ApiResponse(
      200,
      { booking },
      "Your booking has been updated successfully"
    )
  );
});

const changeBookingStatus = asyncHandler(async (req, res) => {
  // Change booking status by ID

  // const mechanic = await Mechanic.updateOne(
  //   { 
  //     user: req.user._id,
  //     "bookingrequest.bookingId": req.params.bookingId, // Match specific booking
  //   },
  //   { 
  //     $set: { "bookingrequest.$.status": req.body.status }, // Update the status
  //   }
  // );

  const mechanic = await Mechanic.findOne({ user: req.user._id });

if (!mechanic) {
  return res.status(404).json({ message: "Mechanic not found" });
}

// Find the specific booking in the bookingrequest array
const bookingToUpdate = mechanic.bookingrequest.find(
  (booking) => booking.bookingId?.toString() === req.params.bookingId
);

if (!bookingToUpdate) {
  return res.status(404).json({ message: "Booking not found in mechanic's requests" });
}

// Update the status
bookingToUpdate.status = req.body.status;

// Save the mechanic document once
await mechanic.save({ validateBeforeSave: true });

const booking = await Booking.findByIdAndUpdate(
  req.params.bookingId,
  { status: req.body.status },
  { new: true }
)
  .populate("garage", "name")
  .exec();

  if (!booking) {
  throw new ApiError(404, "Something went wrong while updating booking status");
}


  return res.json(
    new ApiResponse(
      200,
      { booking,mechanic },
      "Your booking status has been updated successfully"
    )
  );
});

const getOngoingBooking = asyncHandler(async(req, res) => {
  const bookings = await Booking.aggregate([
    {
      $match: {
        user: req.user._id, // Filter by the logged-in user
        status: bookingStatusEnum.ONGOING, // Status must be ACCEPTED
      },
    },
    {
      $lookup: {
        from: "mechanics", // Reference the "mechanics" collection
        localField: "acceptedBy", // Field in Booking referencing Mechanic
        foreignField: "_id", // Field in Mechanic used for matching
        as: "mechanicInfo", // The field to store the joined mechanic information
      },
    },
    {
      $unwind: {
        path: "$mechanicInfo", // Unwind the mechanic info array to simplify the structure
        preserveNullAndEmptyArrays: true, // Optional: Include bookings with no mechanic assigned
      },
    },
    {
      $project: {
        _id: 1,
        serviceType: 1,
        address: 1,
        location: 1,
        serviceDate: 1,
        serviceTime: 1,
        status: 1,
        "mechanicInfo._id": 1, // Include specific mechanic fields
        "mechanicInfo.first_name": 1,
        "mechanicInfo.last_name": 1,
        "mechanicInfo.phone_number": 1,
        "mechanicInfo.experience": 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, bookings, "All upcoming bookings fetched successfully")
  );
})


const getUpcomingBookings = asyncHandler(async (req, res) => {
  const currentDateTime = new Date(); // Get the current date and time

  const bookings = await Booking.aggregate([
    {
      $match: {
        user: req.user._id, // Filter by the logged-in user
        status: bookingStatusEnum.ACCEPTED, // Status must be ACCEPTED
        serviceDate: { $gte: currentDateTime }, // Date must be in the future or today
      },
    },
    {
      $lookup: {
        from: "mechanics", // Reference the "mechanics" collection
        localField: "acceptedBy", // Field in Booking referencing Mechanic
        foreignField: "_id", // Field in Mechanic used for matching
        as: "mechanicInfo", // The field to store the joined mechanic information
      },
    },
    {
      $unwind: {
        path: "$mechanicInfo", // Unwind the mechanic info array to simplify the structure
        preserveNullAndEmptyArrays: true, // Optional: Include bookings with no mechanic assigned
      },
    },
    {
      $project: {
        _id: 1,
        serviceType: 1,
        address: 1,
        location: 1,
        serviceDate: 1,
        serviceTime: 1,
        status: 1,
        "mechanicInfo._id": 1, // Include specific mechanic fields
        "mechanicInfo.first_name": 1,
        "mechanicInfo.last_name": 1,
        "mechanicInfo.phone_number": 1,
        "mechanicInfo.experience": 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, bookings, "All upcoming bookings fetched successfully")
  );
});

const getCompletedBookings = asyncHandler(async (req, res) => {

  const bookings = await Booking.aggregate([
    {
      $match: {
        user: req.user._id, // Filter by the logged-in user
        status: bookingStatusEnum.COMPLETED, // Status must be ACCEPTED
      },
    },
    {
      $lookup: {
        from: "mechanics", // Reference the "mechanics" collection
        localField: "acceptedBy", // Field in Booking referencing Mechanic
        foreignField: "_id", // Field in Mechanic used for matching
        as: "mechanicInfo", // The field to store the joined mechanic information
      },
    },
    {
      $unwind: {
        path: "$mechanicInfo", // Unwind the mechanic info array to simplify the structure
        preserveNullAndEmptyArrays: true, // Optional: Include bookings with no mechanic assigned
      },
    },
    {
      $project: {
        _id: 1,
        serviceType: 1,
        address: 1,
        location: 1,
        serviceDate: 1,
        serviceTime: 1,
        status: 1,
        "mechanicInfo._id": 1, // Include specific mechanic fields
        "mechanicInfo.first_name": 1,
        "mechanicInfo.last_name": 1,
        "mechanicInfo.phone_number": 1,
        "mechanicInfo.experience": 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, bookings, "All upcoming bookings fetched successfully")
  );
});

export {
  createBooking,
  getBookings,
  cancelBooking,
  changeBookingStatus,
  updateBooking,
  getBookingById,
  acceptBookingByPaterner,
  getUpcomingBookings,
  getCompletedBookings,
  getOngoingBooking
};
