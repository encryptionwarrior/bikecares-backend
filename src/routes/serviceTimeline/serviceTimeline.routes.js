
import {Router} from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { addIssueNotesValidator, changeserviceTimelineStatusValidator, createserviceTimelineValidator } from '../../validators/serviceTimeline/serviceTimeline.validators.js';
import { validate } from '../../validators/validate.js';
import { addIssueNotes, changeServiceTimeline, createServiceTimeline, deleteIssueTimelineNotes, getServiceTimeline, updateIssueTimelineNotes } from '../../controllers/serviceTimeline/serviceTimeline.controllers.js';
import { mongoIdPathVariableValidator } from '../../validators/common/mongodb.validators.js';

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createserviceTimelineValidator(), validate, createServiceTimeline);
router.route("/get/:booking").get(mongoIdPathVariableValidator("booking"), validate, getServiceTimeline);
router.route("/status/:serviceTimeline").put(mongoIdPathVariableValidator("serviceTimeline"), addIssueNotesValidator(), validate, addIssueNotes).patch((mongoIdPathVariableValidator("serviceTimeline"), addIssueNotesValidator(), validate, updateIssueTimelineNotes)).delete(mongoIdPathVariableValidator("serviceTimeline"), validate, deleteIssueTimelineNotes)
router.route("/:serviceTimeline").put(mongoIdPathVariableValidator("serviceTimeline", validate, ), changeserviceTimelineStatusValidator(), validate, changeServiceTimeline);

export default router;