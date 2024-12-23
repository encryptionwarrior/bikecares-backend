import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { getAllChats } from "../../controllers/chat/chat.controllers.js";


const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllChats);

export default router;