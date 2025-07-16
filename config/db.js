import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}
