import { chromium } from "playwright-core";

const baseUrl = process.env.VASTUVIBE_URL ?? "http://127.0.0.1:3000";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--hide-scrollbars"],
});

async function reachSpotlight(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.siteReady === "true");
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
  await page.locator(".spotlight").waitFor({ state: "attached" });
  await page.locator(".spotlight").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2_000);
}

async function verify({ unavailablePrecision = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "dark",
  });
  await context.addInitScript(
    ({ simulateUnavailablePrecision }) => {
      window.sessionStorage.setItem("vastuvibe-intro-seen", "true");
      if (!simulateUnavailablePrecision) return;

      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, attributes) {
        const result = getContext.call(this, type, attributes);
        if (
          result &&
          this.classList.contains("spotlight__canvas") &&
          (type === "webgl" || type === "webgl2")
        ) {
          result.getShaderPrecisionFormat = () => null;
        }
        return result;
      };
    },
    { simulateUnavailablePrecision: unavailablePrecision },
  );

  const errors = [];
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await reachSpotlight(page);
  const result = await page.evaluate(() => {
    const logo = document.querySelector(".site-nav .logo-mark");
    const activeFallback = document.querySelector(".spotlight__images picture.is-active img");
    return {
      readyReason: document.documentElement.dataset.siteReadyReason,
      logo: logo
        ? {
            source: logo.getAttribute("src"),
            naturalWidth: logo.naturalWidth,
            naturalHeight: logo.naturalHeight,
          }
        : null,
      spotlightCanvasCount: document.querySelectorAll(".spotlight__canvas").length,
      fallbackImageVisible: activeFallback ? getComputedStyle(activeFallback).opacity !== "0" : false,
    };
  });

  await context.close();
  return { ...result, errors };
}

const report = {
  normal: await verify(),
  unavailablePrecision: await verify({ unavailablePrecision: true }),
};

await browser.close();

if (report.normal.errors.length || report.unavailablePrecision.errors.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(report, null, 2));
}
