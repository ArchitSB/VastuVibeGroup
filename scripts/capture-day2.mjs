import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.VASTUVIBE_URL ?? "http://127.0.0.1:3000";
const reportDir = new URL("../public/media/reports/day2/", import.meta.url);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

await mkdir(reportDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--hide-scrollbars"],
});

const results = { generatedAt: new Date().toISOString(), baseUrl, consoleErrors: [], screenshots: [] };

async function screenshot(page, name) {
  const path = new URL(`${name}.png`, reportDir).pathname;
  await page.screenshot({ path });
  results.screenshots.push(path);
}

async function waitReady(page) {
  await page.waitForFunction(() => document.documentElement.dataset.siteReady === "true", null, { timeout: 8_000 });
  await page.waitForTimeout(1_200);
}

async function sectionTop(page, selector, extraViewport = 0) {
  await page.evaluate(
    ({ target, extra }) => {
      const element = document.querySelector(target);
      if (!element) throw new Error(`Missing selector: ${target}`);
      const y = element.getBoundingClientRect().top + window.scrollY + window.innerHeight * extra;
      window.scrollTo({ top: y, behavior: "instant" });
    },
    { target: selector, extra: extraViewport },
  );
  await page.waitForTimeout(1_400);
}

const preloaderContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "dark" });
await preloaderContext.addInitScript(() => {
  sessionStorage.removeItem("vastuvibe-intro-seen");
  Object.defineProperty(Navigator.prototype, "maxTouchPoints", { configurable: true, get: () => 0 });
});
const preloaderPage = await preloaderContext.newPage();
await preloaderPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
await preloaderPage.locator(".preloader").waitFor({ state: "visible", timeout: 2_000 }).catch(() => null);
await preloaderPage.waitForTimeout(160);
await screenshot(preloaderPage, "preloader-logo");
await preloaderContext.close();

const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
});
await desktopContext.addInitScript(() => sessionStorage.setItem("vastuvibe-intro-seen", "true"));
const desktop = await desktopContext.newPage();
desktop.on("console", (message) => {
  if (message.type() === "error") results.consoleErrors.push({ viewport: "desktop", text: message.text() });
});
desktop.on("pageerror", (error) => results.consoleErrors.push({ viewport: "desktop", text: error.message }));
await desktop.goto(baseUrl, { waitUntil: "networkidle" });
await waitReady(desktop);
await desktop.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await desktop.locator(".trust-marquee").waitFor({ state: "attached", timeout: 8_000 });
await desktop.waitForTimeout(1_500);

const desktopShots = [
  ["s2-trust-marquee", ".trust-marquee", -0.35],
  ["s3-statement", ".statement", 0.08],
  ["s4-vault", ".vault", 1.45],
  ["s5-deal", ".deal", 0.08],
  ["s6-spotlight", ".spotlight", 1.05],
  ["s7-tanzania", ".tanzania", 0.12],
  ["s8-journey", ".journey", 1.25],
  ["s9-founder-note", ".founder-note", 0.06],
  ["s10-cta", ".closing-cta", 0.04],
];

for (const [name, selector, extra] of desktopShots) {
  await sectionTop(desktop, selector, extra);
  if (name === "s4-vault") await desktop.waitForTimeout(1_000);
  await screenshot(desktop, name);
  if (name === "s4-vault") {
    results.vault = await desktop.evaluate(() => ({
      index: document.querySelector(".vault__index")?.textContent,
      name: document.querySelector(".vault__copy-swap h3")?.textContent,
      activeSource: document.querySelector(".box-carousel__face.is-active img")?.getAttribute("src"),
      activeOpacity: getComputedStyle(document.querySelector(".box-carousel__face.is-active")).opacity,
      visibleSources: [...document.querySelectorAll(".box-carousel__face")]
        .filter((face) => Number(getComputedStyle(face).opacity) > 0.05)
        .map((face) => ({ source: face.querySelector("img")?.getAttribute("src"), opacity: getComputedStyle(face).opacity })),
    }));
  }
}

await desktop.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await desktop.waitForTimeout(1_500);
await desktop.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await desktop.waitForTimeout(1_500);
await screenshot(desktop, "s11-footer");

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  colorScheme: "dark",
});
await mobileContext.addInitScript(() => sessionStorage.setItem("vastuvibe-intro-seen", "true"));
const mobile = await mobileContext.newPage();
mobile.on("console", (message) => {
  if (message.type() === "error") results.consoleErrors.push({ viewport: "mobile", text: message.text() });
});
mobile.on("pageerror", (error) => results.consoleErrors.push({ viewport: "mobile", text: error.message }));
await mobile.goto(baseUrl, { waitUntil: "networkidle" });
await waitReady(mobile);
await mobile.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await mobile.locator(".trust-marquee").waitFor({ state: "attached", timeout: 8_000 });
await mobile.waitForTimeout(1_200);
await sectionTop(mobile, ".vault", 0.02);
await screenshot(mobile, "mobile-vault-390");
await sectionTop(mobile, ".journey", 0.02);
await screenshot(mobile, "mobile-journey-390");
await mobile.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await mobile.waitForTimeout(600);
await mobile.locator(".menu-toggle").click();
await mobile.waitForTimeout(650);
await screenshot(mobile, "mobile-nav-overlay-390");

await writeFile(new URL("capture-results.json", reportDir), `${JSON.stringify(results, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(results, null, 2));
