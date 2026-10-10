import { screen } from "@testing-library/react";
import { renderUI as render } from "../../test/utils";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./theme-toggle";
import { setTheme } from "../../hooks/use-theme";

afterEach(() => {
  setTheme("system");
});

describe("ThemeToggle", () => {
  it("applies the chosen theme to the document when uncontrolled", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await userEvent.click(screen.getByRole("radio", { name: "System" }));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("is presentational when controlled and reports changes", async () => {
    const onValueChange = vi.fn();
    render(<ThemeToggle value="light" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(onValueChange).toHaveBeenCalledWith("dark");
    expect(document.documentElement).not.toHaveAttribute("data-theme", "dark");
  });

  it("cycles with the keyboard in cycle variant", async () => {
    render(<ThemeToggle variant="cycle" />);
    const btn = screen.getByRole("button", { name: /Theme/ });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await userEvent.keyboard("{Enter}");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
