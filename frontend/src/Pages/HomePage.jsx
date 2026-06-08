import React, { useEffect } from "react";
import FindjobsHeader from "../components/FindjobsHeader";
import JobSidebar from "../components/JobSidebar";
import JobsList from "../components/JobsList";
import { jobsStore } from "../zustand/jobsStore.js";
import { Loader } from "lucide-react";

const HomePage = () => {
  const { jobsList, isLoadingJobs, getJobs } = jobsStore();

  useEffect(() => {
    getJobs();
  }, [getJobs]);

  if (isLoadingJobs && jobsList.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <Loader className="animate-spin size-5" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <FindjobsHeader />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-start gap-6">
          <aside className="w-72 shrink-0">
            <JobSidebar />
          </aside>
          <main className="flex-1 min-w-0">
            <JobsList />
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
