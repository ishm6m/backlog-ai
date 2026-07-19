export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/50" />
        ))}
      </div>
      <div className="h-24 animate-pulse rounded-xl border bg-muted/50" />
    </div>
  );
}
