"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { applyProject } from "@/app/actions/application";
import { Button } from "@/components/ui/button";

type ApplyButtonProps = {
  projectId: string;
  matchScore: number;
};

export function ApplyButton({ projectId, matchScore, className }: ApplyButtonProps & { className?: string }) {
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
      className={className || "flex-1 rounded-none shadow-none border-0 text-base font-black uppercase hover:bg-black hover:text-white transition-colors h-14"}
      disabled={isLoading}
      onClick={handleApply}
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang gửi...
        </>
      ) : (
        "Ứng tuyển ngay"
      )}
    </Button>
  );
}
