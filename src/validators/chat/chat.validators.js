import {body} from "express-validator";

const createGroupChatValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Group name  is required"),
        body("participants").isArray({
            min: 2, max: 100,
        })
        .withMessage("Participate must be an array with more than two and less than hundred members")
    ]
}

export {
    createGroupChatValidator
}