import React from "react";
import { Bookmark } from "lucide-react";
import { Backpack } from "lucide-react";
import { jobsStore } from "../zustand/jobsStore";
import { Loader2 } from "lucide-react";
const JobCard = ({
  title,
  company,
  source,
  daysLeft,
  location,
  experienceLevel,
  experience,
  salary,
  description,
  tags,
  url,
  skills,
  expiredAt,
  jobId,
  sourcePlatform,
}) => {
  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const deadlineText = expiredAt
    ? new Date(expiredAt).toLocaleDateString("en-GB")
    : "—";
  const { savingJobId, applyingJobId, saveJob, applyJob } = jobsStore();
  const isSaving = savingJobId === jobId;
  const isApplying = applyingJobId === jobId;
  const handleSave = (e) => {
    console.log("handleSave called, jobId:", jobId);
    saveJob(jobId);
  };
  const handleApply = (e) => {
    applyJob(jobId);
    console.log("jobId:", jobId);
  };

  return (
    <div className="w-full bg-[#2d2d2d] border border-[#4a4a4a] rounded-2xl p-4 sm:p-5 text-white transition-all duration-200 hover:border-[#5a5a5a] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[18px] sm:text-[20px] font-semibold leading-tight truncate">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[14px] text-[#c9c9c9] truncate">{company}</p>
            {source && (
              <span className="px-2 py-0.5 rounded-md text-[11px] border border-sky-500/50 bg-sky-500/10 text-sky-300">
                {source}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="relative">
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#5a5a5a] text-zinc-300 hover:bg-[#393939] disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Bookmark size={16} strokeWidth={1.75} />
            </button>
            {isSaving && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-zinc-400 whitespace-nowrap">
                <Loader2 size={12} className="animate-spin text-zinc-400" />
              </span>
            )}
          </div>
          <div className="relative">
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-[#5a5a5a] text-zinc-300 hover:bg-[#393939] disabled:opacity-50"
              onClick={handleApply}
              disabled={isApplying}
            >
              <Backpack size={16} strokeWidth={1.75} />
            </button>
            {isApplying && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-zinc-400 whitespace-nowrap">
                <Loader2 size={12} className="animate-spin text-zinc-400" />
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[14px] text-[#d0d0d0]">
        {daysLeft && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">⌛</span>
            <span>{daysLeft}</span>
          </div>
        )}
        {location?.city && (
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>{location.city}</span>
          </div>
        )}
        {(experience || experienceLevel) && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">🧑‍🎓</span>
            <span>{capitalizeFirst(experience || experienceLevel)}</span>
          </div>
        )}
        {sourcePlatform && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔎</span>
            <span>{capitalizeFirst(sourcePlatform)}</span>
          </div>
        )}
      </div>

      {salary && (
        <div className="mt-4">
          <span className="inline-flex items-center rounded-xl bg-[#d8ebff] px-3.5 py-1.5 text-[14px] font-semibold text-[#236dc4]">
            ${salary.min}k - ${salary.max}k
          </span>
        </div>
      )}
      {description && (
        <p
          className="mt-4 text-sm leading-6 text-white/80 line-clamp-2"
          title={description}
        >
          {description}
        </p>
      )}
      {(tags || skills)?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {(tags || skills).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-xl border border-[#505050] bg-[#333333] text-[14px] text-white font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-[#454545]">
        <div className="flex items-center gap-1.5 text-[14px] text-red-400">
          <span className="text-base animate-pulse">🔥</span>
          <span>Deadline: {deadlineText}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors w-full sm:w-auto"
        >
          View Job
        </a>
      </div>
    </div>
  );
};

export default JobCard;
