import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Select } from "./select";

const options = [
  { value: "a", label: "Alpha", group: "G1" },
  { value: "b", label: "Beta", group: "G1" },
  { value: "c", label: "Gamma", group: "G2", disabled: true },
];

describe("Select", () => {
  it("opens, selects and reports the value", async () => {
    const onValueChange = vi.fn();
    renderUI(<Select options={options} aria-label="Greek" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Greek" }));
    await userEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("combobox", { name: "Greek" })).toHaveTextContent("Beta");
  });
  it("supports the keyboard", async () => {
    const onValueChange = vi.fn();
    renderUI(<Select options={options} aria-label="Greek" onValueChange={onValueChange} />);
    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalled();
  });
  it("shows the placeholder and disables", () => {
    renderUI(<Select options={options} placeholder="Pick one" disabled aria-label="X" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick one");
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
