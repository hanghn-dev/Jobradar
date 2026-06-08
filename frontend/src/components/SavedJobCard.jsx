import React from "react";
import { ExternalLink, Trash2, CalendarDays } from "lucide-react";

const SavedJobCard = ({ title, company, source, deadline, url, onUnsave }) => {
  const deadlineDate = deadline ? new Date(deadline) : null;

  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-700/60 bg-gradient-to-r from-zinc-900 to-zinc-800 p-5 shadow-lg transition-all duration-300 hover:border-zinc-500 hover:shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white sm:text-xl">
            {title}
          </h3>

          <p className="mt-1 text-sm text-zinc-300">{company}</p>

          <span className="mt-3 inline-flex w-fit rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {source}
          </span>
        </div>
        <button
          onClick={onUnsave}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-transparent px-4 py-2 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-400 hover:bg-zinc-700/40"
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>
      <div className="my-5 h-px bg-zinc-700/70" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <CalendarDays size={15} />
          <span className="text-red-300">
            Deadline:
            <span className="ml-1 font-semibold text-red-200">
              {formattedDeadline}
            </span>
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-zinc-400 hover:bg-zinc-700/40"
        >
          <ExternalLink size={15} />
          View & Apply
        </a>
      </div>
    </div>
  );
};

export default SavedJobCard;
