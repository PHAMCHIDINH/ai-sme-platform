"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { registerSchema } from "@/lib/validators/auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Thông tin đăng nhập không hợp lệ.";
        default:
          return "Có lỗi xảy ra khi đăng nhập.";
      }
    }
    throw error;
  }
}

export async function register(prevState: string | undefined, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return parsed.error.issues[0].message;
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return "Email này đã được sử dụng.";
    }

    const hashedPassword = await hash(password, 10);

    // Create user and empty profile based on role using a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === "SME") {
        await tx.sMEProfile.create({
          data: {
            userId: user.id,
            companyName: "",
            industry: "",
            companySize: "",
            description: "",
          },
        });
      } else if (role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            university: "",
            major: "",
            availability: "",
            description: "",
          },
        });
      }
    });

    return "SUCCESS";
  } catch (error) {
    console.error("Register Error:", error);
    return "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.";
  }
}
