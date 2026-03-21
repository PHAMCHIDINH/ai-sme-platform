import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const uiDir = path.join(projectRoot, "components", "ui");
const baseUiPackageJsonPath = path.join(projectRoot, "node_modules", "@base-ui", "react", "package.json");

if (!fs.existsSync(baseUiPackageJsonPath)) {
  console.error("[check-ui-imports] Missing @base-ui/react package.");
  process.exit(1);
}

const baseUiPackage = JSON.parse(fs.readFileSync(baseUiPackageJsonPath, "utf8"));
const exportsField = baseUiPackage.exports ?? {};
const exportKeys = new Set(Object.keys(exportsField));
const files = fs.readdirSync(uiDir).filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"));

let hasError = false;
const importRegex = /from\s+["']@base-ui\/react\/([^"']+)["']/g;

for (const fileName of files) {
  const filePath = path.join(uiDir, fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const matches = [...content.matchAll(importRegex)];

  for (const match of matches) {
    const subpath = `./${match[1]}`;
    if (!exportKeys.has(subpath)) {
      hasError = true;
      console.error(
        `[check-ui-imports] Invalid Base UI import in ${path.relative(projectRoot, filePath)}: @base-ui/react/${match[1]}`,
      );
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log("[check-ui-imports] OK");
