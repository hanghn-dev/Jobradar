import React, { useState } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { jobsStore } from "../zustand/jobsStore.js";

const filterData = [
  {
    title: "Job Type",
    name: "jobType",
    options: [
      { label: "Full-time", value: "full-time" },
      { label: "Part-time", value: "part-time" },
      { label: "Freelance", value: "freelance" },
    ],
  },
  {
    title: "Experience Level",
    name: "experienceLevel",
    options: [
      { label: "Entry Level", value: "entry" },
      { label: "Mid Level", value: "mid" },
      { label: "Senior", value: "senior" },
    ],
  },
  {
    title: "Work Mode",
    name: "workMode",
    options: [
      { label: "Remote", value: "remote" },
      { label: "On-site", value: "on-site" },
      { label: "Hybrid", value: "hybrid" },
    ],
  },
  {
    title: "Salary Range",
    name: "salary",
    options: [
      { label: "< $3k/month", value: "lt3k" },
      { label: "$3k - $6k/month", value: "3k-6k" },
      { label: "$6k - $10k/month", value: "6k-10k" },
      { label: "> $10k/month", value: "gt10k" },
    ],
  },
  {
    title: "City",
    name: "city",
    options: [
      { label: "Ha Noi", value: "Ha Noi" },
      { label: "Ho Chi Minh", value: "Ho Chi Minh City" },
      { label: "Da Nang", value: "Da Nang" },
    ],
  },
  {
    title: "Region",
    name: "region",
    options: [
      { label: "Miền Bắc", value: "Miền Bắc" },
      { label: "Miền Trung", value: "Miền Trung" },
      { label: "Miền Nam", value: "Miền Nam" },
    ],
  },
];

const JobSidebar = () => {
  const { searchJobs, isSearchingJobs } = jobsStore();
  const [list, setList] = useState({
    jobType: [],
    experienceLevel: [],
    city: [],
    region: [],
    salary: [],
    workMode: [],
  });

  const handleClick = (e) => {
    const { name, value } = e.target;
    setList((prev) => {
      const currentArray = prev[name];
      const isChoice = currentArray.includes(value);
      const updateValue = isChoice
        ? currentArray.filter((removeValue) => removeValue !== value)
        : [...currentArray, value];
      return { ...prev, [name]: updateValue };
    });
  };

  const executeJobSearch = (e) => {
    e.preventDefault();
    const payload = {
      jobType: list.jobType,
      experienceLevel: list.experienceLevel,
      city: list.city,
      region: list.region,
      salary: list.salary,
      workMode: list.workMode,
    };
    searchJobs(payload);
  };

  return (
    <aside className="w-full bg-[#2d2d2d] border border-[#4a4a4a] rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-[#5a5a5a] hover:shadow-lg">
      <div className="mb-6 border-b border-[#454545] pb-5">
        <div className="mb-2 flex items-center gap-2">
          <Filter size={18} className="text-white" />
          <h2 className="text-xl font-semibold text-white">Filters</h2>
        </div>
        <p className="text-sm text-zinc-300">
          Find jobs that match your preferences
        </p>
      </div>
      {filterData.map((section, idx) => (
        <div
          key={section.name}
          className={`py-5 ${
            idx !== filterData.length - 1 ? "border-b border-[#454545]" : ""
          }`}
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            {section.title}
          </h3>

          <div className="space-y-3">
            {section.options.map((item) => (
              <button
                name={section.name}
                value={item.value}
                onClick={handleClick}
                key={item.value}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200
                  ${
                    list[section.name].includes(item.value)
                      ? "border-sky-500 bg-sky-500/10 text-sky-300 font-semibold"
                      : "border-[#4a4a4a] bg-[#333333] text-white hover:border-sky-500 hover:bg-sky-500/5 hover:text-sky-300"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-6 pt-6">
        <button
          disabled={isSearchingJobs}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={executeJobSearch}
        >
          {isSearchingJobs ? (
            <span>Finding...</span>
          ) : (
            <>
              <SearchIcon size={16} />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default JobSidebar;
