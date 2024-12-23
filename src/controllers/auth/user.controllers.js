import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/auth/user.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { UserLoginType, UserRolesEnum } from "../../constants.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { emailVerificationMailgenContent, sendEmail } from "../../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the access token")
    }
}

const regsiterUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

 

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

   

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists", []);
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
        role: role || UserRolesEnum.USER
    })

  

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();


    
    user.emailVerificationExpiry = tokenExpiry;
    user.emailVerificationToken = hashedToken;
    await user.save({ validateBeforeSave: false});
    console.log("code run till here", email, password)

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            `${req.protocl}://${req.get(
                "host"
            )}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(200, {user: createdUser}, "Users registered successfully and verification email has been on your email."))

});

const loginUser = asyncHandler(async(req, res) => {
    const { email, username, password } = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}],
    });

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

   if(user.loginType !== UserLoginType.EMAIL_PASSWORD){
    throw new ApiError(
        400, "You have previously registered using " + user.loginType?.toLowerCase() + ". Please use the " + user.loginType?.toLowerCase() + " login option to access your account."
    )
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials");
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

   const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
   }

   return res.status(200).cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(
    200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"
   ))

})

export {
    regsiterUser,
    loginUser
}