import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Tag } from "./tag";

describe("Tag", () => {
  it("removes via the button", async () => {
    const onRemove = vi.fn();
    renderUI(<Tag onRemove={onRemove}>python</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Remove python" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
  it("removes with Backspace while focus is inside", async () => {
    const onRemove = vi.fn();
    renderUI(<Tag onRemove={onRemove}>python</Tag>);
    screen.getByRole("button", { name: "Remove python" }).focus();
    await userEvent.keyboard("{Backspace}");
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
  it("toggles when selectable (uncontrolled) and reports changes", async () => {
    const onSelectedChange = vi.fn();
    renderUI(<Tag selectable onSelectedChange={onSelectedChange}>react</Tag>);
    const chip = screen.getByRole("button", { name: "react" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });
  it("does nothing when disabled", async () => {
    const onRemove = vi.fn();
    renderUI(<Tag disabled onRemove={onRemove}>x</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Remove x" }));
    expect(onRemove).not.toHaveBeenCalled();
  });
});
