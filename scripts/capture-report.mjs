import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.VASTUVIBE_URL ?? "http://127.0.0.1:3000";
const reportDir = new URL("../public/media/reports/", import.meta.url);
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

await mkdir(reportDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--hide-scrollbars"],
});

const findings = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  consoleErrors: [],
  desktop: {},
  mobile: {},
  reducedMotion: {},
};

async function waitForReady(page) {
  await page.waitForFunction(() => document.documentElement.dataset.siteReady === "true", null, { timeout: 8_000 });
  await page.waitForTimeout(900);
}

const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
});
const desktop = await desktopContext.newPage();
desktop.on("console", (message) => {
  if (message.type() === "error") findings.consoleErrors.push({ viewport: "desktop", text: message.text() });
});
desktop.on("pageerror", (error) => findings.consoleErrors.push({ viewport: "desktop", text: error.message }));
desktop.on("response", (response) => {
  if (response.status() >= 400) findings.consoleErrors.push({ viewport: "desktop", text: `${response.status()} ${response.url()}` });
});

await desktop.goto(baseUrl, { waitUntil: "networkidle" });
await waitForReady(desktop);
await desktop.evaluate(() => {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
});
await desktop.waitForTimeout(1_500);
await desktop.mouse.move(320, 240);
await desktop.waitForTimeout(120);
await desktop.mouse.move(980, 420);
await desktop.waitForSelector(".hero__webgl--ready", { timeout: 8_000 }).catch(() => null);
await desktop.waitForTimeout(1_200);
findings.desktop = await desktop.evaluate(() => ({
  viewport: [window.innerWidth, window.innerHeight],
  canvas: Boolean(document.querySelector("canvas")),
  deviceMemory: navigator.deviceMemory ?? null,
  pageHeight: document.documentElement.scrollHeight,
  scrollY: window.scrollY,
  heroRect: document.querySelector(".hero")?.getBoundingClientRect().toJSON(),
  heroStyle: document.querySelector(".hero")?.getAttribute("style"),
  heroParentClass: document.querySelector(".hero")?.parentElement?.className,
  heroParentRect: document.querySelector(".hero")?.parentElement?.getBoundingClientRect().toJSON(),
  heroParentStyle: document.querySelector(".hero")?.parentElement?.getAttribute("style"),
  smoothStyle: document.querySelector("#smooth-content")?.getAttribute("style"),
  webglReady: Boolean(document.querySelector(".hero__webgl--ready")),
}));
await desktop.screenshot({ path: new URL("desktop-hero-0.png", reportDir).pathname });

await desktop.evaluate(() => window.scrollTo(0, window.innerHeight));
await desktop.waitForTimeout(1_250);
await desktop.screenshot({ path: new URL("desktop-hero-50.png", reportDir).pathname });

await desktop.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
await desktop.waitForTimeout(1_250);
await desktop.screenshot({ path: new URL("desktop-hero-100.png", reportDir).pathname });

await desktop.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await desktop.waitForTimeout(4_000);
await desktop.screenshot({ path: new URL("footer-reveal.png", reportDir).pathname });
findings.desktop.sessionFlagAfterFirstVisit = await desktop.evaluate(() =>
  sessionStorage.getItem("vastuvibe-intro-seen"),
);
await desktop.reload({ waitUntil: "domcontentloaded" });
await desktop.waitForTimeout(1_000);
findings.desktop.preloaderElementsAfterReload = await desktop.locator(".preloader").count();

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  colorScheme: "dark",
});
const mobile = await mobileContext.newPage();
mobile.on("console", (message) => {
  if (message.type() === "error") findings.consoleErrors.push({ viewport: "mobile", text: message.text() });
});
mobile.on("pageerror", (error) => findings.consoleErrors.push({ viewport: "mobile", text: error.message }));

await mobile.goto(baseUrl, { waitUntil: "networkidle" });
await waitForReady(mobile);
await mobile.screenshot({ path: new URL("mobile-hero-390.png", reportDir).pathname });
await mobile.locator(".menu-toggle").click();
await mobile.waitForTimeout(850);
await mobile.screenshot({ path: new URL("nav-overlay.png", reportDir).pathname });
await mobile.locator(".menu-toggle").click();

const mobileResources = await mobile.evaluate(() =>
  performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.includes(".js"))
    .map((entry) => ({
      url: entry.name,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    })),
);

const scriptBodies = [];
for (const resource of mobileResources) {
  const response = await mobileContext.request.get(resource.url);
  scriptBodies.push(await response.text());
}
const loadedThree = scriptBodies.some((body) => body.includes("WebGLRenderer") || body.includes("THREE.REVISION"));
const beforeReloadSeen = await mobile.evaluate(() => sessionStorage.getItem("vastuvibe-intro-seen"));
await mobile.reload({ waitUntil: "domcontentloaded" });
await mobile.waitForTimeout(1_000);
const preloaderOnReload = await mobile.locator(".preloader").count();

findings.mobile = {
  viewport: [390, 844],
  canvas: await mobile.locator("canvas").count(),
  threeRuntimeLoaded: loadedThree,
  firstLoadJsBytes: mobileResources.reduce((sum, resource) => sum + resource.encodedBodySize, 0),
  resources: mobileResources,
  sessionFlagAfterFirstVisit: beforeReloadSeen,
  preloaderElementsAfterReload: preloaderOnReload,
};

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const reduced = await reducedContext.newPage();
await reduced.goto(baseUrl, { waitUntil: "networkidle" });
await reduced.waitForTimeout(500);
findings.reducedMotion = {
  canvas: await reduced.locator("canvas").count(),
  preloader: await reduced.locator(".preloader").count(),
  siteReady: await reduced.evaluate(() => document.documentElement.dataset.siteReady),
};

await writeFile(new URL("browser-verification.json", reportDir), `${JSON.stringify(findings, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(findings, null, 2));
