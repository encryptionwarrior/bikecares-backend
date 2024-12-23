import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { ApiError } from "../utils/ApiError.js";


const initializeSocketIO = (io) => {
    return io.on("connection", async(socket) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

            let token = cookies?.accessToken;

            if(!token){
                token = socket.handshake.auth?.token;
            }

            if(!token){
                throw new ApiError(401, "Un-authorize handshake. Token is missing");
            }

            // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            
            // const user = await User

        } catch (error) {
            
        }
    })
}



const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get("io").in(roomId).emit(event, payload)
}


export { initializeSocketIO, emitSocketEvent}