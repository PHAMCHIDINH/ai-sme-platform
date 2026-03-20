import { spawn } from "node:child_process";

function run(commandLine) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandLine, {
      cwd: process.cwd(),
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = String(chunk);
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = String(chunk);
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(`${commandLine} exited with code ${code ?? 1}`);
      reject(Object.assign(error, { stdout, stderr, code }));
    });
  });
}

function isPrismaBaselineError(output) {
  return output.includes("P3005");
}

try {
  await run("prisma migrate deploy");
} catch (error) {
  const stderr = "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
  const stdout = "stdout" in error && typeof error.stdout === "string" ? error.stdout : "";
  const combined = `${stdout}\n${stderr}`;

  if (!isPrismaBaselineError(combined)) {
    throw error;
  }

  console.warn(
    "[db:migrate:deploy] Prisma migrate deploy hit P3005 (existing non-baselined schema). Falling back to `prisma db push --skip-generate` for transition.",
  );
  console.warn(
    "[db:migrate:deploy] Follow-up required: baseline this database and switch to strict migrations only.",
  );
  await run("prisma db push --skip-generate");
}
