import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({ className, invalid = false, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-md border bg-white/95 px-3 py-2.5 text-sm text-ink-900 outline-none transition focus-visible:ring-2 focus-visible:ring-brand-200",
        invalid ? "border-danger-600 focus-visible:ring-danger-100" : "border-ink-200 focus-visible:border-brand-500",
        className,
      )}
    />
  );
}
