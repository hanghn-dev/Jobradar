import mongoose, { Schema } from "mongoose";

const applyJobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true }
);

const ApplyJob = mongoose.model("ApplyJob", applyJobSchema);
export default ApplyJob;
