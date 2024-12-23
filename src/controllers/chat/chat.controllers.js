import { Chat } from "../../models/chat/chat.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const chatCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            forgotPasswordToken: 0,
                            forgotPasswordExpiry: 0,
                            emailVerificationToken: 0,
                            emailVerificationExpiry: 0,

                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "chatMessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
                pipeline:[
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        email: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            sender: {$first: "$sender"},
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                lastMessage: {
                    $first: "$lastMessage"
                }
            }
        }
    ]
}

const getAllChats = asyncHandler(async(req, res) => {
    const chats = await Chat.aggregate([
        {
            $match: {
                participants: {$elemMatch: {$eq: req.user._id}},
            },
        },
        {
            $sort: {
                updatedAt: -1
            }
        },
        ...chatCommonAggregation(),
    ]);

    return res.status(200).json(new ApiResponse(200, chats || [], "User chats fetched successfully"))
})

export {
    getAllChats
}