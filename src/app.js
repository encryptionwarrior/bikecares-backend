import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import fs from "fs";
import { createServer } from "http";
import passport from "passport";
import path from "path";
import requestIp from "request-ip";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yaml";
import { DB_NAME } from "./constants.js";
import { dbInstance } from "./db/index.js";
import morganMiddleware from "./logger/morgan.logger.js";
import { initializeSocketIO } from "./socket/index.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import express from "express";
import { errorHandler } from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");

const swaggerDocument = YAML.parse(
  file?.replace(
    "- url: ${{server}}",
    `- url: ${process.env.FREEAPI_HOST_URL || "https://localhost:8080"}/api/v1`
  )
);

const app = express();

const httpServer = createServer(app);

console.log("this is errr", process.env.CORS_ORIGIN);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    // origin: process.env.CORS_ORIGIN,
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.set("io", io)

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin:
//       process.env.CORS_ORIGIN === "*"
//         ? "*"
//         : process.env.CORS_ORIGIN?.split(","),
//     credentials: true,
//   })
// );

console.log("this is errr", process.env.CORS_ORIGIN);

app.use(requestIp.mw());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: true,

  keyGenerator: (req, res) => {
    return req.ip;
  },

  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET || "default _secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(morganMiddleware);

import userRouter from "./routes/auth/user.routes.js";
import messageRouter from "./routes/chats/message.routes.js";
import chatRouter from "./routes/chats/chat.routes.js";
import mechanicRouter from "./routes/mechanic/mechanic.routes.js";
import bookingRouter from "./routes/bookings/booking.routes.js";
import serviceTimelime from "./routes/serviceTimeline/serviceTimeline.routes.js";
import payment from "./routes/payement/basicPayment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/mechanic", mechanicRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/service-timeline", serviceTimelime);
app.use("/api/v1/payment", payment);



//
// app.delete("/api/v1/reset-db", avoid)

app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none",
    },
    customSiteTite: "Free Api docs",
  })
);


initializeSocketIO(io);

app.use(errorHandler);

export { httpServer };
