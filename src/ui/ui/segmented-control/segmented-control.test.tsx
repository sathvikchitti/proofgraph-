import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderUI } from "../../test/utils";
import { SegmentedControl } from "./segmented-control";

const options = [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "c", label: "Gamma" }];

describe("SegmentedControl", () => {
  it("starts on the first option and changes on click", async () => {
    const onValueChange = vi.fn();
    renderUI(<SegmentedControl label="Greek" options={options} onValueChange={onValueChange} />);
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  });
  it("does not deselect the active option", async () => {
    renderUI(<SegmentedControl label="Greek" options={options} defaultValue="b" />);
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  });
  it("moves with arrow keys", async () => {
    renderUI(<SegmentedControl label="Greek" options={options} defaultValue="a" />);
    screen.getByRole("radio", { name: "Alpha" }).focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  });
  it("works controlled", async () => {
    function C() {
      const [v, setV] = useState("a");
      return <SegmentedControl label="G" options={options} value={v} onValueChange={setV} />;
    }
    renderUI(<C />);
    await userEvent.click(screen.getByRole("radio", { name: "Gamma" }));
    expect(screen.getByRole("radio", { name: "Gamma" })).toBeChecked();
  });
});
