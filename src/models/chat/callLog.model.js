const CallLogSchema = new mongoose.Schema({
    chatId: { type: String, required: true }, // Reference to the chat room
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional, user who initiated the call
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // Optional, callee (if applicable)
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    missed: { type: Boolean, default: false },
  });
  
  export const CallLog = mongoose.model("CallLog", CallLogSchema);
  