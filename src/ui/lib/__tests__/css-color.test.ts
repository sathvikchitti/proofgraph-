import { readCssNumber, readCssString, resolveCssColor } from "../css-color";

describe("css-color", () => {
  // jsdom does not resolve var() or canvas pixels; token resolution is exercised in the browser gate (graph-view page).
  it("returns a usable color string for a plain color and never throws on var()", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    expect(resolveCssColor(host, "rgb(10, 20, 30)")).toMatch(/10,\s*20,\s*30/);
    expect(typeof resolveCssColor(host, "var(--missing)")).toBe("string");
    host.remove();
  });
  it("reads numeric and string tokens with fallbacks", () => {
    const host = document.createElement("div");
    host.style.setProperty("--n", "12");
    host.style.setProperty("--s", " Plex ");
    document.body.appendChild(host);
    expect(readCssNumber(host, "--n", 1)).toBe(12);
    expect(readCssNumber(host, "--missing", 7)).toBe(7);
    expect(readCssString(host, "--s", "x")).toBe("Plex");
    expect(readCssString(host, "--missing", "x")).toBe("x");
    host.remove();
  });
});
