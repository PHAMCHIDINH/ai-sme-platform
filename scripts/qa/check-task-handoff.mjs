import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const taskId = process.argv[2];

if (!taskId) {
  console.error("Usage: npm run qa:task -- <task-id>");
  process.exit(1);
}

const requiredFiles = [
  path.join("docs", "tasks", `${taskId}.md`),
  path.join("docs", "reports", `${taskId}-impl.md`),
  path.join("docs", "reports", `${taskId}-qa.md`),
];

const missingFiles = requiredFiles.filter((filePath) => !existsSync(filePath));

if (missingFiles.length > 0) {
  console.error("[qa:task] Missing required handoff files:");
  for (const filePath of missingFiles) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

const missingMetadata = [];
for (const filePath of requiredFiles) {
  const content = readFileSync(filePath, "utf8");

  if (!content.includes(`Task ID: ${taskId}`)) {
    missingMetadata.push(`${filePath} is missing "Task ID: ${taskId}"`);
  }

  if (!content.includes("Branch: codex/")) {
    missingMetadata.push(`${filePath} is missing a codex branch reference`);
  }
}

if (missingMetadata.length > 0) {
  console.error("[qa:task] Metadata check failed:");
  for (const problem of missingMetadata) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(`[qa:task] Task ${taskId} has the required spec and handoff reports.`);
