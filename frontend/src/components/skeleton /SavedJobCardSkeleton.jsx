const SavedJobCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 animate-pulse">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="h-8 w-16 rounded-lg bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
};

export default SavedJobCardSkeleton;
