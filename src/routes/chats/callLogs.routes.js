import {Router} from "express";
import { verifyJWT } from "../../middlewares/auth.middleware";
import {  getCallLogsByChatId } from "../../controllers/chat/callLogs.controllers";


const router = Router();

router.use(verifyJWT);

router.get("/call-logs/:chatId",  getCallLogsByChatId);

export default router;
