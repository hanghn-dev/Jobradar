import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    requirements: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "freelance"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      required: true,
    },

    location: {
      city: {
        type: String,
        default: null,
      },
      region: {
        type: String,
        default: null,
      },
    },

    workMode: {
      type: String,
      enum: ["remote", "on-site", "hybrid"],
      required: true,
    },

    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["USD", "VND", "EUR", "SGD"],
        required: true,
      },
      period: {
        type: String,
        enum: ["month", "hour", "year"],
        required: true,
      },
    },

    sourcePlatform: {
      type: String,
      enum: ["linkedin", "facebook", "indeed", "toptal"],
      required: true,
    },

    sourceUrl: {
      type: String,
      required: true,
      unique: true,
    },

    expiredAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
jobSchema.index({ jobType: 1, experienceLevel: 1, workMode: 1 });
jobSchema.index({ sourcePlatform: 1, expiredAt: 1 });
jobSchema.index({ "location.city": 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: "text", company: "text" });
const Job = mongoose.model("Job", jobSchema);
export default Job;
