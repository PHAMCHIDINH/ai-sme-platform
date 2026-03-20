"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Building2, Check, Flame, Loader2, X } from "lucide-react";

import { respondToInvitation } from "@/app/actions/application";
import { Button } from "@/components/retroui/Button";

type Invitation = {
  projectId: string;
  project: {
    title: string;
    expectedOutput: string;
    budget: string | null;
    duration: string;
    sme: {
      companyName: string;
    };
  };
};

export function InvitationCard({ invitation }: { invitation: Invitation }) {
  const respondMutation = useMutation({
    mutationFn: async (status: "ACCEPTED" | "REJECTED") => {
      const res = await respondToInvitation(invitation.projectId, status);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: (_, status) => {
      toast.success(status === "ACCEPTED" ? "Đã nhận lời mời tham gia dự án." : "Đã từ chối lời mời.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    },
  });

  return (
    <div className="surface-card mb-6 overflow-hidden p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-brand-100 px-3 py-1 text-xs font-medium text-primary">
            <Flame className="h-3.5 w-3.5" />
            Lời mời trực tiếp từ doanh nghiệp
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm text-text-muted">
              <Building2 className="h-4 w-4" />
              {invitation.project.sme.companyName}
            </div>
            <h3 className="text-xl font-semibold text-text-strong">{invitation.project.title}</h3>
            <p className="max-w-2xl text-sm leading-7 text-text-muted">{invitation.project.expectedOutput}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-text-muted">
            <span className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1">
              Ngân sách: {invitation.project.budget || "Thỏa thuận"}
            </span>
            <span className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1">
              Thời lượng: {invitation.project.duration}
            </span>
          </div>
        </div>

        <div className="flex w-full gap-3 lg:w-auto">
          <Button
            className="flex-1 lg:flex-none"
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate("REJECTED")}
            type="button"
            variant="outline"
          >
            {respondMutation.isPending && respondMutation.variables === "REJECTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Từ chối
          </Button>
          <Button
            className="flex-1 lg:flex-none"
            disabled={respondMutation.isPending}
            onClick={() => respondMutation.mutate("ACCEPTED")}
            type="button"
          >
            {respondMutation.isPending && respondMutation.variables === "ACCEPTED" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Nhận dự án
          </Button>
        </div>
      </div>
    </div>
  );
}
