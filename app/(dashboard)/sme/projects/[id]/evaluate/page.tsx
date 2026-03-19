import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvaluateForm } from "./evaluate-form";

type EvaluationActionResult = {
  error?: string;
};

function parseRating(value: FormDataEntryValue | null): number | null {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }
  return rating;
}

function formatCreatedAt(value: Date) {
  return new Date(value).toLocaleString("vi-VN");
}

export default async function EvaluatePage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session || session.user.role !== "SME") {
    return <div>Unauthorized</div>;
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      sme: true,
      progress: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      evaluations: {
        where: { type: "SME_TO_STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project) {
    return notFound();
  }

  if (project.sme.userId !== session.user.id) {
    return <div>Unauthorized access to this project</div>;
  }

  if (project.status !== "COMPLETED") {
    redirect(`/sme/projects/${project.id}`);
  }

  if (!project.progress?.student) {
    redirect(`/sme/projects/${project.id}`);
  }

  async function submitEvaluation(formData: FormData): Promise<EvaluationActionResult> {
    "use server";

    const activeSession = await auth();
    if (!activeSession || activeSession.user.role !== "SME") {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const ownedProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        sme: true,
        progress: {
          include: {
            student: true,
          },
        },
        evaluations: {
          where: { type: "SME_TO_STUDENT" },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!ownedProject || ownedProject.sme.userId !== activeSession.user.id) {
      return { error: "Bạn không có quyền đánh giá dự án này." };
    }

    if (
      ownedProject.status !== "COMPLETED" ||
      !ownedProject.progress ||
      ownedProject.evaluations.length > 0
    ) {
      return { error: "Không thể gửi đánh giá cho dự án này." };
    }

    const outputQuality = parseRating(formData.get("outputQuality"));
    const onTime = parseRating(formData.get("onTime"));
    const proactiveness = parseRating(formData.get("proactiveness"));
    const communication = parseRating(formData.get("communication"));
    const overallFit = parseRating(formData.get("overallFit"));

    if (
      outputQuality === null ||
      onTime === null ||
      proactiveness === null ||
      communication === null ||
      overallFit === null
    ) {
      return { error: "Vui lòng chọn điểm 1-5 cho tất cả tiêu chí." };
    }

    const comment = String(formData.get("comment") ?? "").trim();

    await prisma.evaluation.create({
      data: {
        projectId: ownedProject.id,
        evaluatorId: activeSession.user.id,
        evaluateeId: ownedProject.progress.student.userId,
        type: "SME_TO_STUDENT",
        outputQuality,
        onTime,
        proactiveness,
        communication,
        overallFit,
        comment: comment || null,
      },
    });

    revalidatePath(`/sme/projects/${ownedProject.id}/evaluate`);
    revalidatePath(`/sme/projects/${ownedProject.id}`);
    revalidatePath("/sme/projects");
    revalidatePath("/student/my-projects");
    revalidatePath("/student/dashboard");
    redirect(`/sme/projects/${ownedProject.id}`);
  }

  const existingEvaluation = project.evaluations[0] ?? null;
  const studentName = project.progress.student.user.name;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/sme/projects/${params.id}`}>
          <Button className="rounded-full" size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Đánh giá sinh viên</h2>
          <p className="text-sm text-muted-foreground">
            Dự án: {project.title} · Sinh viên: {studentName}
          </p>
        </div>
      </div>

      {existingEvaluation ? (
        <Card className="border-none bg-white/50 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Bạn đã gửi đánh giá cho sinh viên này</CardTitle>
            <p className="text-sm text-muted-foreground">
              Thời gian gửi: {formatCreatedAt(existingEvaluation.createdAt)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/60 p-3">
                Chất lượng đầu ra:{" "}
                <strong>{existingEvaluation.outputQuality}/5</strong>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                Đúng tiến độ: <strong>{existingEvaluation.onTime}/5</strong>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                Chủ động: <strong>{existingEvaluation.proactiveness}/5</strong>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                Giao tiếp: <strong>{existingEvaluation.communication}/5</strong>
              </div>
              <div className="rounded-xl border bg-background/60 p-3 sm:col-span-2">
                Tổng thể: <strong>{existingEvaluation.overallFit}/5</strong>
              </div>
            </div>

            {existingEvaluation.comment ? (
              <div className="rounded-xl border bg-background/60 p-4">
                <p className="mb-1 font-medium">Nhận xét</p>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {existingEvaluation.comment}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-background/60 p-4 text-muted-foreground">
                Không có nhận xét bổ sung.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EvaluateForm
          studentName={studentName}
          submitAction={submitEvaluation}
        />
      )}
    </div>
  );
}
