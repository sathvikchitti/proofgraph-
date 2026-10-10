import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { setTheme } from "../../hooks/use-theme";
import { UserMenu } from "./user-menu";

afterEach(() => setTheme("system"));
const user = { name: "Asha Rao", email: "asha@example.com" };

describe("UserMenu", () => {
  it("opens from the avatar and shows identity and items", async () => {
    const onSelect = vi.fn();
    renderUI(<UserMenu user={user} items={[{ label: "Profile", onSelect }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu: Asha Rao" }));
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Profile" }));
    expect(onSelect).toHaveBeenCalled();
  });
  it("changes the document theme from the menu", async () => {
    renderUI(<UserMenu user={user} />);
    await userEvent.click(screen.getByRole("button", { name: /Account menu/ }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
  it("supports a controlled theme and hiding the section", async () => {
    const onThemeChange = vi.fn();
    const { rerender } = renderUI(<UserMenu user={user} theme="light" onThemeChange={onThemeChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Account menu/ }));
    expect(screen.getByRole("menuitemradio", { name: "Light" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "System" }));
    expect(onThemeChange).toHaveBeenCalledWith("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme", "system");
    rerender(<UserMenu user={user} hideTheme />);
    expect(screen.queryByRole("menuitemradio", { name: "Light" })).toBeNull();
  });
  it("signs out", async () => {
    const onSignOut = vi.fn();
    renderUI(<UserMenu user={user} onSignOut={onSignOut} />);
    await userEvent.click(screen.getByRole("button", { name: /Account menu/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
