import mongoose, { Schema } from "mongoose";

const savedJobSchema = new Schema(
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

const SaveJob = mongoose.model("SaveJob", savedJobSchema);
export default SaveJob;
