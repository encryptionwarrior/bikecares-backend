import { bookingStatusEnum } from "../../constants.js";
import { Booking } from "../../models/booking/booking.models.js";
import { Mechanic } from "../../models/mechanic/mechanic.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getLocalPath, getStaticFilePath } from "../../utils/helpers.js";



const registerMechanic = asyncHandler(async(req, res) => {
    const { first_name, last_name, phone_number, experience, partnerType, address, latitude, longitude  } = req.body;
    // take image paths from multer - adhar_card, dl_card

    const adharCardUrl = getStaticFilePath(req, req.files?.adhar_card[0]?.filename);
    const adharCardLocalPath = getLocalPath(req.files.adhar_card[0]?.filename);
    const dlCardUrl = getStaticFilePath(req, req.files?.dl_card[0]?.filename);
    const dlCardLocalPath = getLocalPath(req.files?.dl_card[0]?.filename);

    // save data 

    // generate phone number verification otp
    // send otp to phone number
    // save otp and expiry in database
 
    const mechanic = await Mechanic.create({
        user: req.user._id,
        first_name,
        last_name,
        phone_number,
        experience,
        partnerType,
        address,
        location: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
        adhar_card: {
            url: adharCardUrl,
            localPath: adharCardLocalPath,
        },
        dl_card: {
            url: dlCardUrl,
            localPath: dlCardLocalPath,
        }
    });

    if(!mechanic){
        throw new ApiError(404, "Something went wrong while registering mechanic");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, mechanic, "Avatar updated successfully"));
});

// verify otp and update db verfified true
const verifyMechanicPhone  = asyncHandler(async(req, res) => {
    // verify otp and update db verfified true
    // send verification success message
    const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, {isParterVerified:true},{new:true});
    if(!mechanic){
        throw new ApiError(404, "Mechanic not found");
    }

    return res
   .status(200).json(new ApiResponse( 200, mechanic, "phone number verified successfully"));
})

const getAllNearbyBookings = asyncHandler(async(req, res) => {

    // const mechanic = await Mechanic.findOne({ user: req.user._id });

    // if (!mechanic) {
    //   throw new ApiError(404, "Mechanic not found");
    // }


    // const mechanicLocation = mechanic.location;

    // // Aggregate bookings and calculate distances
    // const bookingsWithDistance = await Booking.aggregate([
    //   {
    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: mechanicLocation.coordinates, // Mechanic's coordinates
    //       },
    //       distanceField: "distance", // Field to store the calculated distance
    //       spherical: true, // Use spherical geometry
    //     },
    //   },
    //   {
    //     $match: { status: bookingStatusEnum.PENDING }, // Filter pending bookings
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       user: 1,
    //       serviceType: 1,
    //       address: 1,
    //       location: 1,
    //       serviceDate: 1,
    //       serviceTime: 1,
    //       distance: 1, // Include calculated distance
    //     },
    //   },
    // ]);

    const mechanic = await Mechanic.findOne({ user: req.user._id }).populate({
        path: "bookingrequest.bookingId",
        model: "Booking",
      });
  
       if (!mechanic) {
      throw new ApiError(404, "Mechanic not found");
    }

  
      const mechanicLocation = mechanic.location.coordinates;
  
      // Filter bookings with status PENDING
      const pendingBookingIds = mechanic.bookingrequest
        .filter((request) => request.status === bookingStatusEnum.PENDING)
        .map((request) => request.bookingId._id); // Extract booking IDs
  
      if (pendingBookingIds.length === 0) {
        throw new ApiError(404, " booking request has no pending bookings");
      }
  
      // Use $geoNear to calculate distance for these bookings
      const bookingsWithDistance = await Booking.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: mechanicLocation, // Mechanic's coordinates
            },
            distanceField: "distance", // Field to store calculated distance
            spherical: true, // Use spherical geometry
            query: { _id: { $in: pendingBookingIds } }, // Filter bookings by ID
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
            distance: 1, // Include calculated distance
          },
        },
      ]);

    return res.status(200).json(new ApiResponse(201, bookingsWithDistance, "Nearby bookings fetched successfully"));
})

export {
    registerMechanic,
    verifyMechanicPhone,
    getAllNearbyBookings
}