import mongoose, { Schema } from "mongoose";
import { AvailableBookingStatus, AvailableServices, bookingStatusEnum, serviceTypeEnum } from "../../constants";
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
   location: {
    type: String,
    required: true
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
   }
  },
{
  timestamps: true,
});
  
  export const Booking = mongoose.model("Booking", bookingSchema);
  