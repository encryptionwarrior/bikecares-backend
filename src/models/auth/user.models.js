import mongoose,  { Schema } from "mongoose";
import { AvailableSocialLogins, AvailableUserRoles, USER_TEMPORARY_TOKEN_EXPIRY, UserLoginType, UserRolesEnum } from "../../constants.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        avatar: {
            type: {
               url: String,
               localPath: String,
            },
            default: {
                url: `https://via.placeholder.com/200x200.png`,
                localPath: "",
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: AvailableUserRoles,
            default: UserRolesEnum.USER,
            required: true,
           
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        loginType: {
            type: String,
            enum: AvailableSocialLogins,
            default: UserLoginType.EMAIL_PASSWORD,
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        },
    },
    {timestamps: true}
)

userSchema.pre("save", async function (next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();

})

// userSchema.post("save", async function (user, next) {

// })


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateTemporaryToken = function () {
   const unHashedToken = crypto.randomBytes(20).toString('hex');

   const hashedToken = crypto.createHash("sha256")
   .update(unHashedToken)
   .digest("hex");

   const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

   return {unHashedToken, hashedToken, tokenExpiry};
}

export const User = mongoose.model("User", userSchema)


