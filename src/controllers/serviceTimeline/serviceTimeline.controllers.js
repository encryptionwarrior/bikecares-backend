import { BookingEventEnum, serviceTimelineEventsEnum } from "../../constants.js";
import { ServiceTimeline } from "../../models/serviceTimeline/serviceTimeline.models.js";
import { emitSocketEvent } from "../../socket/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createServiceTimeline = asyncHandler(async (req, res) => {
  const { booking, mechanic } = req.body;

  const serviceTimeline = await ServiceTimeline.create({
    booking,
    mechanic,
  });

  if (!serviceTimeline) {
    throw new Error("Something went wrong when create service timeline");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        serviceTimeline,
        "serviceTimeline created successfully"
      )
    );
});


const changeServiceTimeline = asyncHandler(async (req, res) => {
    const { serviceTimeline } = req.params;
    const { status } = req.body;

    const updatedServiceTimeline = await ServiceTimeline.findByIdAndUpdate(
      serviceTimeline,
      { [status]: Date.now() },
      { new: true }
    );
    // const updatedServiceTimeline = await ServiceTimeline.findById(
    //   serviceTimeline
    // );

    if (!updatedServiceTimeline) {
      throw new ApiError(401, "Something went wrong when updating service timeline");
    }

     emitSocketEvent(
            req,
            // participantObjectId.toString(),
            updatedServiceTimeline?.user?.toString(),
            serviceTimelineEventsEnum.UPDATE_TIMELINE,
            updatedServiceTimeline
          );

    res
     .status(200)
     .json(
        new ApiResponse(
          200,
          updatedServiceTimeline,
          `Service timeline status updated to ${status}`
        )
      );
});

const getIssueNotes = asyncHandler(async (req, res) => {
  const { serviceTimeline } = req.params;

  // Find the ServiceTimeline by ID and return only the issueNotes field
  const serviceTimelineData = await ServiceTimeline.findById(serviceTimeline).select("issueNotes");

  if (!serviceTimelineData) {
      throw new ApiError(404, `Service timeline not found: ${serviceTimeline}`);
  }

  res.status(200).json(
      new ApiResponse(200, serviceTimelineData.issueNotes, "Issue notes fetched successfully")
  );
});


const addIssueNotes = asyncHandler(async (req, res) => {
    const { serviceTimeline } = req.params;
    const { issueName, timeToFix, sparePart, charge } = req.body;

    const updatedServiceTimeline = await ServiceTimeline.findByIdAndUpdate(
      serviceTimeline,
      {
        $push: {
          issueNotes: {
            issueName,
            timeToFix,
            sparePart,
            charge,
          },
        },
      },
      { new: true }
    );

    if (!updatedServiceTimeline) {
      throw new ApiError(401, "Something went wrong when adding issue notes");
    }

    res
     .status(200)
     .json(
        new ApiResponse(
          200,
          updatedServiceTimeline,
          "Issue notes added successfully"
        )
      );
});

const updateIssueTimelineNotes = asyncHandler(async (req, res) => {
  const { serviceTimeline } = req.params;
  const { issueName, timeToFix, sparePart, charge, issueNoteId } = req.body;

  const updatedServiceTimeline = await ServiceTimeline.findOneAndUpdate(
      { _id: serviceTimeline, "issueNotes._id": issueNoteId }, // Query to find the specific issueNote
      {
          $set: {
              "issueNotes.$.issueName": issueName, // Use positional operator $
              "issueNotes.$.timeToFix": timeToFix,
              "issueNotes.$.sparePart": sparePart,
              "issueNotes.$.charge": charge,
          },
      },
      { new: true }
  );

  if (!updatedServiceTimeline) {
      throw new ApiError(401, "Something went wrong when updating service timeline");
  }

  res.status(200).json(
      new ApiResponse(200, updatedServiceTimeline, "Issue notes updated successfully")
  );
});

const deleteIssueTimelineNotes = asyncHandler(async (req, res) => {
  const { serviceTimeline } = req.params;
  const { issueNoteId } = req.query;

  const updatedServiceTimeline = await ServiceTimeline.findOneAndUpdate(
      { _id: serviceTimeline }, // Find the main document
      { $pull: { issueNotes: { _id: issueNoteId } } }, // Remove the matching subdocument
      { new: true } // Return the updated document
  );

  if (!updatedServiceTimeline) {
      return res.status(404).json({ message: "Service timeline not found" });
  }

  if (updatedServiceTimeline.nModified === 0) {
      return res.status(404).json({ message: "Issue note not found" });
  }


  res.status(200).json(
      new ApiResponse(200, updatedServiceTimeline, "Issue notes deleted successfully")
  );
});

const getServiceTimeline = asyncHandler(async (req, res) => {
  const { booking } = req.params;
  const serviceTimeline = await ServiceTimeline.findOne({booking});

  if (!serviceTimeline) {
    throw new ApiError(404, "Service timeline not found");
  }

  res.status(200).json(new ApiResponse(200, serviceTimeline, "Service timeline found"));
})

export {
    createServiceTimeline,
    changeServiceTimeline,
    getIssueNotes,
    addIssueNotes,
    updateIssueTimelineNotes,
    deleteIssueTimelineNotes,
    getServiceTimeline
}