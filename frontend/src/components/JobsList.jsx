import React from "react";
import { jobsStore } from "../zustand/jobsStore.js";
import JobCard from "./JobCard.jsx";

const JobsList = () => {
  const { jobsList } = jobsStore();
  console.log("jobsList:", jobsList);
  return (
    <div>
      <div className="flex flex-col gap-3">
        {jobsList?.map((job) => (
          <JobCard key={job._id} {...job} jobId={job._id} />
        ))}
      </div>
    </div>
  );
};

export default JobsList;
