import mongoose, { Schema } from "mongoose";
import { AvailablePartnerTypes, partnerTypeEnum } from "../../constants";

const mechanicSchema = new Schema({
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
  coordinates: {
    latitude: { type: String, required: true},
    longitude: { type: String, required: true}
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
  verificationOtp: { type: String },
  verificationOtpExpiry: { type: Date },
}, {
    timestamps: true,
});

export const Mechanic = mongoose.model("Mechanic", mechanicSchema);
