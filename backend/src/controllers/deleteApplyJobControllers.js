import express from "express";
import ApplyJob from "../schemaModel/appliedJobschema.js";

export const deleteApplyJob = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;
  const jobId = req.params.jobId;
  try {
    const havingJob = await ApplyJob.findOne({ userId, _id: jobId });
    if (!havingJob) {
      return res
        .status(404)
        .json({ message: "Job not found or already deleted" });
    }
    const deleteJob = await ApplyJob.findOneAndDelete({ userId, _id: jobId });
    res.status(200).json({ message: "Delete successfully", deleteJob });
  } catch (error) {
    console.error("Delete Job Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
