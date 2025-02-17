import mongoose, { Schema } from "mongoose";
import { User } from "../auth/user.models.js";
import { Address } from "./address.models.js";
import { Product } from "./product.models.js";
import { Coupon } from "./coupon.models.js";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { AvailablePaymentProviders, AvailablePaymentStatuses, PaymentProviderEnum, PaymentStatusEnum } from "../../constants.js";

const issueChargePaymentSchema = new Schema(
  {
    issuePrice: {
      type: Number,
      required: true,
    },
    discountedIssuePrice: {
      type: Number,
      required: true,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    issues: {
      type: [
        {
          serviceTimelineId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceTimeline",
          },
          issue: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
          },
        },
      ],
      default: [],
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
    // This field shows if the payment is done or not
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

issueChargePaymentSchema.plugin(mongooseAggregatePaginate);

export const EcomOrder = mongoose.model("IssuePayment", issueChargePaymentSchema);
