import React, { useEffect } from "react";
import SavedJobCard from "../components/SavedJobCard.jsx";
import { jobsStore } from "../zustand/jobsStore.js";
import SavedJobCardSkeleton from "../components/skeleton /SavedJobCardSkeleton.jsx";
import SavedJobsHeader from "../components/SavedJobsHeader.jsx";
const SavedjobsPage = () => {
  const { savedJobs, isFetchingSavedJobs, fetchSavedJobs, deleteSavedJob } =
    jobsStore();

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  if (isFetchingSavedJobs && savedJobs?.length === 0) {
    return (
      <>
        <div>
          <SavedJobCardSkeleton />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <SavedJobsHeader />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="space-y-4">
            {savedJobs?.map((job) => (
              <SavedJobCard
                key={job._id}
                title={job.jobId.title}
                company={job.jobId.company}
                deadline={job.jobId.updatedAt}
                source={job.jobId.sourcePlatform}
                url={job.jobId.sourceUrl}
                onUnsave={() => deleteSavedJob(job._id)}
              />
            ))}
            {savedJobs?.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No saved jobs found.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SavedjobsPage;
