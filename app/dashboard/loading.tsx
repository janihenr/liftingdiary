export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
      </div>

      {/* Date Picker Skeleton */}
      <div className="mb-8">
        <div className="h-10 w-[280px] bg-muted animate-pulse rounded" />
      </div>

      {/* Workout Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
