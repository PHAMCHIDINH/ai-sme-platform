"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { applyProject } from "@/app/actions/application";
import { Button } from "@/components/retroui/Button";

type ApplyButtonProps = {
  projectId: string;
  matchScore: number;
  className?: string;
};

export function ApplyButton({ projectId, matchScore, className }: ApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleApply() {
    setIsLoading(true);
    try {
      const result = await applyProject(projectId, matchScore);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ứng tuyển thành công.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể ứng tuyển lúc này. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      className={className}
      disabled={isLoading}
      onClick={handleApply}
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang gửi...
        </>
      ) : (
        "Ứng tuyển"
      )}
    </Button>
  );
}
