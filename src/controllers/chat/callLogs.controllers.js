import { CallLog } from "../../models/chat/callLog.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


// Save Call Log
// Save Call Log
export const saveCallLog = asyncHandler(async ({ chatId, from, to, startTime, endTime, missed }) => {
    await CallLog.create({ chatId, from, to, startTime, endTime, missed });
  });
  
  // Get Call Logs for a Chat
  export const getCallLogsByChatId = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
  
    const callLogs = await CallLog.find({ chatId }).sort({ startTime: -1 });
  
    res.status(200).json({ success: true, data: callLogs });
  });
  