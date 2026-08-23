import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-4/5 rounded-card" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          <Skeleton className="h-13 w-40 rounded-full" />
        </div>
      </div>
    </div>
  )
}
