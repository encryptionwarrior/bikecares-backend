import mongoose, { Schema } from "mongoose";
import {
  AvailablePaymentProviders,
  AvailablePaymentStatuses,
  PaymentProviderEnum,
  PaymentStatusEnum,
} from "../../constants.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const basicPaymentSchema = new Schema(
  {
    bookingBasicPrice: {
      type: Number,
      required: true,
    },
    discountedBasicPrice: {
      type: Number,
      required: true,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    basicCharge: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: AvailablePaymentStatuses,
      default: PaymentStatusEnum.PENDING,
    },
    paymentProvider: {
      type: String,
      enum: AvailablePaymentProviders,
      default: PaymentProviderEnum.UNKNOWN,
    },
    paymentId: {
      type: String,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

basicPaymentSchema.plugin(mongooseAggregatePaginate);

export const BasicPayment = mongoose.model("Payment", basicPaymentSchema);
