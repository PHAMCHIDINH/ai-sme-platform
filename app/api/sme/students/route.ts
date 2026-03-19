import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, canGenerateEmbedding } from "@/lib/openai";

// Helper function manually calculating cosine similarity
function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SME") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    // Lấy toàn bộ sinh viên
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!q || !canGenerateEmbedding()) {
      // Nếu không có query hoặc không có AI, trả về toàn bộ
      return NextResponse.json(students);
    }

    // Nếu có query, dùng AI để matching
    const queryEmbedding = await generateEmbedding(q);
    if (!queryEmbedding.length) {
      return NextResponse.json(students);
    }

    const scoredStudents = students.map((student) => {
      let score = 0;
      if (student.embedding && student.embedding.length === queryEmbedding.length) {
        score = cosineSimilarity(queryEmbedding, student.embedding);
      }
      return {
        ...student,
        matchScore: Math.round(score * 100),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(scoredStudents);
  } catch (error) {
    console.error("[SME_STUDENTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
