import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { generateEmbedding } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  university: z.string().min(2),
  major: z.string().min(2),
  skills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  availability: z.string().min(2),
  description: z.string().min(10),
  interests: z.array(z.string()).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: { project: true },
      },
    },
  });

  if (!profile) {
    return NextResponse.json(null);
  }

  const completedProjects = profile.applications.filter(
    (application) => application.project.status === "COMPLETED" && application.status === "ACCEPTED",
  );

  const evaluations = await prisma.evaluation.findMany({
    where: {
      type: "SME_TO_STUDENT",
      evaluateeId: session.user.id,
    },
  });

  const avgRating = evaluations.length
    ? evaluations.reduce((sum, item) => sum + item.overallFit, 0) / evaluations.length
    : 0;

  return NextResponse.json({
    ...profile,
    completedProjectsCount: completedProjects.length,
    avgRating,
    completedProjects: completedProjects.map((application) => ({
      id: application.project.id,
      title: application.project.title,
      deliverableUrl: null,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const embeddingInput = [
      parsed.data.skills.join(" "),
      parsed.data.technologies.join(" "),
      parsed.data.interests.join(" "),
      parsed.data.description,
    ]
      .filter(Boolean)
      .join("\n");

    const embedding = await generateEmbedding(embeddingInput);

    const profile = await prisma.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        university: parsed.data.university,
        major: parsed.data.major,
        skills: parsed.data.skills,
        technologies: parsed.data.technologies,
        githubUrl: parsed.data.githubUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        availability: parsed.data.availability,
        description: parsed.data.description,
        interests: parsed.data.interests,
        embedding,
      },
      create: {
        userId: session.user.id,
        university: parsed.data.university,
        major: parsed.data.major,
        skills: parsed.data.skills,
        technologies: parsed.data.technologies,
        githubUrl: parsed.data.githubUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        availability: parsed.data.availability,
        description: parsed.data.description,
        interests: parsed.data.interests,
        embedding,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save profile", details: String(error) },
      { status: 500 },
    );
  }
}