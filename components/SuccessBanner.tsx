"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export function SuccessBanner() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (success !== "true") return null;

  return (
    <div className="fixed left-6 top-26 z-50 max-w-md bg-green-500/10 border border-green-500/30 text-green-800 dark:text-green-400 rounded-xl p-4 flex items-start gap-3 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-1000">
      <CheckCircle className="size-5 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold font-main">Success!</p>
        <p className="text-sm">
          Your availability has been successfully recorded for the event. You
          can safely close this page.
        </p>
      </div>
    </div>
  );
}
