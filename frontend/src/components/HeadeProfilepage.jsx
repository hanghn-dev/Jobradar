import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { jobsStore } from "../zustand/jobsStore";
import SettingButton from "./SettingButton.jsx";
const HeadeProfilepage = () => {
  const { savedJobs, appliedJobs } = jobsStore();
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="max-w-2xl text-sm text-gray-600 md:text-base">
            Manage your personal information and update your profile picture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-white transition bg-black"
            >
              <Search size={18} />
              Find Jobs
            </button>
          </Link>
          <Link to="/savedJobs">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-white transition bg-black"
            >
              {savedJobs?.length} Saved Jobs
            </button>
          </Link>

          <Link to="/appliedJobs">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              {appliedJobs?.length} Applied Jobs
            </button>
          </Link>

          {/* Nút Settings */}
          <SettingButton />
        </div>
      </div>
    </header>
  );
};

export default HeadeProfilepage;
