import React from "react";
import { Link } from "react-router-dom";
import { Bookmark, BriefcaseBusiness } from "lucide-react";
import SettingButton from "./SettingButton";
const FindjobsHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Find Jobs Across All Platforms
          </h1>
          <p className="max-w-2xl text-sm text-gray-600 md:text-base">
            Search 1000+ jobs from LinkedIn, Facebook, Indeed & more
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/savedJobs">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Bookmark size={18} />
              Saved Jobs
            </button>
          </Link>
          <Link to="/appliedJobs">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <BriefcaseBusiness size={18} />
              Applied Jobs
            </button>
          </Link>
          <SettingButton />
        </div>
      </div>
    </header>
  );
};

export default FindjobsHeader;
