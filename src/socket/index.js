import cookie from "cookie";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth/user.models.js";
import { ChatEventEnum } from "../constants.js";
import { saveCallLog } from "../controllers/chat/callLogs.controllers.js";

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();


const mountJoinChatEvent = (socket) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        console.log(`User joined the chat . chatId: `, chatId);
        socket.join(chatId)
    })
}

const mountParticipantTypingEvent = (socket) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId)
    })
}

const mountParticipantStoppedTypingEvent = (socket) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId)
    })
}

const mountVideoCallEvents = (socket, io) => {
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
};

const activeCallTimers = new Map(); // To track timers for active calls

// const mountVideoCallEvents = (socket, io) => {
//   socket.on("user:call", ({ to, offer }) => {
//     // Emit incoming call
//     io.to(to).emit("incoming:call", { from: socket.id, offer });

//     // Start a timer to end the call if unanswered
//     const callTimeout = setTimeout(() => {
//       io.to(socket.id).emit("call:missed", { to });
//       io.to(to).emit("call:missed", { from: socket.id });

//       // Optionally save missed call log here
//       saveCallLog({
//         from: socket.user.email, // Ensure email is part of `socket.user`
//         to: socketIdToEmailMap.get(to),
//         startTime: new Date(),
//         missed: true,
//       });

//       // Clear the timer
//       activeCallTimers.delete(socket.id);
//     }, 30000); // Timeout duration (30 seconds)

//     activeCallTimers.set(socket.id, callTimeout);
//   });

//   socket.on("call:accepted", ({ to, ans }) => {
//     // If the call is accepted, clear the timeout
//     const callTimeout = activeCallTimers.get(socket.id);
//     if (callTimeout) {
//       clearTimeout(callTimeout);
//       activeCallTimers.delete(socket.id);
//     }

//     io.to(to).emit("call:accepted", { from: socket.id, ans });

//     // Save accepted call log
//     saveCallLog({
//       from: socket.user.email,
//       to: socketIdToEmailMap.get(to),
//       startTime: new Date(),
//       missed: false,
//     });
//   });

//   socket.on("call:ended", ({ to }) => {
//     io.to(to).emit("call:ended", { from: socket.id });

//     // Save call end log
//     saveCallLog({
//       from: socket.user.email,
//       to: socketIdToEmailMap.get(to),
//       startTime: new Date(), // You might need to adjust based on actual call duration
//       endTime: new Date(),
//       missed: false,
//     });
//   });

//   socket.on("disconnect", () => {
//     // Clear any active call timers on disconnect
//     const callTimeout = activeCallTimers.get(socket.id);
//     if (callTimeout) {
//       clearTimeout(callTimeout);
//       activeCallTimers.delete(socket.id);
//     }
//   });
// };

// const mountVideoCallEvents = (socket, io) => {

//   //   socket.on("room:join", (data) => {
//   //   const { chatId, room } = data;
//   //   emailToSocketIdMap.set(chatId, socket.id);
//   //   socketIdToEmailMap.set(socket.id, chatId);
//   //   io.to(room).emit("user:joined", { chatId, id: socket.id });
//   //   socket.join(room);
//   //   io.to(socket.id).emit("room:join", data);
//   // });
//   // User initiates a call
//   socket.on("user:call", ({ chatId, offer }) => {
   
//     console.log("check ud user call", chatId)
//     // Emit incoming call to other participants in the chat room
//     // io.in(chatId).emit("incoming:call", { chatId, offer });
//     socket.in(chatId).emit("incoming:call", { chatId, offer });

//     console.log("check incoming call", chatId, offer)

//     // Start a timer to end the call if unanswered
//     const callTimeout = setTimeout(() => {
//       socket.in(chatId).emit("call:missed", { chatId });

//       // Optionally save missed call log here
//       saveCallLog({
//         chatId,
//         from: socket.user._id, // Ensure user ID is available in the socket
//         to: null, // You can populate the "to" field based on participants in the chat
//         startTime: new Date(),
//         missed: true,
//       });

//       // Clear the timer
//       activeCallTimers.delete(chatId);
//     }, 30000); // Timeout duration (30 seconds)

//     activeCallTimers.set(chatId, callTimeout);
//   });

//   // Call accepted
//   socket.on("call:accepted", ({ chatId, ans }) => {
//     // Clear the call timeout
//     const callTimeout = activeCallTimers.get(chatId);
//     if (callTimeout) {
//       clearTimeout(callTimeout);
//       activeCallTimers.delete(chatId);
//     }

//     socket.in(chatId).emit("call:accepted", { chatId, ans });

//     // Save accepted call log
//     saveCallLog({
//       chatId,
//       from: socket.user._id,
//       to: null, // Populate "to" with actual participant IDs if needed
//       startTime: new Date(),
//       missed: false,
//     });
//   });

//   // Call ended
//   socket.on("call:ended", ({ chatId }) => {
//     socket.in(chatId).emit("call:ended", { chatId });

//     // Save call end log
//     saveCallLog({
//       chatId,
//       from: socket.user._id,
//       to: null, // Populate "to" if needed
//       startTime: new Date(),
//       endTime: new Date(),
//       missed: false,
//     });
//   });

//   // Clean up on disconnect
//   socket.on("disconnect", () => {
//     // Clear any active call timers associated with this user
//     for (const [chatId, timer] of activeCallTimers.entries()) {
//       clearTimeout(timer);
//       activeCallTimers.delete(chatId);
//     }
//   });
// };

const initializeSocketIO = (io) => {
    return io.on("connection", async (socket) => {
      try {
        // parse the cookies from the handshake headers (This is only possible if client has `withCredentials: true`)
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
  
        let token = cookies?.accessToken; // get the accessToken
  
        if (!token) {
          // If there is no access token in cookies. Check inside the handshake auth
          token = socket.handshake.auth?.token;
        }
  
        if (!token) {
          // Token is required for the socket to work
          throw new ApiError(401, "Un-authorized handshake. Token is missing");
        }
  
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decode the token
  
        const user = await User.findById(decodedToken?._id).select(
          "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        );
  
        // retrieve the user
        if (!user) {
          throw new ApiError(401, "Un-authorized handshake. Token is invalid");
        }
        socket.user = user; // mount te user object to the socket
  
        // We are creating a room with user id so that if user is joined but does not have any active chat going on.
        // still we want to emit some socket events to the user.
        // so that the client can catch the event and show the notifications.
        socket.join(user._id.toString());
        socket.emit(ChatEventEnum.CONNECTED_EVENT); // emit the connected event so that client is aware
        console.log("User connected 🗼. userId: ", user._id.toString());
  
        // Common events that needs to be mounted on the initialization
        mountJoinChatEvent(socket);
        mountParticipantTypingEvent(socket);
        mountParticipantStoppedTypingEvent(socket);

        mountVideoCallEvents(socket, io);
  
        socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
          console.log("user has disconnected 🚫. userId: " + socket.user?._id);
          if (socket.user?._id) {
            socket.leave(socket.user._id);
          }
        });
      } catch (error) {
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          error?.message || "Something went wrong while connecting to the socket."
        );
      }
    });
  };



const emitSocketEvent = (req, roomId, event, payload) => {
  
    req.app.get("io").in(roomId).emit(event, payload);
  };


export { initializeSocketIO, emitSocketEvent}