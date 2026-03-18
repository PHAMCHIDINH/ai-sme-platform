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

export function ApplyButton({ projectId, matchScore }: ApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleApply() {
    setIsLoading(true);
    const result = await applyProject(projectId, matchScore);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Ứng tuyển thành công.");
    }

    setIsLoading(false);
  }

  return (
    <Button
      className="flex-1 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
      disabled={isLoading}
      onClick={handleApply}
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang gửi...
        </>
      ) : (
        "Ứng tuyển"
      )}
    </Button>
  );
}
