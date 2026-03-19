import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getSessionUserIdByRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { smeProfileSchema, type SmeProfileInput } from "@/lib/validators/sme-profile";
import { SmeProfileForm } from "./sme-profile-form";

type ActionResult = {
  success?: true;
  error?: string;
};

export default async function SmeProfilePage() {
  const session = await auth();
  const smeUserId = getSessionUserIdByRole(session, "SME");

  if (!smeUserId) {
    return <div>Unauthorized</div>;
  }

  const existingProfile = await prisma.sMEProfile.findUnique({
    where: { userId: smeUserId },
    select: {
      companyName: true,
      industry: true,
      companySize: true,
      description: true,
    },
  });

  const initialValues: SmeProfileInput = {
    companyName: existingProfile?.companyName ?? "",
    industry: existingProfile?.industry ?? "",
    companySize: existingProfile?.companySize ?? "",
    description: existingProfile?.description ?? "",
  };

  async function updateSmeProfile(formData: FormData): Promise<ActionResult> {
    "use server";

    const activeSession = await auth();
    const activeSmeUserId = getSessionUserIdByRole(activeSession, "SME");

    if (!activeSmeUserId) {
      return { error: "Bạn không có quyền thực hiện thao tác này." };
    }

    const parsed = smeProfileSchema.safeParse({
      companyName: String(formData.get("companyName") ?? ""),
      industry: String(formData.get("industry") ?? ""),
      companySize: String(formData.get("companySize") ?? ""),
      description: String(formData.get("description") ?? ""),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
    }

    await prisma.sMEProfile.upsert({
      where: { userId: activeSmeUserId },
      update: parsed.data,
      create: {
        userId: activeSmeUserId,
        ...parsed.data,
      },
    });

    revalidatePath("/sme/profile");
    revalidatePath("/sme/dashboard");
    revalidatePath("/sme/projects");
    return { success: true };
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hồ sơ doanh nghiệp</h2>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin công ty để thu hút ứng viên phù hợp với dự án.
        </p>
      </div>

      <SmeProfileForm
        initialValues={initialValues}
        submitAction={updateSmeProfile}
      />
    </div>
  );
}
