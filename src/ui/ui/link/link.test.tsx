import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Link } from "./link";

describe("Link", () => {
  it("opens absolute URLs safely in a new tab with an announced hint", () => {
    renderUI(<Link href="https://example.com">Docs</Link>);
    const a = screen.getByRole("link", { name: /Docs/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveAttribute("rel", "noopener noreferrer");
    expect(a).toHaveTextContent("(opens in a new tab)");
  });
  it("leaves internal links alone", () => {
    renderUI(<Link href="/docs">Docs</Link>);
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });
  it("wraps a router link with asChild", () => {
    renderUI(<Link asChild><a href="/r">Router</a></Link>);
    expect(screen.getByRole("link", { name: "Router" })).toHaveAttribute("href", "/r");
  });
});
