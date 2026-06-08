import express from "express";
import SaveJob from "../schemaModel/savedJobsschema.js";

export const deleteSavedJob = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;
  const jobId = req.params.jobId;
  try {
    const havingJob = await SaveJob.findOne({ _id: jobId, userId });
    if (!havingJob) {
      return res
        .status(404)
        .json({ message: "Job not found or already deleted" });
    }
    const deleteJob = await SaveJob.findOneAndDelete({ userId, _id: jobId });
    res.status(200).json({ message: "Delete successfully", deleteJob });
  } catch (error) {
    console.error("Delete Job Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
