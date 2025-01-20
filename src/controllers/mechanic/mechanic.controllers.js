import { Mechanic } from "../../models/mechanic/mechanic.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getLocalPath, getStaticFilePath } from "../../utils/helpers.js";



const registerMechanic = asyncHandler(async(req, res) => {
    const { first_name, last_name, phone_number, experience, partnerType, address, latitude, longitude  } = req.body;
    // take image paths from multer - adhar_card, dl_card

    const adharCardUrl = getStaticFilePath(req, req.files?.adhar_card[0]?.filename);
    const adharCardLocalPath = getLocalPath(req.files.adhar_card[0]?.filename);
    const dlCardUrl = getStaticFilePath(req, req.files?.dl_card[0]?.filename);
    const dlCardLocalPath = getLocalPath(req.files?.dl_card[0]?.filename);

    // save data 

    // generate phone number verification otp
    // send otp to phone number
    // save otp and expiry in database
 
    const mechanic = await Mechanic.create({
        user: req.user._id,
        first_name,
        last_name,
        phone_number,
        experience,
        partnerType,
        address,
        location: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
        adhar_card: {
            url: adharCardUrl,
            localPath: adharCardLocalPath,
        },
        dl_card: {
            url: dlCardUrl,
            localPath: dlCardLocalPath,
        }
    });

    if(!mechanic){
        throw new ApiError(404, "Something went wrong while registering mechanic");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, mechanic, "Avatar updated successfully"));
});

// verify otp and update db verfified true
const verifyMechanicPhone  = asyncHandler(async(req, res) => {
    // verify otp and update db verfified true
    // send verification success message
    const mechanic = await Mechanic.findByIdAndUpdate(req.params.id, {isParterVerified:true},{new:true});
    if(!mechanic){
        throw new ApiError(404, "Mechanic not found");
    }

    return res
   .status(200).json(new ApiResponse( 200, mechanic, "phone number verified successfully"));
})

export {
    registerMechanic,
    verifyMechanicPhone
}