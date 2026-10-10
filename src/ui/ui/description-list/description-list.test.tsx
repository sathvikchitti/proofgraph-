import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { DescriptionList } from "./description-list";

describe("DescriptionList", () => {
  it("uses dl/dt/dd semantics and a placeholder for empty values", () => {
    const { container } = renderUI(<DescriptionList items={[{ label: "Repo", value: "acme/x" }, { label: "Reviewer", value: null }]} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
  it("copies copyable values", async () => {
    const user = userEvent.setup();
    renderUI(<DescriptionList items={[{ label: "Commit", value: "15fedba", copyable: true }]} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await navigator.clipboard.readText()).toBe("15fedba");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
  it("links values and shows hints", () => {
    renderUI(<DescriptionList items={[{ label: "Repo", value: "acme/x", href: "/r", hint: "default branch" }]} />);
    expect(screen.getByRole("link", { name: "acme/x" })).toHaveAttribute("href", "/r");
    expect(screen.getByText("default branch")).toBeInTheDocument();
  });
});
