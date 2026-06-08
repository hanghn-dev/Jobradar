import React from "react";
import { ExternalLink, Trash2 } from "lucide-react";

const AppliedJobsCard = ({ title, company, source, url, onDelete }) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-600/60 bg-[#252525] p-5 shadow-lg transition-all duration-300 hover:border-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-white">{title}</p>

        <p className="mt-1 truncate text-sm text-zinc-300">{company}</p>

        <span className="mt-3 inline-flex w-fit rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {source}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-700/40"
          aria-label="View job"
        >
          <ExternalLink size={15} />
          <span>Checking</span>
        </a>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-zinc-600 text-zinc-300 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-700/40 hover:text-white"
          aria-label="Remove from applied"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default AppliedJobsCard;
