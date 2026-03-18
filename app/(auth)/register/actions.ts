"use server";

import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
});

export async function registerAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "") as Role,
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    redirect("/register?error=invalid_input");
  }

  const existed = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existed) {
    redirect("/register?error=email_exists");
  }

  const password = await hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password,
      role: parsed.data.role,
    },
  });

  if (parsed.data.role === "SME") {
    await prisma.sMEProfile.create({
      data: {
        userId: user.id,
        companyName: `${parsed.data.name} Company`,
        industry: "General",
        companySize: "1-10",
        description: "SME moi dang cap nhat profile",
      },
    });
  }

  if (parsed.data.role === "STUDENT") {
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        university: "",
        major: "",
        availability: "Part-time",
      },
    });
  }

  redirect("/login?registered=1");
}