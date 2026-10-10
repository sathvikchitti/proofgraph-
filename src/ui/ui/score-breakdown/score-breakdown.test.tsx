import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { ScoreBreakdown } from "./score-breakdown";

const items = [{ label: "Deep finding", value: 55, href: "#ev" }, { label: "Diversity", value: 10 }, { label: "Tests", value: 5 }];

describe("ScoreBreakdown", () => {
  it("lists parts, links items out and summarises the bar for assistive tech", () => {
    renderUI(<ScoreBreakdown total={70} items={items} />);
    expect(screen.getByRole("link", { name: /Deep finding/ })).toHaveAttribute("href", "#ev");
    expect(screen.getByRole("img")).toHaveAccessibleName(expect.stringContaining("Deep finding 55"));
    expect(screen.getByText("Total").parentElement).toHaveTextContent("70 / 100");
  });
  it("warns in development when the parts do not add up", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderUI(<ScoreBreakdown total={99} items={items} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("sum to 70 but total is 99"));
    warn.mockRestore();
  });
  it("stays quiet when they add up", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderUI(<ScoreBreakdown total={70} items={items} />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
