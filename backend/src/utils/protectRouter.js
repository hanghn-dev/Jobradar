import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../schemaModel/userSchema.js";
dotenv.config();

export const protectRouter = async (req, res, next) => {
  console.log("protectRouter hit");
  console.log("cookies:", req.cookies);
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).json({ message: "No Token" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Token Invalid" });
    }
    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("ProtectRouter Checking Error");
    res.status(500).json({ message: "Server Error" });
  }
};
