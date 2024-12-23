import { Router } from "express";
import { loginUser, regsiterUser } from "../../controllers/auth/user.controllers.js";
import { userLoginValidator, userRegisterValidator } from "../../validators/auth/user.validators.js";
import { validate } from "../../validators/validate.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate,  regsiterUser);
router.route("/login").post(userLoginValidator(), validate,  loginUser);


export default router;