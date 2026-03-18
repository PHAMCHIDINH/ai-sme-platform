import { Role } from "@prisma/client";
import { hash } from "bcrypt";

import { prisma } from "../lib/prisma";

async function main() {
  const hashedPassword = await hash("password123", 10);

  const smeUser = await prisma.user.upsert({
    where: { email: "sme@example.com" },
    update: {},
    create: {
      email: "sme@example.com",
      password: hashedPassword,
      name: "SME Demo",
      role: Role.SME,
      smeProfile: {
        create: {
          companyName: "SME Company",
          industry: "Technology",
          companySize: "1-10",
          description: "Doanh nghiep SME mau",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: hashedPassword,
      name: "Student Demo",
      role: Role.STUDENT,
      studentProfile: {
        create: {
          university: "Demo University",
          major: "Computer Science",
          skills: ["Problem Solving", "Communication"],
          technologies: ["Next.js", "TypeScript"],
          availability: "20h/week",
          description: "Sinh vien demo cho MVP",
          interests: ["Web", "AI"],
        },
      },
    },
  });

  await prisma.project.create({
    data: {
      smeId: (await prisma.sMEProfile.findUniqueOrThrow({ where: { userId: smeUser.id } })).id,
      title: "Xay dung landing page thu hut lead",
      description: "Can sinh vien thiet ke va code landing page cho doanh nghiep.",
      expectedOutput: "Landing page responsive + huong dan deploy",
      requiredSkills: ["Next.js", "UI/UX", "SEO"],
      difficulty: "MEDIUM",
      duration: "4 weeks",
      budget: "5,000,000 VND",
      status: "OPEN",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });