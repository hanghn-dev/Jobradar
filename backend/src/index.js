import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/connectDB.js";
import authRouters from "./routers/authRouters.js";
import cookieParse from "cookie-parser";
import cors from "cors";
import jobsRouters from "./routers/jobsRouters.js";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParse());

app.use("/api/auth", authRouters);
app.use("/api/jobs", jobsRouters);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("Server is running in port:" + PORT);
  connectDB();
});
