import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Popover, PopoverClose } from "./popover";

describe("Popover", () => {
  it("toggles from the trigger and closes on Escape", async () => {
    renderUI(<Popover trigger={<button>Info</button>} aria-label="Details">Hello</Popover>);
    const trigger = screen.getByRole("button", { name: "Info" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Details" })).toHaveTextContent("Hello");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });
  it("closes from inside via PopoverClose", async () => {
    renderUI(<Popover defaultOpen trigger={<button>T</button>}><PopoverClose>Done</PopoverClose></Popover>);
    await userEvent.click(screen.getByText("Done"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
