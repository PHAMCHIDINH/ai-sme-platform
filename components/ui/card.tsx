import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "muted" | "highlight";
  padding?: "sm" | "md" | "lg";
};

const toneStyles: Record<NonNullable<CardProps["tone"]>, string> = {
  default: "border-ink-100 bg-white",
  muted: "border-brand-100 bg-brand-50/60",
  highlight: "border-brand-200 bg-gradient-to-br from-white to-brand-50/50",
};

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className, tone = "default", padding = "md" }: CardProps) {
  return (
    <div className={cn("rounded-2xl border shadow-card", toneStyles[tone], paddingStyles[padding], className)}>
      {children}
    </div>
  );
}
