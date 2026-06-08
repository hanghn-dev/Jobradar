import express from "express";
import ApplyJob from "../schemaModel/appliedJobschema.js";

export const getAppliedJobs = async (req, res) => {
  const userId = req.user._id;
  try {
    const appliedJobs = await ApplyJob.find({ userId }).populate("jobId");
    res.status(200).json({ appliedJobs });
  } catch (error) {
    console.error("Get appliedJobs Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
