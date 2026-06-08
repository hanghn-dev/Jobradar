import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOO_URI);

    console.log("MongoDB is connected in:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection error", error.message);
    process.exit(1);
  }
};
