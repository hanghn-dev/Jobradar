import express from "express";
import { protectRouter } from "../utils/protectRouter.js";
import { getSavedJobs } from "../controllers/getSavedJobsController.js";
import { getAppliedJobs } from "../controllers/getAppliedJobsRouters.js";
import { SaveJobs } from "../controllers/SaveJobControllers.js";
import { AppliedJob } from "../controllers/appliedJobCotrollers.js";
import { deleteApplyJob } from "../controllers/deleteApplyJobControllers.js";
import { deleteSavedJob } from "../controllers/deleteSavedJobControllers.js";
import { getJobsList } from "../controllers/getJobsList.js";
import { JobsChecking } from "../controllers/jobsControllers.js";
const router = express.Router();

router.get("/getjobs", protectRouter, getJobsList);
router.get("/saved", protectRouter, getSavedJobs);
router.get("/applied", protectRouter, getAppliedJobs);
router.get("/search", JobsChecking);

router.post("/save/:jobId", protectRouter, SaveJobs);
router.post("/apply/:jobId", protectRouter, AppliedJob);

router.delete("/deleteds/:jobId", protectRouter, deleteSavedJob);
router.delete("/deleteda/:jobId", protectRouter, deleteApplyJob);

export default router;
