import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { DropdownMenu } from "./dropdown-menu";

const open = () => userEvent.click(screen.getByRole("button", { name: "Menu" }));

describe("DropdownMenu", () => {
  it("runs the selected item and closes", async () => {
    const onSelect = vi.fn();
    renderUI(<DropdownMenu trigger={<button>Menu</button>} items={[{ label: "Edit", onSelect }, { label: "Remove", tone: "danger" }]} />);
    await open();
    expect(screen.getByRole("menuitem", { name: "Remove" })).toHaveAttribute("data-tone", "danger");
    await userEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
  it("is keyboard navigable", async () => {
    const onSelect = vi.fn();
    renderUI(<DropdownMenu trigger={<button>Menu</button>} items={[{ label: "One" }, { label: "Two", onSelect }]} />);
    screen.getByRole("button", { name: "Menu" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalled();
  });
  it("skips disabled items", async () => {
    const onSelect = vi.fn();
    renderUI(<DropdownMenu trigger={<button>Menu</button>} items={[{ label: "Nope", disabled: true, onSelect }]} />);
    await open();
    expect(screen.getByRole("menuitem", { name: "Nope" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("menuitem", { name: "Nope" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("toggles checkbox and radio entries", async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    renderUI(
      <DropdownMenu
        trigger={<button>Menu</button>}
        items={[
          { type: "checkbox", label: "Grid", checked: false, onCheckedChange },
          { type: "radio", value: "a", onValueChange, options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] },
        ]}
      />,
    );
    await open();
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Grid" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await open();
    await userEvent.click(screen.getByRole("menuitemradio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
  it("renders link items", async () => {
    renderUI(<DropdownMenu trigger={<button>Menu</button>} items={[{ label: "Docs", href: "/docs" }]} />);
    await open();
    expect(screen.getByRole("menuitem", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });
});
