import { body } from "express-validator";
import { AvailableServices } from "../../constants.js";

const createBookingValidate = () => {
    return [
        body("serviceType")
            .notEmpty().withMessage("Service Type is required")
            .isIn(AvailableServices).withMessage("Invalid Service Type"),
        body("address")
            .trim().notEmpty().withMessage("address is required"),
        body("serviceDate")
            .notEmpty().withMessage("Service Date is required")
            .isISO8601().withMessage("Service Date must be a valid date")
            .custom((value) => {
                if (new Date(value) < new Date()) {
                    throw new Error("Service Date must be in the future");
                }
                return true;
            }),
            body("garage")
            .custom((value, { req }) => {
                if (req.body.serviceType === "InGarage" && !value) {
                    throw new Error("Garage is required when serviceType is 'InGarage'");
                }
                return true;
            })
            .optional(),
        body("serviceTime")
            .trim().notEmpty().withMessage("Service Time is required"),
        body("serviceDescription")
            .optional() // Since it's optional in the schema
            .trim().isString().withMessage("Service Description must be a string"),
    ];
};

export {createBookingValidate};
