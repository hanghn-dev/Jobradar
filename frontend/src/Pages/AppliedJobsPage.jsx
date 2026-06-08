import React, { useEffect } from "react";
import AppliedJobsCard from "../components/AppliedJobsCard.jsx";
import { jobsStore } from "../zustand/jobsStore.js";
import AppliedJobsSkeleton from "../components/skeleton /AppliedJobsSkeleton.jsx";
import AppliedJobsHeader from "../components/AppliedJobsHeader.jsx";
const AppliedJobsPage = () => {
  const {
    appliedJobs,
    isFetchingAppliedJobs,
    fetchAppliedJobs,
    deleteAppliedJob,
  } = jobsStore();

  useEffect(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  if (isFetchingAppliedJobs && appliedJobs?.length === 0) {
    return (
      <>
        <div>
          <AppliedJobsSkeleton />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <AppliedJobsHeader />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="space-y-4">
            {appliedJobs?.map((job) => {
              return (
                <AppliedJobsCard
                  key={job._id}
                  title={job.jobId.title}
                  company={job.jobId.company}
                  source={job.jobId.sourcePlatform}
                  url={job.jobId.sourceUrl}
                  onDelete={() => deleteAppliedJob(job._id)}
                />
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default AppliedJobsPage;
