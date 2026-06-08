import express from "express";
import SaveJob from "../schemaModel/savedJobsschema.js";

export const getSavedJobs = async (req, res) => {
  const userId = req.user._id;
  try {
    const savedJobs = await SaveJob.find({ userId }).populate("jobId");
    console.log("savedJobs:", JSON.stringify(savedJobs, null, 2));
    res.status(200).json({ savedJobs });
  } catch (error) {
    console.error("Get Jobs Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
