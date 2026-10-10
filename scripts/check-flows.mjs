// Drives the interactive foundational flows on the built app. Usage: npm run build && node scripts/check-flows.mjs
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const port = 3103, base = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore" });
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`); };
const T = { timeout: 8000 };
try {
  for (let i = 0; i < 120; i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }
  const browser = await chromium.launch({ executablePath: ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(existsSync), args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)); });

  // Sign up as a student -> onboarding wizard -> home
  await page.goto(`${base}/login`);
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Create account with GitHub" }).click();
  await page.waitForURL(`${base}/onboarding`, T).then(() => check("sign up lands on onboarding", true)).catch(() => check("sign up lands on onboarding", false, page.url()));
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: /Connect/ }).first().click();
  await page.getByText("@priya-g").waitFor(T).then(() => check("onboarding: connect an account", true)).catch(() => check("onboarding: connect an account", false));
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "resume.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 test") });
  await page.getByText(/Analysing your profile|Thought for/).first().waitFor(T).then(() => check("onboarding: upload starts the analysis line", true)).catch(() => check("onboarding: upload starts the analysis line", false));
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("checkbox", { name: /Take your first viva/ }).click();
  check("onboarding: checklist uses the animated checkbox", (await page.getByRole("checkbox", { name: /Take your first viva/ }).getAttribute("aria-checked")) === "true");
  await page.getByRole("button", { name: "Go to my home" }).click();
  await page.waitForURL(`${base}/student`, T).then(() => check("onboarding finish goes to the role home", true)).catch(() => check("onboarding finish goes to the role home", false, page.url()));

  // Home loaded from the (mock) API
  await page.getByRole("heading", { name: "Recent activity" }).waitFor(T);
  const homeText = await page.locator("main").innerText();
  check("home shows KPI, next and activity", /HONESTY/i.test(homeText) && /What’s next/.test(homeText) && /Recent activity/.test(homeText), homeText.slice(0, 60).replace(/\n/g, " "));

  // Notifications: mark one read, then all
  await page.goto(`${base}/notifications`);
  await page.getByRole("list", { name: "Notifications" }).waitFor(T);
  const before = await page.getByRole("button", { name: /Mark ".*" as read/ }).count();
  await page.getByRole("button", { name: /Mark ".*" as read/ }).first().click();
  await page.waitForFunction((b) => document.querySelectorAll('button[aria-label^="Mark \\""]').length === b - 1, before, T).then(() => check("notifications: mark one read", true)).catch(() => check("notifications: mark one read", false));
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await page.getByText(/\d+ unread/).waitFor({ state: "detached", ...T }).then(() => check("notifications: mark all read clears the badge", true)).catch(() => check("notifications: mark all read clears the badge", false));
  await page.waitForTimeout(1200); // the mock API persists after its simulated delay
  await page.reload();
  await page.getByRole("list", { name: "Notifications" }).waitFor(T);
  check("notifications: read state survives a reload", (await page.getByRole("button", { name: /Mark ".*" as read/ }).count()) === 0);

  // Settings: edit profile, appearance density, privacy
  await page.goto(`${base}/settings`);
  await page.getByLabel(/Display name/).fill("Priya G.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Profile saved").waitFor(T).then(() => check("settings: save profile shows a toast", true)).catch(() => check("settings: save profile shows a toast", false));
  await page.getByLabel(/Handle/).fill("");
  check("settings: empty handle is rejected inline", (await page.getByText("Choose a handle").count()) > 0 && (await page.getByRole("button", { name: "Save changes" }).isDisabled()));
  await page.getByRole("tab", { name: "Appearance" }).click();
  await page.getByRole("radio", { name: "Compact" }).click();
  await page.waitForFunction(() => document.documentElement.dataset.density === "compact", null, T).then(() => check("settings: density applies to the page", true)).catch(() => check("settings: density applies to the page", false));
  await page.getByRole("radio", { name: "Dark" }).click();
  check("settings: theme applies", (await page.evaluate(() => document.documentElement.dataset.theme)) === "dark");
  await page.getByRole("tab", { name: "Connected accounts" }).click();
  check("settings: four connected-account cards", (await page.getByRole("button", { name: /Connect|Reconnect|Disconnect/ }).count()) >= 4);
  await page.getByRole("tab", { name: "Privacy" }).click();
  check("settings: privacy matrix present", (await page.getByRole("switch").count()) >= 3);

  // Production hides the dev page
  const dev = await page.goto(`${base}/dev/ui`);
  check("/dev/ui is hidden in production", dev?.status() === 404, String(dev?.status()));

  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
} finally { server.kill("SIGTERM"); }
process.exit(results.every(Boolean) ? 0 : 1);
