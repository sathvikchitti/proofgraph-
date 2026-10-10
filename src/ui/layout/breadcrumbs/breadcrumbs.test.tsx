import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Breadcrumbs } from "./breadcrumbs";

const it_ = (label: string) => ({ label, href: `/${label}` });

describe("Breadcrumbs", () => {
  it("renders links with the last item as the current page", () => {
    renderUI(<Breadcrumbs items={[it_("Home"), it_("People"), { label: "Asha" }]} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(within(nav).getByText("Asha")).toHaveAttribute("aria-current", "page");
  });
  it("collapses the middle into a menu when there are too many items", async () => {
    renderUI(<Breadcrumbs items={[it_("A"), it_("B"), it_("C"), it_("D"), it_("E"), { label: "F" }]} />);
    expect(screen.queryByRole("link", { name: "B" })).toBeNull();
    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "E" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show hidden pages" }));
    expect(screen.getByRole("menuitem", { name: "B" })).toHaveAttribute("href", "/B");
    expect(screen.getByRole("menuitem", { name: "C" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "D" })).toBeInTheDocument();
  });
  it("does not collapse at or under maxItems", () => {
    renderUI(<Breadcrumbs maxItems={3} items={[it_("A"), it_("B"), { label: "C" }]} />);
    expect(screen.queryByRole("button", { name: "Show hidden pages" })).toBeNull();
  });
});
