import mongoose, { Schema } from "mongoose";
import { AvailableBookingStatus, AvailableServices, bookingStatusEnum, serviceTypeEnum } from "../../constants.js";
const bookingSchema = new mongoose.Schema({
   user: {
    type: Schema.Types.ObjectId,
    ref: "User"
   },
   serviceType: {
    type: String,
    enum: AvailableServices,
    required: true
   },
   garage: {
    type: Schema.Types.ObjectId,
    ref: "Garage"
   },
   address: {
    type: String,
    required: true
   },
   location: {
    type: {
      type: String,
      enum: ["Point"], // GeoJSON type must be 'Point'
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      required: true,
    },
  },
   serviceDate: {
    type: Date,
    required: true,
    validate: {
       validator: function(value) {
         return value >= new Date();
       },
       message: "Service date must be in the future"
    }
   },
   serviceTime: {
    type: String,
    required: true
   },
   serviceDescription: {
    type: String,
   },
   status: {
    type: String,
    enum: AvailableBookingStatus,
    default: bookingStatusEnum.PENDING,
    required: true
   },
   acceptedBy: {
    type: Schema.Types.ObjectId,
    ref: "Mechanic"
   }
  },
{
  timestamps: true,
});

bookingSchema.index({ location: "2dsphere" });
  
  export const Booking = mongoose.model("Booking", bookingSchema);
  