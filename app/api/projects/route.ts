import { Difficulty, ProjectStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { generateEmbedding } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  standardizedBrief: z.string().optional(),
  expectedOutput: z.string().min(3),
  requiredSkills: z.array(z.string()).default([]),
  difficulty: z.nativeEnum(Difficulty),
  duration: z.string().min(2),
  budget: z.string().optional(),
  deadline: z.string().datetime().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.OPEN),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "SME") {
    const smeProfile = await prisma.sMEProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!smeProfile) {
      return NextResponse.json([]);
    }

    const projects = await prisma.project.findMany({
      where: { smeId: smeProfile.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  }

  const projects = await prisma.project.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SME") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createProjectSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile =
      (await prisma.sMEProfile.findUnique({ where: { userId: session.user.id } })) ||
      (await prisma.sMEProfile.create({
        data: {
          userId: session.user.id,
          companyName: "SME Company",
          industry: "General",
          companySize: "1-10",
          description: "SME profile auto-created",
        },
      }));

    const embeddingText = [
      parsed.data.title,
      parsed.data.description,
      parsed.data.requiredSkills.join(" "),
    ]
      .filter(Boolean)
      .join("\n");

    const embedding = await generateEmbedding(embeddingText);

    const project = await prisma.project.create({
      data: {
        smeId: profile.id,
        title: parsed.data.title,
        description: parsed.data.description,
        standardizedBrief: parsed.data.standardizedBrief,
        expectedOutput: parsed.data.expectedOutput,
        requiredSkills: parsed.data.requiredSkills,
        difficulty: parsed.data.difficulty,
        duration: parsed.data.duration,
        budget: parsed.data.budget,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        status: parsed.data.status,
        embedding,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project", details: String(error) },
      { status: 500 },
    );
  }
}