import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-64" />
      <div className="mt-6 flex gap-2 border-b border-line pb-6">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
