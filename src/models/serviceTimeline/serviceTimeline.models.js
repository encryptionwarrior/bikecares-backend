import mongoose from "mongoose";

const ServiceTimelineSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  requestAcceptedTime: {
    type: Date,
    default: null,
  },
  inspectionTime: {
    type: Date,
    default: null,
  },
  paymentTime: {
    type: Date,
    default: null,
  },
  serviceStartTime: {
    type: Date,
    default: null,
  },
  serviceCompletionTime: {
    type: Date,
    default: null,
  },
  mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "Mechanic" },
  issueNotes: {
    type: [
      {
        issueName: {
          type: String,
          required: true,
        },
        timeToFix: {
          type: String,
          required: true,
        },
        sparePart: {
          type: String,
        },
        charge: {
          type: String,
          required: true,
        },
      },
    ],
    default: [], // Default value at the array level
  },
  Payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
});

export const ServiceTimeline = mongoose.model("ServiceTimeline", ServiceTimelineSchema);
