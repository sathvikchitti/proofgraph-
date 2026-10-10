import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title, description and actions", () => {
    renderUI(<EmptyState title="No data" description="Add some" action={<button>Add</button>} secondaryAction={<a href="/h">Help</a>} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Add some")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
  });
  it("hides the decorative icon from assistive tech", () => {
    const { container } = renderUI(<EmptyState title="x" icon={<svg />} />);
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
  });
});
