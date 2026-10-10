import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Timeline } from "./timeline";

const items = [
  { id: "1", title: "Started", time: "13:40", tone: "info" as const },
  { id: "2", title: "Done", time: "14:03", description: "All good", tone: "success" as const },
];

describe("Timeline", () => {
  it("renders an ordered list with time, title and description", () => {
    renderUI(<Timeline items={items} aria-label="History" />);
    const list = screen.getByRole("list", { name: "History" });
    expect(list.tagName).toBe("OL");
    expect(list.children).toHaveLength(2);
    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(list.children[1]).toHaveAttribute("data-tone", "success");
  });
  it("reverses to newest first", () => {
    renderUI(<Timeline items={items} reverse />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Done");
  });
  it("shows loading and empty states", () => {
    const { rerender } = renderUI(<Timeline items={[]} loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    rerender(<Timeline items={[]} emptyLabel="Nothing yet" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });
});
