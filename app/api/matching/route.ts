import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { rankBySimilarity } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  projectId: z.string().cuid(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, embedding: true, title: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const students = await prisma.studentProfile.findMany({
    where: { NOT: { embedding: { equals: [] } } },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const ranked = rankBySimilarity(project.embedding, students).slice(0, 10).map((student) => ({
    id: student.id,
    userId: student.userId,
    name: student.user.name,
    email: student.user.email,
    skills: student.skills,
    technologies: student.technologies,
    githubUrl: student.githubUrl,
    matchScore: student.matchScore,
  }));

  return NextResponse.json({ projectId: project.id, candidates: ranked });
}