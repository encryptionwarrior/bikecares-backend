import { Router } from "express";
import { assignRole, changeCurrentPassword, forgotPasswordRequest, getCurrentUser, handleSocialLogin, loginUser, logoutUser, refreshAccessToken, regsiterUser, resendEmailVerification, resetForgottenPassword, updateUserAvatar, verifyEmail } from "../../controllers/auth/user.controllers.js";
import { userAssignRoleValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userLoginValidator, userRegisterValidator, userResetForgottenPasswordValidator } from "../../validators/auth/user.validators.js";
import { validate } from "../../validators/validate.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import { verifyPermission, verifyJWT } from "../../middlewares/auth.middleware.js"
import { UserRolesEnum } from "../../constants.js";
import passport from "passport"
import { mongoIdPathVariableValidator } from "../../validators/common/mongodb.validators.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate,  regsiterUser);
router.route("/login").post(userLoginValidator(), validate,  loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

  router
  .route("/reset-password/:resetToken")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );

  router.route("/logout").post(verifyJWT, logoutUser);

  router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
  router.route("/current-user").get(verifyJWT, getCurrentUser);
  router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );

  router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

  router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );


  // SSO routes
router.route("/google").get(
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
    (req, res) => {
      res.send("redirecting to google...");
    }
  );
  
  router.route("/github").get(
    passport.authenticate("github", {
      scope: ["profile", "email"],
    }),
    (req, res) => {
      res.send("redirecting to github...");
    }
  );
  
  router
    .route("/google/callback")
    .get(passport.authenticate("google"), handleSocialLogin);
  
  router
    .route("/github/callback")
    .get(passport.authenticate("github"), handleSocialLogin);

export default router;