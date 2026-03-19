import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function handlePrismaApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { error: "Database connection failed. Please check DATABASE_URL on Vercel." },
      { status: 503 },
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return NextResponse.json(
      { error: "Database schema is out of date. Run prisma db push/migrate deploy." },
      { status: 500 },
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
