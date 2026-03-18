import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

type CandidateCardProps = {
  id: string;
  name: string;
  skills: string[];
  githubUrl?: string | null;
  matchScore: number;
  onAccept?: (studentId: string) => Promise<void>;
  onReject?: (studentId: string) => Promise<void>;
};

export function CandidateCard({
  id,
  name,
  skills,
  githubUrl,
  matchScore,
  onAccept,
  onReject,
}: CandidateCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-900">{name}</h3>
        <Badge tone="success">{formatPercent(matchScore)}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 5).map((skill) => (
          <Badge key={id + "-" + skill} tone="neutral">
            {skill}
          </Badge>
        ))}
      </div>
      {githubUrl ? (
        <a className="inline-flex text-sm font-semibold text-brand-700" href={githubUrl} rel="noreferrer" target="_blank">
          GitHub
        </a>
      ) : null}
      <div className="flex gap-2">
        <form
          action={async () => {
            "use server";
            if (onAccept) {
              await onAccept(id);
            }
          }}
        >
          <Button size="sm" type="submit">
            Chấp nhận
          </Button>
        </form>
        <form
          action={async () => {
            "use server";
            if (onReject) {
              await onReject(id);
            }
          }}
        >
          <Button size="sm" type="submit" variant="danger">
            Từ chối
          </Button>
        </form>
      </div>
    </Card>
  );
}
