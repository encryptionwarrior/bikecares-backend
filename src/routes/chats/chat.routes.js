import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { addNewParticipantGroupInChat, createGroupChat, createOrGetOneOnOneChat, deleteGroupChat, deleteOneOnOneChat, getAllChats, getGroupChatDetails, leaveGroupChat, removeParticipantFromGroupChat, renameGroupChat, searchAvailableUser } from "../../controllers/chat/chat.controllers.js";
import { mongoIdPathVariableValidator } from "../../validators/common/mongodb.validators.js";
import { validate } from "../../validators/validate.js";
import { createGroupChatValidator, updateGroupChatNameValidator } from "../../validators/chat/chat.validators.js";


const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailableUser)

router.route("/c/:receiverId").post(mongoIdPathVariableValidator("receiverId"), validate, createOrGetOneOnOneChat)

router.route("/group").post(createGroupChatValidator(), validate, createGroupChat)

router.route("/group/:chatId").get(mongoIdPathVariableValidator('chatId'), validate, getGroupChatDetails).patch(mongoIdPathVariableValidator("chatId"), updateGroupChatNameValidator(), validate, renameGroupChat).delete(mongoIdPathVariableValidator("chatId"), validate, deleteGroupChat)

router.route("/group/:chatId/:participantId").post(mongoIdPathVariableValidator("chatId"), mongoIdPathVariableValidator("participantId"), validate, addNewParticipantGroupInChat).delete(mongoIdPathVariableValidator("chatId"), mongoIdPathVariableValidator("participantId"), validate, removeParticipantFromGroupChat)

router.route("/leave/group/:chatId").delete(mongoIdPathVariableValidator("chatId"), validate, leaveGroupChat)

router.route("/remove/:chatId").delete(mongoIdPathVariableValidator("chatId"), validate, deleteOneOnOneChat)

export default router;