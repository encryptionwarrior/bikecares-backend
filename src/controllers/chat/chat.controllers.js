import mongoose from "mongoose";
import { User } from "../../models/auth/user.models.js";
import { Chat } from "../../models/chat/chat.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { emitSocketEvent } from "../../socket/index.js";
import { ChatEventEnum } from "../../constants.js";
import { ChatMessage } from "../../models/chat/message.model.js";
import { removeLocalFile } from "../../utils/helpers.js";

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
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "chatMessages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
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
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              sender: { $first: "$sender" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: {
          $first: "$lastMessage",
        },
      },
    },
  ];
};

const deleteCascadeChatMessage = async (chatId) => {
  const messages = await ChatMessage.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  let attachments = [];

  attachments = attachments.concat(
    ...messages.map((message) => {
      return message.attachments;
    })
  );

  attachments.forEach((attachment) => {
    removeLocalFile(attachment.localPath);
  });

  await ChatMessage.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId),
  });
};


const searchAvailableUser = asyncHandler(async(req, res) => {
    const users = await User.aggregate([
        {
            $match: {
                _id: {
                    $ne: req.user._id
                }
            }
        },
        {
            $project: {
                avatar: 1,
                username: 1,
                email: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
})

const createOrGetOneOnOneChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "Receiver does not exist");
  }

  if (receiver._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat with yourself");
  }

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        $and: [
          {
            participants: { $elemMatch: { $eq: req.user._id } },
          },
          {
            participants: {
              $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (chat.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
  }

  const newChatInstance = await Chat.create({
    name: "One on One chat",
    participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
    admin: req.user._id,
  });

  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: newChatInstance._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = createdChat[0];

  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Chat retrived successfully"));
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const groupChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Group chat fetched successfully"));
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (participants.includes(req.user._id.toString())) {
    throw new ApiError(
      400,
      "Participants array chould not contain the group creator"
    );
  }

  const memebers = [...new Set([...participants, req.user._id.toString()])];

  if (memebers.length < 3) {
    throw new ApiError(
      404,
      "Seems like you have passed duplicate participants"
    );
  }

  const groupChat = await Chat.create({
    name,
    isGroupChat: true,
    participants: memebers,
    admin: req.user._id,
  });

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];
  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Group chat created successfully"));
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { chatId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not admin");
  }

  const updatedGroupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];
  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Group chat renamed successfully"));
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  const chat = groupChat[0];

  if (!chat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (chat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "Only admin can delete the group");
  }

  await Chat.findByIdAndUpdate(chatId);

  await deleteCascadeChatMessage(chatId);

  chat?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Group chat deleted successfully"));
});


const addNewParticipantGroupInChat = asyncHandler(async (req, res) => {
    const { chatId, participantId } = req.params;
  
    const groupChat = await Chat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      isGroupChat: true,
    });
  
    if (!groupChat) {
      throw new ApiError(404, "Group chat does not exist");
    }
  
    if (groupChat.admin?.toString() !== req.user._id?.toString()) {
      throw new ApiError(404, "You are not admin");
    }
  
    const existingParticipants = groupChat.participants;
  
    if (existingParticipants?.includes(participantId)) {
      throw new ApiError(400, "Participants already exist in group chat");
    }
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          participants: participantId,
        },
      },
      {
        new: true,
      }
    );
  
    const chat = await Chat.aggregate([
      {
        $match: {
          _id: updatedChat._id,
        },
      },
      ...chatCommonAggregation(),
    ]);
  
    const payload = chat[0];
    if (!payload) {
      throw new ApiError(500, "Internal server error");
    }
  
    emitSocketEvent(
      req,
      participantId,
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  
    return res
      .status(201)
      .json(new ApiResponse(201, payload, "Participant added successfully"));
  });

const removeParticipantFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, participantId } = req.params;

  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError(404, "Group chat does not exist");
  }

  if (groupChat.admin?.toString() !== req.user._id?.toString()) {
    throw new ApiError(404, "You are not admin");
  }

  const existingParticipants = groupChat.participants;

  if (!existingParticipants?.includes(participantId)) {
    throw new ApiError(400, "Participants does not exist in group chat");
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: participantId,
      },
    },
    {
      new: true,
    }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];
  if (!payload) {
    throw new ApiError(500, "Internal server error");
  }

  emitSocketEvent(
    req,
    participantId,
    ChatEventEnum.LEAVE_CHAT_EVENT,
    payload
  );

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Participant removed successfully"));
});

const leaveGroupChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
  
    const groupChat = await Chat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      isGroupChat: true,
    });
  
    if (!groupChat) {
      throw new ApiError(404, "Group chat does not exist");
    }
  

    const existingParticipants = groupChat.participants;
  
    if (!existingParticipants?.includes(req.user?._id)) {
      throw new ApiError(400, "You are not a part of this group chat");
    }
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          participants: req.user._id,
        },
      },
      {
        new: true,
      }
    );
  
    const chat = await Chat.aggregate([
      {
        $match: {
          _id: updatedChat._id,
        },
      },
      ...chatCommonAggregation(),
    ]);
  
    const payload = chat[0];
    if (!payload) {
      throw new ApiError(500, "Internal server error");
    }
  

  
    return res
      .status(201)
      .json(new ApiResponse(201, payload, "Left a group successfully"));
  });

  const deleteOneOnOneChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
  
const chat = await Chat.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(chatId),
        }
    },
    ...chatCommonAggregation(),
])
    const payload = chat[0];

    if(!payload){
        throw new ApiError(404, "Chat does not exist");
    }

    await Chat.findByIdAndUpdate(chatId);
  
    await deleteCascadeChatMessage(chatId);


    const otherParticipant  = payload?.participants?.find((participant) => participant?._id.toString() !== req.user._id.toString())
  
    emitSocketEvent(
        req,
        otherParticipant._id?.toString(),
        ChatEventEnum.LEAVE_CHAT_EVENT,
        payload
      );
  
    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Chat deleted successfully"));
  });

const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: { $elemMatch: { $eq: req.user._id } },
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatCommonAggregation(),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, chats || [], "User chats fetched successfully"));
});

export {
  getAllChats,
  createOrGetOneOnOneChat,
  getGroupChatDetails,
  createGroupChat,
  renameGroupChat,
  deleteGroupChat,
  removeParticipantFromGroupChat,
  addNewParticipantGroupInChat,
  leaveGroupChat,
  deleteOneOnOneChat,
  searchAvailableUser
};
