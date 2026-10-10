import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the page's h1, description, meta, actions and tabs", () => {
    renderUI(<PageHeader title="Candidates" description="All of them" meta={<span>live</span>} actions={<button>Add</button>} tabs={<div>tabs-slot</div>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Candidates" })).toBeInTheDocument();
    for (const t of ["All of them", "live", "tabs-slot"]) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
  it("renders breadcrumb data with the Breadcrumbs element, or a custom node", () => {
    const { rerender } = renderUI(<PageHeader title="T" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Here" }]} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    rerender(<PageHeader title="T" breadcrumbs={<nav aria-label="Custom" />} />);
    expect(screen.getByRole("navigation", { name: "Custom" })).toBeInTheDocument();
  });
});
