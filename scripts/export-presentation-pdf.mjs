import { mkdir } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import process from "process";
import net from "net";

import { chromium } from "@playwright/test";

const DEFAULT_PORT = Number(process.env.PRESENTATION_PORT ?? 3200);
const PRINT_ROUTE = "/presentation/print";
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  process.env.PRESENTATION_OUTPUT ?? "exports/nhoti-pitch-deck.pdf",
);
const BASE_URL_ARG = process.argv.find((arg) => arg.startsWith("--base-url="));
const REQUESTED_BASE_URL = BASE_URL_ARG
  ? BASE_URL_ARG.slice("--base-url=".length)
  : process.env.PRESENTATION_BASE_URL;

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

async function waitForPresentationAssets(page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.waitForSelector(".presentation-print-sheet");
      await page.evaluate(async () => {
        await document.fonts.ready;

        const images = Array.from(document.images);
        await Promise.all(
          images.map((image) => {
            if (image.complete) {
              return Promise.resolve();
            }

            return new Promise((resolve) => {
              image.addEventListener("load", () => resolve(undefined), { once: true });
              image.addEventListener("error", () => resolve(undefined), { once: true });
            });
          }),
        );
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (!/Execution context was destroyed|Target page, context or browser has been closed/i.test(message) || attempt === 2) {
        throw error;
      }

      await page.waitForLoadState("networkidle");
    }
  }
}

function resolvePrintUrl(baseUrl) {
  const sanitizedBaseUrl = baseUrl.replace(/\/$/, "");
  return sanitizedBaseUrl.endsWith(PRINT_ROUTE) ? sanitizedBaseUrl : `${sanitizedBaseUrl}${PRINT_ROUTE}`;
}

async function exportPdf(pageUrl) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1600,
        height: 900,
      },
    });

    console.log(`Opening ${pageUrl}`);
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    console.log("Reloading print route after initial compile...");
    await page.reload({ waitUntil: "networkidle" });
    console.log("Waiting for fonts and images...");
    await waitForPresentationAssets(page);
    console.log("Generating PDF...");
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: OUTPUT_PATH,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
    console.log("PDF generation finished.");
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await ensureChromiumInstalled();

  let serverProcess = null;
  let pageUrl = "";

  try {
    if (REQUESTED_BASE_URL) {
      pageUrl = resolvePrintUrl(REQUESTED_BASE_URL);
      console.log(`Using existing server at ${pageUrl}`);
      await waitForUrl(pageUrl);
    } else {
      const port = await findAvailablePort(DEFAULT_PORT);
      const baseUrl = `http://localhost:${port}`;
      pageUrl = resolvePrintUrl(baseUrl);

      console.log(`Starting local server for PDF export on ${baseUrl}`);
      serverProcess = startNextServer(port);
      serverProcess.on("exit", (code) => {
        if (code && code !== 0) {
          console.error(`Next server exited early with code ${code}.`);
        }
      });

      await waitForUrl(pageUrl);
    }

    await exportPdf(pageUrl);
    console.log(`PDF created at ${OUTPUT_PATH}`);
  } finally {
    await stopProcess(serverProcess);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
