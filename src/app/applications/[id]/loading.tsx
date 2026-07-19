export default function ApplicationDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-7 w-64 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-xl border bg-muted/50" />
    </div>
  );
}
