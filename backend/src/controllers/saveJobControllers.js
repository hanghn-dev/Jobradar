import express from "express";
import SaveJob from "../schemaModel/savedJobsschema.js";

export const SaveJobs = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required" });
  }
  try {
    const existingSave = await SaveJob.findOne({
      userId,
      jobId,
    });
    if (existingSave) {
      return res.status(401).json({ message: "Job's already saved" });
    }

    const newJobUpdate = await SaveJob.create({ userId, jobId });
    res.status(201).json({ message: "Saving Job Successfully", newJobUpdate });
  } catch (error) {
    console.error("Error saving", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
