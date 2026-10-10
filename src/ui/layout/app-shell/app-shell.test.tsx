import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { AppShell, type NavSection } from "./app-shell";

const nav: NavSection[] = [
  { items: [{ id: "home", label: "Home", href: "/home" }, { id: "people", label: "People", href: "/people", badge: 3 }] },
  { label: "More", items: [{ id: "x", label: "Locked", href: "/x", disabled: true }] },
];
const shell = (props = {}) => renderUI(<AppShell nav={nav} activeId="people" brand={<b>Brand</b>} topbar={<span>top</span>} {...props}><p>page content</p></AppShell>);

describe("AppShell", () => {
  beforeEach(() => localStorage.clear());

  it("renders nav sections, marks the active item and shows badges", () => {
    shell();
    const sidebar = screen.getByRole("complementary");
    const people = within(sidebar).getByRole("link", { name: /^People/ });
    expect(people).toHaveAttribute("aria-current", "page");
    expect(people).toHaveTextContent("3");
    expect(within(sidebar).getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(within(sidebar).getByText("More")).toBeInTheDocument();
    expect(within(sidebar).getByRole("link", { name: "Locked" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("page content")).toBeInTheDocument();
  });
  it("has a skip link to the main region", () => {
    shell();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(screen.getByRole("main")).toHaveAttribute("id", skip.getAttribute("href")!.slice(1));
  });
  it("calls onNavigate and lets the app prevent default routing", async () => {
    const onNavigate = vi.fn((_i, e: React.MouseEvent) => e.preventDefault());
    shell({ onNavigate });
    await userEvent.click(within(screen.getByRole("complementary")).getByRole("link", { name: "Home" }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "home" }), expect.anything());
  });
  it("supports a router link via renderLink", () => {
    shell({ renderLink: ({ item, className, current, children }: { item: { id: string; label: string }; className: string; current: boolean; children: React.ReactNode }) => <button className={className} data-current={current} data-id={item.id}>{children}</button> });
    expect(screen.getAllByRole("button", { name: /Home/ })[0]).toHaveAttribute("data-id", "home");
  });
  it("collapses to an icon rail, hides labels visually, and persists", async () => {
    const { unmount } = shell({ persistKey: "shell" });
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    const toggle = screen.getByRole("button", { name: "Expand sidebar" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    const sidebar = screen.getByRole("complementary");
    expect(within(sidebar).getByText("Home")).toHaveClass("sr-only");
    expect(JSON.parse(localStorage.getItem("shell")!)).toBe(true);
    unmount();
    shell({ persistKey: "shell" });
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });
  it("is controllable", async () => {
    const onCollapsedChange = vi.fn();
    shell({ collapsed: false, onCollapsedChange });
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument();
  });
  it("opens the navigation as a sheet from the menu button and closes it after navigating", async () => {
    shell({ onNavigate: (_i: unknown, e: React.MouseEvent) => e.preventDefault() });
    await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = await screen.findByRole("dialog", { name: "Main navigation" });
    await userEvent.click(within(dialog).getByRole("link", { name: "Home" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
