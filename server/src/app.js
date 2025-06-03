import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger/index.js';
import path from "path";//for deployment

const app = express();

// //deployment
// const _dirname = path.resolve();


app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(express.json({ limit: "100kb" }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes import
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import customerRouter from "./routes/customer.route.js";
import orderRouter from "./routes/order.route.js";
import AIRouter from "./routes/ai.route.js";
import segmentRouter from "./routes/segment.route.js";
import globalErrorHandler from "./middleware/errorhandler.middleware.js";

// routes declaration
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/customer", customerRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", AIRouter);
app.use("/api/segment", segmentRouter);


app.use(globalErrorHandler);

// //deployment
// app.use(express.static(path.join(_dirname, "client/dist")));
// app.get('*' , (_,res)=>{
//     res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
// })


export { app };
