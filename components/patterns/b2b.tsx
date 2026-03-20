import * as React from "react";
import { LucideIcon } from "lucide-react";

import { Badge } from "@/components/retroui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { cn } from "@/lib/utils";

type Tone = "brand" | "success" | "warning" | "danger" | "neutral";

const toneClassNames: Record<Tone, string> = {
  brand: "bg-brand-200 text-primary border-primary/15",
  success: "bg-lime-200 text-success border-success/15",
  warning: "bg-yellow-200 text-warning border-warning/15",
  danger: "bg-red-200 text-danger border-danger/15",
  neutral: "bg-surface-muted text-text-muted border-border-subtle",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-hero">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <div className="space-y-2">
            <h1 className="retro-heading">{title}</h1>
            {description ? <p className="retro-subheading max-w-2xl">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="metric-label">{label}</p>
          <div className="stat-value">{value}</div>
          {description ? <p className="text-sm text-text-muted">{description}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("rounded-2xl border px-3 py-3 shadow-neo-sm", toneClassNames[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-card-muted flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
      {Icon ? (
        <div className="rounded-2xl border border-border-subtle bg-white p-4 shadow-neo-sm">
          <Icon className="h-6 w-6 text-text-muted" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-strong">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusChip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge className={cn("border px-2.5 py-1 text-[11px]", toneClassNames[tone], className)}>
      {children}
    </Badge>
  );
}

export function WorkflowStep({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: string;
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="surface-card flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="eyebrow">{step}</span>
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-strong">{title}</h3>
        <p className="text-sm leading-6 text-text-muted">{description}</p>
      </div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-muted p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-text-strong">{title}</h3>
        {description ? <p className="text-sm text-text-muted">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
