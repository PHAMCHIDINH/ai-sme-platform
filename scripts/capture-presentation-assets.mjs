import { mkdir } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import process from "process";
import net from "net";

import { chromium } from "@playwright/test";

const DEFAULT_PORT = Number(process.env.PRESENTATION_PORT ?? 3200);
const OUTPUT_DIR = path.resolve(process.cwd(), "public", "presentation");
const DEFAULT_PASSWORD = process.env.PRESENTATION_DEMO_PASSWORD ?? "password123";
const SME_EMAIL = process.env.PRESENTATION_SME_EMAIL ?? "contact@phongkhamthienhuong.com";
const STUDENT_EMAIL = process.env.PRESENTATION_STUDENT_EMAIL ?? "nguyen.anh@student.hcmus.edu.vn";

function resolveBin(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function commandError(command, args, code) {
  return new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: options.stdio ?? "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(commandError(command, args, code));
    });
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;

  while (port < startPort + 20) {
    const isAvailable = await new Promise((resolve) => {
      const server = net.createServer();

      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });

    if (isAvailable) {
      return port;
    }

    port += 1;
  }

  throw new Error(`Could not find an available port starting from ${startPort}.`);
}

async function waitForUrl(url, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "unknown error";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "follow" });

      if (response.ok) {
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for ${url}. Last error: ${lastError}`);
}

async function ensureChromiumInstalled() {
  try {
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!/Executable doesn't exist|browserType\.launch|Failed to launch/i.test(message)) {
      throw error;
    }
  }

  await runCommand(resolveBin("npx"), ["playwright", "install", "chromium"]);
}

function startNextServer(port) {
  return spawn(resolveBin("npm"), ["run", "dev", "--", "--hostname", "localhost", "--port", String(port)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXTAUTH_URL: `http://localhost:${port}`,
    },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function stopProcess(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }

  if (process.platform === "win32" && child.pid) {
    try {
      await runCommand("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      return;
    } catch {
      // fall through
    }
  }

  child.kill("SIGTERM");
  await sleep(1500);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

async function login(page, baseUrl, email) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(DEFAULT_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(sme|student)\/dashboard/, { timeout: 30_000 }),
    page.getByRole("button", { name: /Đăng nhập/i }).click(),
  ]);
}

async function captureViewport(page, destination) {
  await page.screenshot({
    path: destination,
    type: "png",
    fullPage: false,
  });
}

async function captureSmeAssets(browser, baseUrl) {
  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 1000,
    },
  });
  const page = await context.newPage();

  try {
    await login(page, baseUrl, SME_EMAIL);

    await page.goto(`${baseUrl}/sme/projects/new`, { waitUntil: "networkidle" });
    await page.getByText("Cùng Trợ Lý Tối Ưu Đề Bài").waitFor();
    await captureViewport(page, path.join(OUTPUT_DIR, "product-ai-brief.png"));

    await page.goto(`${baseUrl}/sme/students`, { waitUntil: "networkidle" });
    await page.getByText("HEADHUNT AI").waitFor();
    await captureViewport(page, path.join(OUTPUT_DIR, "product-matching.png"));
  } finally {
    await context.close();
  }
}

async function captureStudentAssets(browser, baseUrl) {
  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 1000,
    },
  });
  const page = await context.newPage();

  try {
    await login(page, baseUrl, STUDENT_EMAIL);

    await page.goto(`${baseUrl}/student/my-projects`, { waitUntil: "networkidle" });
    await page.getByText("Dự án đang tham gia").waitFor();
    await captureViewport(page, path.join(OUTPUT_DIR, "product-progress.png"));
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await ensureChromiumInstalled();

  let serverProcess = null;
  const baseUrl = process.env.PRESENTATION_BASE_URL
    ? process.env.PRESENTATION_BASE_URL.replace(/\/$/, "")
    : `http://localhost:${await findAvailablePort(DEFAULT_PORT)}`;

  try {
    if (!process.env.PRESENTATION_BASE_URL) {
      const port = Number(new URL(baseUrl).port);
      serverProcess = startNextServer(port);
      await waitForUrl(`${baseUrl}/login`);
    } else {
      await waitForUrl(`${baseUrl}/login`);
    }

    const browser = await chromium.launch({ headless: true });
    try {
      await captureSmeAssets(browser, baseUrl);
      await captureStudentAssets(browser, baseUrl);
    } finally {
      await browser.close();
    }

    console.log(`Presentation assets created in ${OUTPUT_DIR}`);
  } finally {
    await stopProcess(serverProcess);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
