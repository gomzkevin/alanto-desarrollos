import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const MetricsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="flex-1 space-y-6 p-8 pt-6">
    {/* Header */}
    <div className="flex items-center justify-between space-y-2">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Metrics Cards Grid */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
    </div>
    
    {/* Charts Grid */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="lg:col-span-4">
        <ChartSkeleton />
      </div>
      <div className="lg:col-span-3">
        <ChartSkeleton />
      </div>
    </div>
    
    {/* Recent Activity */}
    <TableSkeleton />
  </div>
);