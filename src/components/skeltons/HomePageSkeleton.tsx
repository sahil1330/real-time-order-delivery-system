import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

function HomePageSkeleton() {
  return (
    <div className="animate-pulse flex flex-wrap justify-center gap-6 my-6 mx-auto space-x-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="w-[400px] h-96">
          <CardHeader>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded" />
          </CardContent>
          <CardFooter className="gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default HomePageSkeleton;
