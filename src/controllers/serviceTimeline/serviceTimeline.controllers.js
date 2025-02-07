import { ServiceTimeline } from "../../models/serviceTimeline/serviceTimeline.models.js";
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
      { inspectionTime: Date.now() },
      { new: true }
    );
    // const updatedServiceTimeline = await ServiceTimeline.findById(
    //   serviceTimeline
    // );

    if (!updatedServiceTimeline) {
      throw new ApiError(401, "Something went wrong when updating service timeline");
    }

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

// const getIssueNotes = asyncHandler(async (req, res) => {
//     const { serviceTimeline } = req.params;

//     const updatedServiceTimeline = await ServiceTimeline.findById(
//       serviceTimeline);

//     if (!updatedServiceTimeline) {
//       throw new ApiError(401, "Something went wrong when adding issue notes");
//     }

//     res
//      .status(200)
//      .json(
//         new ApiResponse(
//           200,
//           updatedServiceTimeline,
//           "Issue notes added successfully"
//         )
//       );
// });


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

    const updatedServiceTimeline = await ServiceTimeline.findByIdAndUpdate(
      serviceTimeline,
      {
        $set: {
          "issueNotes.$[note].issueName": issueName,
          "issueNotes.$[note].timeToFix": timeToFix,
          "issueNotes.$[note].sparePart": sparePart,
          "issueNotes.$[note].charge": charge,
        },
      },
      {
        new: true,
        arrayFilters: [{ _id: issueNoteId }],
      }
    );

    if (!updatedServiceTimeline) {
      throw new ApiError(401, "Something went wrong when updating service timeline") 
    }

    res
     .status(200)
     .json(
        new ApiResponse(
          200,
          updatedServiceTimeline,
          "Issue notes updated successfully"
        )
      );
});

const deleteIssueTimelineNotes = asyncHandler(async (req, res) => {
    const { serviceTimelineId, issueNoteId } = req.params;
    const updatedServiceTimeline = await ServiceTimeline.findByIdAndUpdate(
      serviceTimelineId,
      { $pull: { issueNotes: { _id: issueNoteId } } },
      { new: true }
    );

    if (!updatedServiceTimeline) {
  return res.status(404).json({ message: "service timeline not found" })
    }

    res
     .status(200)
     .json(
        new ApiResponse(
          200,
          updatedServiceTimeline,
          "Issue notes deleted successfully"
        )
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
    addIssueNotes,
    updateIssueTimelineNotes,
    deleteIssueTimelineNotes,
    getServiceTimeline
}