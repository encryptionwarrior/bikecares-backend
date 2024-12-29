;
import dotenv from "dotenv";
import logger from "./logger/winston.logger.js";
import { httpServer } from "./app.js";
import connectDB from "./db/index.js"

dotenv.config({
    path: "./.env",
})



const majorNodeVersion= +process.env.NODE_VERSION?.split(".")[0] || 0;

const startServer = () => {
    const port = process.env.PORT || 8080;
    httpServer.listen(process.env.PORT || 8080, () => {
        logger.info(
            `Visit the documentation at: http://localhost:${port}`
        );

        logger.info(`Server is running on port: ${port} `)
    })
}

if(majorNodeVersion >= 14){
    try {
        await connectDB();
        startServer();
    } catch (err) {
        logger.error("Mongo db connect error: ", err);
    }
} else {
    connectDB()
    .then(() => {
        startServer()
    })
    .catch((err) => {
        logger.error("Mongo db connect error: ", err);
    })
}

// const app = express();

// const PORT = 3000;

// app.use(express.json())

// app.get("/", (req: Request, res: Response) => {
//     res.send("Hello typescript with express!")
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`)
// })