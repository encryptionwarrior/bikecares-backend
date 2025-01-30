import { Router } from "express";
import { body, param } from "express-validator";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

export const mongoIdPathVariableValidator = (idName) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};

export const mongoIdPathRequestBodyValidator = (idName) => {
  return [
    body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};
