import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createGroupChat, createOrGetOneOnOneChat, getAllChats, getGroupChatDetails } from "../../controllers/chat/chat.controllers.js";
import { mongoIdPathVariableValidator } from "../../validators/common/mongodb.validators.js";
import { validate } from "../../validators/validate.js";
import { createGroupChatValidator } from "../../validators/chat/chat.validators.js";


const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllChats);

router.route("/c/:receiverId").post(mongoIdPathVariableValidator("receiverId"), validate, createOrGetOneOnOneChat)

router.route("/group").post(createGroupChatValidator(), validate, createGroupChat)

router.route("/group/:chatId").get(mongoIdPathVariableValidator('chatId'), validate, getGroupChatDetails)

export default router;