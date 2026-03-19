import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canGenerateEmbedding, generateEmbedding } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { studentProfileSchema } from "@/lib/validators/student-profile";

function normalizeList(value: string[] | undefined) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

function listEquals(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function joinList(value: string[]) {
  return value.join(", ");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        university: true,
        major: true,
        skills: true,
        technologies: true,
        githubUrl: true,
        portfolioUrl: true,
        availability: true,
        description: true,
        interests: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        university: profile.university,
        major: profile.major,
        skills: joinList(profile.skills),
        technologies: joinList(profile.technologies),
        githubUrl: profile.githubUrl ?? "",
        portfolioUrl: profile.portfolioUrl ?? "",
        availability: profile.availability,
        description: profile.description,
        interests: joinList(profile.interests),
      },
    });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = studentProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dữ liệu hồ sơ không hợp lệ." },
        { status: 400 },
      );
    }

    const {
      university,
      major,
      skills,
      technologies,
      githubUrl,
      portfolioUrl,
      availability,
      description,
      interests,
    } = parsed.data;

    // Tách mảng
    const skillsArray = normalizeList(
      skills.split(","),
    );
    const techArray = normalizeList(
      technologies.split(","),
    );
    const interestsArray = normalizeList(
      interests.split(","),
    );

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        major: true,
        skills: true,
        technologies: true,
        interests: true,
        description: true,
        embedding: true,
      },
    });

    const shouldRegenerateEmbedding =
      canGenerateEmbedding() &&
      (
        !existingProfile ||
        existingProfile.major !== major ||
        existingProfile.description !== description ||
        !listEquals(existingProfile.skills, skillsArray) ||
        !listEquals(existingProfile.technologies, techArray) ||
        !listEquals(existingProfile.interests, interestsArray)
      );

    const embedding = shouldRegenerateEmbedding
      ? await generateEmbedding(
          `Chuyên ngành: ${major}. Kỹ năng: ${skillsArray.join(", ")}. Công nghệ: ${techArray.join(", ")}. Lĩnh vực quan tâm: ${interestsArray.join(", ")}. Mô tả: ${description}`,
        )
      : existingProfile?.embedding ?? [];

    // Upsert Student Profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        university,
        major,
        skills: skillsArray,
        technologies: techArray,
        githubUrl,
        portfolioUrl,
        availability,
        description,
        interests: interestsArray,
        ...(shouldRegenerateEmbedding ? { embedding } : {}),
      },
      create: {
        userId: session.user.id,
        university,
        major,
        skills: skillsArray,
        technologies: techArray,
        githubUrl,
        portfolioUrl,
        availability,
        description,
        interests: interestsArray,
        embedding,
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
