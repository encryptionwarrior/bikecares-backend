import { Router } from "express";
import { validate } from "../../validators/validate.js";
import { sendMessageValidator } from "../../validators/chat/message.validation.js";
import { mongoIdPathVariableValidator } from "../../validators/common/mongodb.validators.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import {
  deleteMessage,
  getAllMessage,
  sendMessage,
} from "../../controllers/chat/message.controllers.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessage)
  .post(
    upload.fields([
      {
        name: "attachments",
        maxCount: 5,
      },
    ]),
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    validate,
    sendMessage
  );

router
  .route("/:chatId/:messageId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteMessage);

export default router;
