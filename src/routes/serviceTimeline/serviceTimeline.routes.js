
import {Router} from 'express';
import { verifyJWT, verifyPermission } from '../../middlewares/auth.middleware.js';
import { addIssueNotesValidator, changeserviceTimelineStatusValidator, createserviceTimelineValidator } from '../../validators/serviceTimeline/serviceTimeline.validators.js';
import { validate } from '../../validators/validate.js';
import { addIssueNotes, changeServiceTimeline, createServiceTimeline, deleteIssueTimelineNotes, getIssueNotes, getServiceTimeline, updateIssueTimelineNotes } from '../../controllers/serviceTimeline/serviceTimeline.controllers.js';
import { mongoIdPathVariableValidator } from '../../validators/common/mongodb.validators.js';
import { UserRolesEnum } from '../../constants.js';

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createserviceTimelineValidator(), validate, createServiceTimeline);
router.route("/get/:booking").get(mongoIdPathVariableValidator("booking"), validate, getServiceTimeline);
router.route("/issue-notes/:serviceTimeline").get(getIssueNotes).put(mongoIdPathVariableValidator("serviceTimeline"), addIssueNotesValidator(), verifyPermission([UserRolesEnum.MECHANIC]), validate, addIssueNotes).patch((mongoIdPathVariableValidator("serviceTimeline"), addIssueNotesValidator(), verifyPermission([UserRolesEnum.MECHANIC]), validate, updateIssueTimelineNotes)).delete(mongoIdPathVariableValidator("serviceTimeline"), verifyPermission([UserRolesEnum.MECHANIC]), validate,  deleteIssueTimelineNotes)
router.route("/:serviceTimeline").put(mongoIdPathVariableValidator("serviceTimeline"), changeserviceTimelineStatusValidator(), verifyPermission([UserRolesEnum.MECHANIC]), validate, changeServiceTimeline);

export default router;