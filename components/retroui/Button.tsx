"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-subtle text-sm font-semibold transition-[background-color,color,box-shadow,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-neo-sm hover:bg-[hsl(var(--primary-hover))] hover:shadow-neo-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-neo-sm hover:bg-[hsl(var(--secondary-hover))] hover:shadow-neo-md",
        outline:
          "bg-white text-foreground shadow-neo-sm hover:bg-surface-muted hover:shadow-neo-md",
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:bg-accent",
        destructive:
          "bg-destructive text-destructive-foreground shadow-neo-sm hover:bg-[hsl(var(--destructive-hover))] hover:shadow-neo-md",
        link:
          "h-auto border-transparent bg-transparent px-0 py-0 font-semibold text-foreground shadow-none hover:text-primary hover:underline",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
