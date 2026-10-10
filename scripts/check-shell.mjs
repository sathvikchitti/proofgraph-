// Drives the built app (next start) through the shell flows. Usage: npm run build && node scripts/check-shell.mjs
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const port = 3100, base = `http://127.0.0.1:${port}`;
mkdirSync(".screenshots/shell", { recursive: true });
const server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore" });
const results = [];
const check = (name, ok, extra = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`); };
try {
  for (let i = 0; i < 120; i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }
  const browser = await chromium.launch({ executablePath: ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(existsSync), args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("response", (r) => { if (r.status() >= 400 && !/not-a-page|\/teacher|\/admin$/.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errors.push(`pageerror ${e.message.slice(0, 160)}`));

  await page.goto(`${base}/student`);
  await page.waitForURL(/\/login\?next=%2Fstudent/, { timeout: 8000 }).then(() => check("signed-out /student redirects to login with next", true)).catch(() => check("signed-out /student redirects to login with next", false, page.url()));

  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.waitForURL(`${base}/student`, { timeout: 8000 }).then(() => check("sign in returns to the requested page", true)).catch(() => check("sign in returns to the requested page", false, page.url()));
  await page.getByRole("heading", { level: 1, name: "Home" }).waitFor({ timeout: 8000 });
  check("shell shows the student home", true);
  check("sidebar lists planned pages", (await page.getByRole("link", { name: "Skill graph" }).count()) > 0);
  const bell = page.locator('a[aria-label^="Notifications"]');
  await page.waitForFunction(() => /unread/.test(document.querySelector('a[aria-label^="Notifications"]')?.getAttribute("aria-label") ?? ""), null, { timeout: 8000 }).catch(() => {});
  check("unread notifications are announced", /unread/.test((await bell.getAttribute("aria-label")) ?? ""), await bell.getAttribute("aria-label"));
  await page.screenshot({ path: ".screenshots/shell/student-light-1280.png" });

  await page.getByRole("link", { name: "Skill graph" }).first().click();
  await page.waitForURL(`${base}/student/skill-graph`);
  await page.getByRole("heading", { level: 1, name: "Skill graph" }).waitFor();
  check("built page replaces Coming soon", (await page.getByText("Coming soon").count()) === 0);
  check("active item has aria-current", (await page.locator('a[aria-current="page"]', { hasText: "Skill graph" }).count()) > 0);

  const notFound = await page.goto(`${base}/student/not-a-page`);
  check("unknown slug is a 404", notFound?.status() === 404, String(notFound?.status()));
  const bad = await page.goto(`${base}/teacher`);
  check("unknown role segment is a 404", bad?.status() === 404, String(bad?.status()));

  await page.goto(`${base}/admin`);
  await page.getByText("403").first().waitFor({ timeout: 8000 }).then(() => check("another role's area shows 403", true)).catch(() => check("another role's area shows 403", false));
  await page.screenshot({ path: ".screenshots/shell/forbidden-1280.png" });

  await page.goto(`${base}/student`);
  await page.getByRole("heading", { level: 1, name: "Home" }).waitFor();
  await page.locator("aside button, nav button").filter({ hasText: "Student" }).first().click();
  await page.locator('[role^="menuitem"]', { hasText: "Platform admin" }).click();
  await page.waitForURL(`${base}/admin`, { timeout: 8000 }).then(() => check("workspace switcher changes role and home", true)).catch(() => check("workspace switcher changes role and home", false, page.url()));
  await page.getByRole("heading", { level: 1, name: "Platform overview" }).waitFor({ timeout: 8000 });
  check("admin nav replaces student nav", (await page.getByRole("link", { name: "Cluster monitor" }).count()) > 0 && (await page.getByRole("link", { name: "Skill graph" }).count()) === 0);

  await page.emulateMedia({ colorScheme: "dark" });
  await page.screenshot({ path: ".screenshots/shell/admin-dark-1280.png" });
  await page.emulateMedia({ colorScheme: "light" });

  const mobile = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const m = await mobile.newPage();
  await m.goto(`${base}/login`);
  await m.getByRole("radio", { name: "Recruiter" }).click();
  await m.getByLabel(/Email/).fill("rahul@acme.example");
  await m.getByRole("button", { name: "Sign in with email" }).click();
  await m.getByRole("heading", { level: 1, name: "Overview" }).waitFor({ timeout: 8000 });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check("no horizontal overflow at 360px", overflow <= 1, `+${overflow}px`);
  await m.getByRole("button", { name: /Open navigation/ }).click();
  await m.getByRole("link", { name: "Talent search" }).waitFor({ timeout: 5000 }).then(() => check("mobile nav opens as a sheet", true)).catch(() => check("mobile nav opens as a sheet", false));
  await m.screenshot({ path: ".screenshots/shell/company-mobile-360.png" });

  await page.getByRole("button", { name: /Account|Priya|Platform Admin/ }).first().click().catch(() => {});
  await page.getByRole("menuitem", { name: "Sign out" }).click().catch(() => {});
  await page.waitForURL(`${base}/login`, { timeout: 8000 }).then(() => check("sign out returns to login", true)).catch(() => check("sign out returns to login", false, page.url()));

  check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
} finally {
  server.kill("SIGTERM");
}
process.exit(results.every(Boolean) ? 0 : 1);
