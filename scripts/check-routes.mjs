// Visits every route (signed in as the right role) in light+dark at 1280 and 360. Fails on console errors, failed
// requests, horizontal overflow or a missing h1. Usage: npm run build && node scripts/check-routes.mjs [--only substr] [--no-shots]
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : "";
const shots = !args.includes("--no-shots");
const port = 3101, base = `http://127.0.0.1:${port}`;
const out = ".screenshots/routes";
mkdirSync(out, { recursive: true });

const roles = ["student", "college", "company", "admin"];
const planned = { college: "reports", company: "talent-search", admin: "tenants" };
const studentPages = ["skill-graph", "skill-graph/caching", "claims", "repositories", "scans", "missions", "viva", "integrity", "resume-studio", "repo-readiness", "privacy", "role-fit", "interview-prep", "dsa-insights", "growth-timeline", "opportunities"];
const routes = [
  { path: "/", name: "landing" },
  { path: "/login", name: "login" },
  { path: "/maintenance", name: "maintenance" },
  { path: "/no-access", name: "no-access" },
  { path: "/onboarding", name: "onboarding", role: "student" },
  { path: "/notifications", name: "notifications", role: "student" },
  { path: "/settings", name: "settings", role: "student" },
  ...roles.flatMap((r) => [{ path: `/${r}`, name: `${r}-home`, role: r }, ...(planned[r] ? [{ path: `/${r}/${planned[r]}`, name: `${r}-planned`, role: r }] : [])]),
  ...studentPages.map((p) => ({ path: `/student/${p}`, name: `student-${p.replace("/", "-")}`, role: "student" })),
  { path: "/p/demo-owner", name: "proof-profile", role: "student" },
  { path: "/student/nope", name: "404", status: 404 },
  { path: "/admin", name: "forbidden", role: "student", expectText: "403" },
].filter((r) => r.name.includes(only));

const server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore" });
const failures = [];
let n = 0;
try {
  for (let i = 0; i < 120; i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }
  const browser = await chromium.launch({ executablePath: ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(existsSync), args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  for (const theme of ["light", "dark"]) for (const [w, h] of [[1280, 800], [360, 740]]) {
    for (const route of routes) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme });
      const page = await ctx.newPage();
      const problems = [];
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) problems.push(`console: ${m.text().slice(0, 160)}`); });
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message.slice(0, 160)}`));
      page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(base) && !(route.status && r.url().endsWith(route.path))) problems.push(`${r.status()} ${r.url().replace(base, "")}`); });
      try {
        if (route.role) {
          await page.goto(`${base}/login`);
          await page.evaluate((role) => localStorage.setItem("pg.mock.session", JSON.stringify({ user: { id: `u-${role}`, name: "Priya Gupta", email: "priya@example.edu", role, githubLogin: "priya-g" } })), route.role);
        }
        const res = await page.goto(`${base}${route.path}`);
        if (route.status && res?.status() !== route.status) problems.push(`status ${res?.status()} != ${route.status}`);
        await page.locator("h1").first().waitFor({ timeout: 10000 }).catch(() => problems.push("no h1"));
        if (route.name.endsWith("-home")) await page.getByText(/What.s next/).waitFor({ timeout: 10000 }).catch(() => problems.push("home data never loaded"));
        if (route.name === "notifications") await page.getByRole("list", { name: "Notifications" }).waitFor({ timeout: 10000 }).catch(() => problems.push("notifications never loaded"));
        if (route.name === "settings") await page.getByRole("tab", { name: "Profile" }).waitFor({ timeout: 10000 }).catch(() => problems.push("settings never loaded"));
        if (route.expectText && !(await page.getByText(route.expectText).count())) problems.push(`missing text ${route.expectText}`);
        await page.waitForTimeout(route.name === "landing" || route.name === "login" ? 3500 : 500);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 1) problems.push(`horizontal overflow +${over}px`);
        if (shots) await page.screenshot({ path: `${out}/${route.name}-${theme}-${w}.png`, fullPage: true });
      } catch (e) { problems.push(`harness: ${String(e.message).split("\n")[0].slice(0, 160)}`); }
      n++;
      if (problems.length) failures.push(`${route.name} [${theme} ${w}] ${problems.join(" | ")}`);
      await ctx.close();
    }
  }
  await browser.close();
} finally { server.kill("SIGTERM"); }
console.log(`checked ${n} renders, ${failures.length} with problems`);
failures.forEach((f) => console.log("- " + f));
process.exit(failures.length ? 1 : 0);
