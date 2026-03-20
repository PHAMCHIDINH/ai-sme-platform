import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full min-w-0 rounded-xl border border-border-subtle bg-white px-3.5 py-2.5 text-sm font-medium text-foreground shadow-neo-sm transition-[box-shadow,background-color,border-color] placeholder:text-text-muted focus:border-primary focus:bg-[hsl(var(--input-focus))] focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:bg-red-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
