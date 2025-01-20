import mongoose, { Schema } from "mongoose";
import { AvailablePartnerTypes, partnerTypeEnum } from "../../constants.js";

const mechanicSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
   },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  partnerType: {
    type: String,
    enum: AvailablePartnerTypes,
    default: partnerTypeEnum.MECHANIC,
    required: true,
  },
  address: { type: String, required: true},
  // coordinates: {
  //   latitude: { type: String, required: true},
  //   longitude: { type: String, required: true}
  // },
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
  adhar_card: {
    type: {
        url: String,
        localPath: String,
     },
     default: {
         url: `https://via.placeholder.com/200x200.png`,
         localPath: "",
     }
  },
  dl_card: {
    type: {
        url: String,
        localPath: String,
     },
     default: {
         url: `https://via.placeholder.com/200x200.png`,
         localPath: "",
     }
  },
  bookingrequest: {
    type: [{
      bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      }}
    ],
    default: [],
  },
  verificationOtp: { type: String },
  verificationOtpExpiry: { type: Date },
  isParterVerified: { type: Boolean, default: false}
}, {
    timestamps: true,
});


mechanicSchema.index({ location: "2dsphere" });

export const Mechanic = mongoose.model("Mechanic", mechanicSchema);
