import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProjectCardProps = {
  id: string;
  title: string;
  description: string;
  status: string;
  requiredSkills: string[];
  href: string;
};

export function ProjectCard({ id, title, description, status, requiredSkills, href }: ProjectCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
        <Badge tone="info">{status}</Badge>
      </div>
      <p className="line-clamp-3 text-sm text-ink-600">{description}</p>
      <div className="flex flex-wrap gap-2">
        {requiredSkills.slice(0, 4).map((skill) => (
          <Badge className="bg-white" key={`${id}-${skill}`} tone="neutral">
            {skill}
          </Badge>
        ))}
      </div>
      <Link className="inline-flex text-sm font-semibold text-brand-700" href={href}>
        Xem chi tiết
      </Link>
    </Card>
  );
}
