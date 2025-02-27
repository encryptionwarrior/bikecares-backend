import mongoose from "mongoose";
import { bookingStatusEnum } from "../constants.js";
import { Booking } from "../models/booking/booking.models.js";


// export const getUpcomingBookingForUser = (user) => {
//     const currentDateTime = new Date(); // Get the current date and time
  
//     const bookings = Booking.aggregate([
//       {
//         $match: {
//         //   user: user._id, // Filter by the logged-in user
//           user:  new mongoose.Types.ObjectId(user._id), // Filter by the logged-in user
//         //   status: bookingStatusEnum.PENDING, // Status must be ACCEPTED
//           serviceDate: { $gte: currentDateTime }, // Date must be in the future or today
//         },
//       },
//       {
//         $lookup: {
//           from: "mechanics",
//           let: {acceptedBy: "$acceptedBy"},
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$user", "$acceptedBy"]},
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 first_name: 1,
//                 last_name: 1,
//                 phone_number: 1,
//                 experience: 1,
//               }
//             }
//           ],
//           as: "mechanicInfo", 
//         },
//       },
//       {
//         $addFields: {
//           mechanicInfo: {
//             $arrayElemAt: ["$mechanicInfo", 0]
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           serviceType: 1,
//           address: 1,
//           location: 1,
//           serviceDate: 1,
//           serviceTime: 1,
//           status: 1,
//           "mechanicInfo._id": 1, // Include specific mechanic fields
//           "mechanicInfo.first_name": 1,
//           "mechanicInfo.last_name": 1,
//           "mechanicInfo.phone_number": 1,
//           "mechanicInfo.experience": 1,
//         },
//       },
//     ]);

//     return bookings;
//   }
   

export const getUpcomingBookingForUser = (user) => {
  const currentDateTime = new Date(); // Get the current date and time

  const bookings = Booking.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(user._id),
        serviceDate: { $gte: currentDateTime },
      },
    },
    {
      $lookup: {
        from: "mechanics",
        let: { acceptedBy: "$acceptedBy" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user", "$$acceptedBy"] },
                  { $ne: ["$$acceptedBy", null] }, // Exclude null values explicitly
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              phone_number: 1,
              experience: 1,
            },
          },
        ],
        as: "mechanicInfo",
      },
    },
    {
      $addFields: {
        mechanicInfo: {
          $cond: {
            if: { $gt: [{ $size: "$mechanicInfo" }, 0] }, // Only assign if mechanic exists
            then: { $arrayElemAt: ["$mechanicInfo", 0] },
            else: null,
          },
        },
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
        "mechanicInfo._id": 1,
        "mechanicInfo.first_name": 1,
        "mechanicInfo.last_name": 1,
        "mechanicInfo.phone_number": 1,
        "mechanicInfo.experience": 1,
      },
    },
  ]);

  return bookings;
};


 export const getCompletedBookingsUser = async (user) => {
   
    const currentDateTime = new Date(); 
    const bookings = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id), // Filter by the logged-in user
        //   status: bookingStatusEnum.PENDING, // Status must be ACCEPTED
          serviceDate: { $lte: currentDateTime },
        },
      },
      {
        $lookup: {
          from: "mechanics",
          let: { acceptedBy: "$acceptedBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$acceptedBy"] },
                    { $ne: ["$$acceptedBy", null] }, // Exclude null values explicitly
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                phone_number: 1,
                experience: 1,
              },
            },
          ],
          as: "mechanicInfo",
        },
      },
      {
        $addFields: {
          mechanicInfo: {
            $cond: {
              if: { $gt: [{ $size: "$mechanicInfo" }, 0] }, // Only assign if mechanic exists
              then: { $arrayElemAt: ["$mechanicInfo", 0] },
              else: null,
            },
          },
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
          "mechanicInfo._id": 1,
          "mechanicInfo.first_name": 1,
          "mechanicInfo.last_name": 1,
          "mechanicInfo.phone_number": 1,
          "mechanicInfo.experience": 1,
        },
      },
    ]);

    return bookings
  };
 export const getOngoingBookingsUser = async (user) => {
   
    const bookings = await Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id), // Filter by the logged-in user
        //   status: bookingStatusEnum.PENDING, // Status must be ACCEPTED
          status: bookingStatusEnum.ONGOING, // Status must be ACCEPTED
        },
      },
      {
        $lookup: {
          from: "mechanics",
          let: { acceptedBy: "$acceptedBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$acceptedBy"] },
                    { $ne: ["$$acceptedBy", null] }, // Exclude null values explicitly
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                phone_number: 1,
                experience: 1,
              },
            },
          ],
          as: "mechanicInfo",
        },
      },
      {
        $addFields: {
          mechanicInfo: {
            $cond: {
              if: { $gt: [{ $size: "$mechanicInfo" }, 0] }, // Only assign if mechanic exists
              then: { $arrayElemAt: ["$mechanicInfo", 0] },
              else: null,
            },
          },
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
          "mechanicInfo._id": 1,
          "mechanicInfo.first_name": 1,
          "mechanicInfo.last_name": 1,
          "mechanicInfo.phone_number": 1,
          "mechanicInfo.experience": 1,
        },
      },
    ]);

    return bookings
  };


 export const getCompletedBookingsMechanic = async (user) => {
   
    const currentDateTime = new Date(); 
    const bookings = await Booking.aggregate([
      {
        $match: {
          acceptedBy: new mongoose.Types.ObjectId(user._id), // Filter by the logged-in user
        //   status: bookingStatusEnum.PENDING, // Status must be ACCEPTED
          serviceDate: { $lte: currentDateTime },
        },
      },
      {
        $lookup: {
          from: "mechanics",
          let: { acceptedBy: "$acceptedBy" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$acceptedBy"] },
                    { $ne: ["$$acceptedBy", null] }, // Exclude null values explicitly
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                phone_number: 1,
                experience: 1,
              },
            },
          ],
          as: "mechanicInfo",
        },
      },
      {
        $addFields: {
          mechanicInfo: {
            $cond: {
              if: { $gt: [{ $size: "$mechanicInfo" }, 0] }, // Only assign if mechanic exists
              then: { $arrayElemAt: ["$mechanicInfo", 0] },
              else: null,
            },
          },
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
          "mechanicInfo._id": 1,
          "mechanicInfo.first_name": 1,
          "mechanicInfo.last_name": 1,
          "mechanicInfo.phone_number": 1,
          "mechanicInfo.experience": 1,
        },
      },
    ]);

    return bookings
  };