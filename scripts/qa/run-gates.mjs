import { spawn } from "node:child_process";

const rawArgs = process.argv.slice(2);
const taskArg = rawArgs.find((arg) => arg.startsWith("--task="));
const taskIndex = rawArgs.indexOf("--task");
const includeBuild = rawArgs.includes("--include-build");

const taskId =
  taskArg?.slice("--task=".length) ??
  (taskIndex >= 0 && rawArgs[taskIndex + 1] ? rawArgs[taskIndex + 1] : null);

const fileArgs = rawArgs.filter((arg, index) => {
  if (arg === "--include-build" || arg === "--task" || arg.startsWith("--task=")) {
    return false;
  }

  if (taskIndex >= 0 && index === taskIndex + 1) {
    return false;
  }

  return true;
});

const buildSensitivePatterns = [
  /^app\//,
  /^auth\.ts$/,
  /^auth\.config\.ts$/,
  /^middleware\.ts$/,
  /^prisma\//,
  /^lib\/(matching|openai|prisma)\.ts$/,
];

const requiresBuild =
  includeBuild ||
  fileArgs.some((filePath) => buildSensitivePatterns.some((pattern) => pattern.test(filePath)));

function run(commandLine) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandLine, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${commandLine} exited with code ${code ?? 1}`));
    });

    child.on("error", reject);
  });
}

const commands = [
  ["run", "lint"],
  ["run", "typecheck"],
];

if (requiresBuild) {
  commands.push(["run", "build"]);
}

const header = taskId ? `Task ${taskId}` : "Unnamed task";
console.log(`[qa:gates] ${header}`);
console.log(`[qa:gates] Files: ${fileArgs.length > 0 ? fileArgs.join(", ") : "none provided"}`);
console.log(`[qa:gates] Build required: ${requiresBuild ? "yes" : "no"}`);

for (const commandArgs of commands) {
  console.log(`[qa:gates] Running: npm ${commandArgs.join(" ")}`);
  await run(`npm ${commandArgs.join(" ")}`);
}

console.log("[qa:gates] All requested gates passed.");
