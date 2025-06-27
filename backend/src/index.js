import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors"; // CORS middleware to allow cross-origin requests (helps with frontend-backend communication)
import {app,server,io} from "./lib/socket.js"; // Importing the socket.io server setup

import path from "path";

dotenv.config(); // use to read env file


const PORT = process.env.PORT;
const __dirname = path.resolve();

// app.use(express.json()); 
// Allow larger JSON and URL‑encoded payloads (e.g., 10MB)
app.use(express.json({ limit: '10mb' })); // Middleware used to parse JSON request body
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); // allows to parse the cookie
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/ ,(req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
	console.log("Server is running on port", +PORT);
	connectDB();
});
