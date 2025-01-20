import { body } from "express-validator"
import { partnerTypeEnum } from "../../constants.js"


const registerMechanicValidaor = () => {
 return   [
        body('first_name')
            .notEmpty()
            .withMessage('First name is required'),
        body('last_name')
            .notEmpty()
            .withMessage('Last name is required'),
        body('phone_number')
            .notEmpty()
            .withMessage('Phone number is required')
            .isLength({ min: 10, max: 15 })
            .withMessage('Phone number must be between 10 and 15 characters long'),
        body('experience')
            .notEmpty()
            .withMessage('Experience is required'),
        body('partnerType')
            .notEmpty()
            .withMessage('Partner type is required')
            .isIn(Object.values(partnerTypeEnum))
            .withMessage(`Partner type must be one of the following: ${Object.values(partnerTypeEnum).join(', ')}`),
        body('address')
            .notEmpty()
            .withMessage('Address is required'),
        body('latitude')
            .notEmpty()
            .withMessage('Latitude is required'),
        body('longitude')
            .notEmpty()
            .withMessage('Longitude is required'),
        body('adhar_card')
            .custom((value, { req }) => {
                if (!req.files || !req.files.adhar_card) {
                    throw new Error('Adhar card file is required');
                }
                return true;
            }),
        body('dl_card')
            .custom((value, { req }) => {
                if (!req.files || !req.files.dl_card) {
                    throw new Error('DL card file is required');
                }
                return true;
            }),
        body('verificationOtp')
            .optional()
            .isString()
            .withMessage('Verification OTP must be a string'),
        body('verificationOtpExpiry')
            .optional()
            .isISO8601()
            .withMessage('Verification OTP Expiry must be a valid date'),
        body('isParterVerified')
            .optional()
            .isBoolean()
            .withMessage('isParterVerified must be a boolean'),
    ];  
}

export {
    registerMechanicValidaor
}