import { Router } from "express";
import { validate } from "../../validators/validate.js";
import { registerMechanicValidaor } from "../../validators/mechanic/mechanic.validators.js";
import { registerMechanic } from "../../controllers/mechanic/mechanic.controllers.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-mechanic").post(
 upload.fields([
      {
        name: "adhar_card",
        maxCount: 1,
      },
      {
        name: "dl_card",
        maxCount: 1,
      },
    ]),
    registerMechanicValidaor(), validate, 
       registerMechanic);

    router.route("/verify-mechanic").get(verifyJWT, registerMechanicValidaor);

export default router;