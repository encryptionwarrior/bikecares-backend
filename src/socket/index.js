import cookie from "cookie";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth/user.models.js";
import { ChatEventEnum, haversineDistance } from "../constants.js";
import { saveCallLog } from "../controllers/chat/callLogs.controllers.js";



const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log(`User joined the chat . chatId: `, chatId);
    socket.join(chatId);
  });
};

const mountParticipantTypingEvent = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};


const getLiveETA = (socket, io) => {
   // Handle service partner location updates
   socket.on("joinRoom", (data) => {
    const { userId } = data;
    socket.join(userId); // Add the socket to the user-specific room
    console.log(`Socket ${socket.id} joined room ${userId}`);
  });

   const locations = {};

   socket.on("locationUpdate", (data) => {
    const { userId, userLat, userLon, partnerId, partnerLat, partnerLon, speed } = data;

  



    locations[userId] = {lat: userLat, lon: userLon};
    locations[partnerId] = {lat: partnerLat, lon: partnerLon};

    const distance = haversineDistance(userLat, userLon, partnerLat, partnerLon );
    const eta = distance/speed;
    const etaMinutes = Math.ceil(eta * 60);

    // io.to(userId).emit("locationUpdate", {
    //   userLat,
    //   userLon,
    //   partnerLat,
    //   partnerLon,
    //   eta: etaMinutes,
    //   distance: distance.toFixed(2)
    // })

    // console.log("check here location update", data)

    // io.to(partnerId).emit("locationUpdate", {
    //   userLat,
    //   userLon,
    //   partnerLat,
    //   partnerLon,
    //   eta: etaMinutes,
    //   distance: distance.toFixed(2)
    // })

     io.emit("locationUpdate", {
      userLat,
      userLon,
      partnerLat,
      partnerLon,
      eta: etaMinutes,
      distance: distance.toFixed(2)
    })

   })

  //  socket.on("partnerLocation", (data) => {
  //   const { userLat, userLon, partnerLat, partnerLon, speed } = data;

  //   // Calculate distance and ETA
  //   const distance = haversineDistance(userLat, userLon, partnerLat, partnerLon);
  //   const eta = distance / speed; // Hours
  //   const etaMinutes = Math.ceil(eta * 60); // Minutes


   

  //   // Broadcast the location and ETA to the user
  //   io.emit("locationUpdate", {
  //     partnerLat,
  //     partnerLon,
  //     eta: etaMinutes,
  //     distance: distance.toFixed(2),
  //   });
  // });
}

const activeCallTimers = new Map();
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

const mountVideoCallEvents = (socket, io) => {
  socket.on("room:join", (data) => {
    const { email, room } = data;
    console.log("check room id and chssds", email, room)
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer, email }) => {
    let socketId =  emailToSocketIdMap.get(email);

    io.to(to).emit("incomming:call", { from: socket.id, offer, email: email });
  });

  socket.on("call:accepted", ({ to, ans, email }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans, email });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("call:ended", ({ to, ans }) => {
    io.in(to).emit("call:ended", { ans });
  });

};

// const mountVideoCallEvents = (socket, io) => {
//   socket.on("room:join", (data) => {
//     const { email, room } = data;


//     emailToSocketIdMap.set(email, socket.id);
//     socketIdToEmailMap.set(socket.id, email);
//     io.to(room).emit("user:joined", { email, id: socket.id });
//     socket.join(room);
//     io.to(socket.id).emit("room:join", data);
//   });

//   socket.on("user:call", ({ to, offer }) => {
//     io.to(to).emit("incomming:call", { from: socket.id, offer });

//     // const callTimeout = setTimeout(() => {
//     //   // io.to(socket.id).emit("call:missed", { to });
//     //   io.to(to).emit("call:missed", { from: socket.id });
  
//     //   // Optionally save missed call log here
//     //   saveCallLog({
//     //     from: socket.user.email, // Ensure email is part of `socket.user`
//     //     to: socketIdToEmailMap.get(to),
//     //     startTime: new Date(),
//     //     missed: true,
//     //   });
  
//     //   // Clear the timer
//     //   activeCallTimers.delete(socket.id);
//     // }, 300000); // Timeout duration (30 seconds)
  
//     // activeCallTimers.set(socket.id, callTimeout);

//   });

//   // Start a timer to end the call if unanswered


//   socket.on("call:accepted", ({ to, ans }) => {
//     // const callTimeout = activeCallTimers.get(to);
//     // if (callTimeout) {
//     //   clearTimeout(callTimeout);
//     //   activeCallTimers.delete(to);
//     // }

//     io.to(to).emit("call:accepted", { from: socket.id, ans });
//     // Save accepted call log
//     // saveCallLog({
//     //   from: socket.user.email,
//     //   to: socketIdToEmailMap.get(to),
//     //   startTime: new Date(),
//     //   missed: false,
//     // });
//   });

//   socket.on("peer:nego:needed", ({ to, offer }) => {
//     io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//   });

//   socket.on("peer:nego:done", ({ to, ans }) => {
//     io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//   });

//   socket.on("call:ended", ({ to }) => {
//     io.to(to).emit("call:ended", { from: socket.id });

//     // Save call end log
//     // saveCallLog({
//     //   from: socket.user.email,
//     //   to: socketIdToEmailMap.get(to),
//     //   startTime: new Date(), // You might need to adjust based on actual call duration
//     //   endTime: new Date(),
//     //   missed: false,
//     // });

//     // Clear any active call timers associated with this user
//     // for (const [chatId, timer] of activeCallTimers.entries()) {
//     //   clearTimeout(timer);
//     //   activeCallTimers.delete(chatId);
//     // }
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
      getLiveETA(socket, io);
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

export { initializeSocketIO, emitSocketEvent };
