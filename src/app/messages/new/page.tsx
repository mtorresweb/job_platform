"use client";

import { Suspense } from "react";
import NewMessageContent from "./new-message-content";
import { Skeleton } from "@/components/ui/skeleton";

function NewMessagePageFallback() {
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

export default function NewMessagePage() {
  return (
    <Suspense fallback={<NewMessagePageFallback />}>
      <NewMessageContent />
    </Suspense>
  );
}