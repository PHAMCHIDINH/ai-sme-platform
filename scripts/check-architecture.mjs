#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const APP_DIR = path.join(ROOT_DIR, "app");
const LIB_DIR = path.join(ROOT_DIR, "lib");
const INCLUDED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs"]);
const WARN_LINES = 300;
const FAIL_LINES = 500;

async function listFiles(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") {
          return [];
        }
        return listFiles(fullPath);
      }

      if (!entry.isFile()) {
        return [];
      }

      if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
        return [];
      }

      if (entry.name.endsWith(".d.ts")) {
        return [];
      }

      return [fullPath];
    }),
  );

  return nested.flat();
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function toRelative(fullPath) {
  return toPosixPath(path.relative(ROOT_DIR, fullPath));
}

function resolveRelativeImport(fromFile, specifier) {
  const baseDir = path.dirname(fromFile);
  return path.resolve(baseDir, specifier);
}

function parseImportSpecifiers(content) {
  const specs = [];
  const patterns = [
    /(?:import|export)\s[^"']*from\s*["']([^"']+)["']/g,
    /import\(\s*["']([^"']+)["']\s*\)/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const spec = match[1];
      if (spec) {
        specs.push(spec);
      }
    }
  }

  return specs;
}

async function checkFileSize(files) {
  const warnings = [];
  const errors = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const lineCount = content.split(/\r?\n/).length;
    const rel = toRelative(file);

    if (lineCount > FAIL_LINES) {
      errors.push({ file: rel, lineCount });
      continue;
    }

    if (lineCount > WARN_LINES) {
      warnings.push({ file: rel, lineCount });
    }
  }

  return { warnings, errors };
}

async function checkImportBoundaries(libFiles) {
  const violations = [];

  for (const file of libFiles) {
    const content = await fs.readFile(file, "utf8");
    const specs = parseImportSpecifiers(content);

    for (const spec of specs) {
      if (spec.startsWith("@/app/")) {
        violations.push({ file: toRelative(file), spec });
        continue;
      }

      if (spec.startsWith(".")) {
        const resolved = resolveRelativeImport(file, spec);
        const normalized = path.normalize(resolved);

        if (normalized.startsWith(APP_DIR)) {
          violations.push({ file: toRelative(file), spec });
        }
      }
    }
  }

  return violations;
}

function printLineItems(title, items, formatter) {
  if (items.length === 0) {
    return;
  }

  console.log(title);
  for (const item of items) {
    console.log(`- ${formatter(item)}`);
  }
}

async function main() {
  const [appFiles, libFiles] = await Promise.all([listFiles(APP_DIR), listFiles(LIB_DIR)]);
  const scopedFiles = [...appFiles, ...libFiles];

  const [{ warnings, errors }, boundaryViolations] = await Promise.all([
    checkFileSize(scopedFiles),
    checkImportBoundaries(libFiles),
  ]);

  printLineItems("[check-architecture] WARN files > 300 lines:", warnings, (item) => `${item.file} (${item.lineCount})`);
  printLineItems("[check-architecture] ERROR files > 500 lines:", errors, (item) => `${item.file} (${item.lineCount})`);
  printLineItems("[check-architecture] ERROR lib->app imports:", boundaryViolations, (item) => `${item.file} imports ${item.spec}`);

  if (errors.length > 0 || boundaryViolations.length > 0) {
    process.exit(1);
  }

  console.log("[check-architecture] OK");
}

main().catch((error) => {
  console.error("[check-architecture] Unexpected failure", error);
  process.exit(1);
});
