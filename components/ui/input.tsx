import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ className, invalid = false, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border bg-white/95 px-3 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-brand-200",
        invalid ? "border-danger-600 focus-visible:ring-danger-100" : "border-ink-200 focus-visible:border-brand-500",
        className,
      )}
    />
  );
}
