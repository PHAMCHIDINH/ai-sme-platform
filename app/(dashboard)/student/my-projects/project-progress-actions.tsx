"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, Send } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActionResult = {
  success?: true;
  error?: string;
};

type ProjectProgressActionsProps = {
  entryId: string;
  entryStatus: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";
  addMilestoneAction: (formData: FormData) => Promise<ActionResult>;
  addProgressUpdateAction: (formData: FormData) => Promise<ActionResult>;
  submitDeliverableAction: (formData: FormData) => Promise<ActionResult>;
};

type PendingAction = "milestone" | "update" | "deliverable" | null;

export function ProjectProgressActions({
  entryId,
  entryStatus,
  addMilestoneAction,
  addProgressUpdateAction,
  submitDeliverableAction,
}: ProjectProgressActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [deliverableDialogOpen, setDeliverableDialogOpen] = useState(false);

  const isLocked = entryStatus === "SUBMITTED" || entryStatus === "COMPLETED";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    actionType: Exclude<PendingAction, null>,
    action: (formData: FormData) => Promise<ActionResult>,
    onSuccess: () => void,
  ) {
    event.preventDefault();
    setPendingAction(actionType);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = await action(formData);

    if (result.error) {
      toast.error(result.error);
      setPendingAction(null);
      return;
    }

    form.reset();
    onSuccess();
    router.refresh();

    if (actionType === "deliverable") {
      toast.success("Đã nộp sản phẩm, đang chờ SME nghiệm thu.");
    } else {
      toast.success("Đã cập nhật tiến độ.");
    }

    setPendingAction(null);
  }

  if (isLocked) {
    return null;
  }

  return (
    <>
      <Dialog onOpenChange={setProgressDialogOpen} open={progressDialogOpen}>
        <DialogTrigger
          render={
            <Button className="w-full bg-blue-600 hover:bg-blue-700" />
          }
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Cập nhật tiến độ
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật tiến độ dự án</DialogTitle>
            <DialogDescription>
              Thêm milestone hoặc ghi chú ngắn để SME theo dõi tiến độ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <form
              className="space-y-3 rounded-xl border bg-muted/20 p-4"
              onSubmit={(event) =>
                handleSubmit(event, "milestone", addMilestoneAction, () =>
                  setProgressDialogOpen(false),
                )
              }
            >
              <input name="progressId" type="hidden" value={entryId} />
              <div className="space-y-2">
                <Label htmlFor={`milestone-${entryId}`}>Thêm milestone</Label>
                <Input
                  id={`milestone-${entryId}`}
                  name="title"
                  placeholder="Ví dụ: Hoàn tất giao diện dashboard"
                  required
                />
              </div>
              <Button
                className="w-full"
                disabled={pendingAction !== null}
                type="submit"
              >
                {pendingAction === "milestone" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu milestone"
                )}
              </Button>
            </form>

            <form
              className="space-y-3 rounded-xl border bg-muted/20 p-4"
              onSubmit={(event) =>
                handleSubmit(event, "update", addProgressUpdateAction, () =>
                  setProgressDialogOpen(false),
                )
              }
            >
              <input name="progressId" type="hidden" value={entryId} />
              <div className="space-y-2">
                <Label htmlFor={`update-${entryId}`}>Cập nhật tiến độ</Label>
                <Textarea
                  id={`update-${entryId}`}
                  name="content"
                  placeholder="Mô tả ngắn bạn đã làm được gì hôm nay..."
                  required
                />
              </div>
              <Button
                className="w-full"
                disabled={pendingAction !== null}
                type="submit"
                variant="secondary"
              >
                {pendingAction === "update" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu cập nhật"
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={setDeliverableDialogOpen}
        open={deliverableDialogOpen}
      >
        <DialogTrigger render={<Button className="w-full" variant="outline" />}>
          <Send className="w-4 h-4 mr-2" />
          Nộp sản phẩm
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nộp sản phẩm bàn giao</DialogTitle>
            <DialogDescription>
              Gửi link sản phẩm hoàn chỉnh để SME xem và nghiệm thu.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) =>
              handleSubmit(event, "deliverable", submitDeliverableAction, () =>
                setDeliverableDialogOpen(false),
              )
            }
          >
            <input name="progressId" type="hidden" value={entryId} />
            <div className="space-y-2">
              <Label htmlFor={`deliverable-${entryId}`}>Link bàn giao</Label>
              <Input
                id={`deliverable-${entryId}`}
                name="deliverableUrl"
                placeholder="https://github.com/... hoặc https://vercel.app/..."
                required
                type="url"
              />
            </div>
            <Button className="w-full" disabled={pendingAction !== null} type="submit">
              {pendingAction === "deliverable" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                "Gửi bàn giao"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
