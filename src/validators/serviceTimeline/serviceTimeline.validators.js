import { body } from "express-validator";
import { mongoIdPathRequestBodyValidator } from "../common/mongodb.validators.js";
import { AvailableServiceTimelineStatuses } from "../../constants.js";


const createserviceTimelineValidator = () =>{ 
    return [
        mongoIdPathRequestBodyValidator("booking"),
        mongoIdPathRequestBodyValidator("mechanic"),
    ]
}


const changeserviceTimelineStatusValidator = () =>{ 
    return [
        body("status").notEmpty().withMessage("booking status is required").isIn(AvailableServiceTimelineStatuses).withMessage("Invalid status")
    ]
}

const addIssueNotesValidator = () => {
    return [
        body("issueName")
            .notEmpty()
            .withMessage("Issue Name is required")
            .isString()
            .withMessage("Issue Name must be a string"),
        body("timeToFix")
            .notEmpty()
            .withMessage("Time to fix is required")
            .isString()
            .withMessage("Time to fix must be a string"),
        body("sparePart") // Note the singular "sparePart" matches the schema
            .optional() // It's optional based on the schema
            .isString()
            .withMessage("Spare part must be a string"),
        body("charge")
            .notEmpty()
            .withMessage("Charge is required")
            .isString()
            .withMessage("Charge must be a string"),
    ];
};
export {
    createserviceTimelineValidator, 
    changeserviceTimelineStatusValidator,
    addIssueNotesValidator
}