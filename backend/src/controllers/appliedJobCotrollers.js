import express from "express";
import ApplyJob from "../schemaModel/appliedJobschema.js";

export const AppliedJob = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user._id;
  const jobId = req.params.jobId;
  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required" });
  }
  try {
    const applyJob = await ApplyJob.findOne({
      userId,
      jobId,
    });
    if (applyJob) {
      return res.status(401).json({ message: "Job's already applied" });
    }

    const newJobApply = await ApplyJob.create({ userId, jobId });
    res.status(201).json({ message: "Applying Job Successfully", newJobApply });
  } catch (error) {
    console.error("Error job apply", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
