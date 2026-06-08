import React from "react";
import { Link } from "react-router-dom";
import { BookmarkCheck, Search } from "lucide-react";
import { jobsStore } from "../zustand/jobsStore";
import SettingButton from "./SettingButton";
const SavedJobsHeader = () => {
  const { appliedJobs } = jobsStore();
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Your Applied Jobs
          </h1>
          <p className="max-w-2xl text-sm text-gray-600 md:text-base">
            Track all the jobs you've applied to and manage your application
            history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-black px-4 py-2 text-sm font-medium text-white bg-black"
          >
            {appliedJobs?.length} Jobs Saved
          </button>

          <Link to="/">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Search size={18} />
              Find Jobs
            </button>
          </Link>

          <Link to="/savedJobs">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <BookmarkCheck size={18} />
              Saved Jobs
            </button>
          </Link>

          <SettingButton />
        </div>
      </div>
    </header>
  );
};

export default SavedJobsHeader;
