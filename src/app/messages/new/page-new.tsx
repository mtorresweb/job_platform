"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import NewMessageContent from "./new-message-content";

export default function NewMessagePage() {
  return (
    <Suspense fallback={<NewMessagePageSkeleton />}>
      <NewMessageContent />
    </Suspense>
  );
}

function NewMessagePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
