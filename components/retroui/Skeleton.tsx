import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md border-2 border-black bg-white/80 shadow-neo-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
