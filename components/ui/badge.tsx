import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border border-ink-100 bg-ink-50 text-ink-700",
  info: "border border-brand-200 bg-brand-100 text-brand-700",
  success: "border border-success-100 bg-success-100 text-success-700",
  warning: "border border-warning-100 bg-warning-100 text-warning-700",
  danger: "border border-danger-100 bg-danger-100 text-danger-700",
};

export function Badge({ children, className, tone = "neutral" }: BadgeProps) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneStyles[tone], className)}>{children}</span>;
}
