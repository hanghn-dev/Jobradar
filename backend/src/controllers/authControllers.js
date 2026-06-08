import express from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../utils/cloudinary.js";
import User from "../schemaModel/userSchema.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(401).json({ message: "Please fill all information" });
    }
    const reGexemail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reGexemail.test(email)) {
      return res.status(401).json({ message: "Email form invalid" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({ message: "This email's already used" });
    }
    if (password.length < 6) {
      return res
        .status(401)
        .json({ message: "Password need at least 6 characters" });
    }

    const genPass = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, genPass);

    const newUser = new User({
      fullName,
      email,
      password: hashedPass,
    });
    await newUser.save();
    generateToken(newUser._id, res);
    res.status(201).json({
      fullName,
      email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error("Information Invalid", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(401).json({ message: "Please fill fully information" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "This email doesn't exist" });
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    generateToken(user._id, res);

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Data Invalid", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Successful logout" });
  } catch (error) {
    console.error("Could not logout", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    return res
      .status(200)
      .json({ message: "Checking Auth sucessfully", user: req.user });
  } catch (error) {
    console.error("Checking Auth Error", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const profileUpdate = async (req, res) => {
  const userId = req.user._id;
  const { profilePic } = req.body;
  try {
    if (profilePic === undefined || profilePic === null) {
      return res.status(401).json({ message: "No profilePic" });
    }

    if (profilePic) {
      const putCloud = await cloudinary.uploader.upload(profilePic);
      console.log("CLOUD:", putCloud.secure_url);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: putCloud.secure_url,
        },
        { new: true }
      );
      console.log(updatedUser);
      return res.status(200).json({
        message: "Update profilePic successfully",
        profilePic: updatedUser.profilePic,
      });
    }
    if (profilePic === "") {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: "" },
        { new: true }
      );
      return res.status(200).json({
        message: "Update profilePic successfully",
        profilePic: updatedUser.profilePic,
      });
    }
  } catch (error) {
    console.error("Update profilePic Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
