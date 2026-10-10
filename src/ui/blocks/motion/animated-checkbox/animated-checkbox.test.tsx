import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../../test/utils";
import { AnimatedCheckbox } from "./animated-checkbox";

describe("AnimatedCheckbox", () => {
  it("is a real checkbox that reports changes", async () => {
    const onChange = vi.fn();
    renderUI(<AnimatedCheckbox label="Ship the build" onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: /Ship the build/ });
    expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");
  });
  it("ignores clicks when disabled", async () => {
    const onChange = vi.fn();
    renderUI(<AnimatedCheckbox label="Locked" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: /Locked/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
