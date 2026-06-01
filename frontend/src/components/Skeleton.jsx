export function MovieCardSkeleton() {
  return (
    <div className="card bg-base-200 shadow-md overflow-hidden animate-pulse">
      <div className="h-2 bg-base-300" />
      <div className="card-body p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="h-6 bg-base-300 rounded w-3/5" />
          <div className="h-5 bg-base-300 rounded w-16" />
        </div>
        <div className="h-4 bg-base-300 rounded w-full" />
        <div className="h-4 bg-base-300 rounded w-4/5" />
        <div className="pt-4 border-t border-base-300">
          <div className="flex gap-2 mb-3">
            <div className="h-8 bg-base-300 rounded w-24" />
            <div className="h-8 bg-base-300 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 animate-pulse">
      <div className="card bg-base-200 shadow-lg overflow-hidden">
        <div className="h-2 bg-base-300" />
        <div className="card-body p-6 md:p-8 space-y-4">
          <div className="h-8 bg-base-300 rounded w-3/4" />
          <div className="h-5 bg-base-300 rounded w-20" />
          <div className="h-4 bg-base-300 rounded w-full" />
          <div className="divider my-6" />
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base-300 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-base-300 rounded w-20" />
                <div className="h-5 bg-base-300 rounded w-48" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-base-300 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-base-300 rounded w-16" />
                <div className="h-5 bg-base-300 rounded w-32" />
              </div>
            </div>
          </div>
          <div className="divider my-6" />
          <div className="h-12 bg-base-300 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export function SeatSelectionSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-pulse">
      <div className="card bg-base-200 shadow-md mb-6">
        <div className="card-body p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-2">
              <div className="h-6 bg-base-300 rounded w-40" />
              <div className="h-4 bg-base-300 rounded w-64" />
            </div>
            <div className="flex gap-3">
              <div className="h-4 bg-base-300 rounded w-20" />
              <div className="h-4 bg-base-300 rounded w-20" />
              <div className="h-4 bg-base-300 rounded w-20" />
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-base-200 shadow-md">
        <div className="pt-8 pb-4">
          <div className="w-3/4 mx-auto">
            <div className="h-2 bg-base-300 rounded-full" />
          </div>
        </div>
        <div className="card-body pt-2 pb-8 px-6">
          <div className="flex flex-col items-center gap-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-base-300 rounded" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((seat) => (
                    <div key={seat} className="w-8 h-8 bg-base-300 rounded" />
                  ))}
                </div>
                <div className="h-8 w-8 bg-base-300 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyBookingsSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-base-300 rounded w-40" />
          <div className="h-4 bg-base-300 rounded w-24 mt-2" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card bg-base-200 shadow-md overflow-hidden">
          <div className="h-1.5 bg-base-300" />
          <div className="card-body p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-base-300 rounded w-40" />
                  <div className="h-5 bg-base-300 rounded w-20" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 bg-base-300 rounded w-32" />
                  <div className="h-4 bg-base-300 rounded w-24" />
                  <div className="h-4 bg-base-300 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
