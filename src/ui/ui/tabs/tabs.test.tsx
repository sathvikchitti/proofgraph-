import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderUI } from "../../test/utils";
import { Tabs } from "./tabs";

const items = [
  { value: "a", label: "Alpha", count: 3, content: "Alpha panel" },
  { value: "b", label: "Beta", content: "Beta panel" },
  { value: "c", label: "Gamma", disabled: true, content: "Gamma panel" },
];

describe("Tabs", () => {
  it("shows the first tab and its count, switches on click", async () => {
    const onValueChange = vi.fn();
    renderUI(<Tabs label="Sections" items={items} onValueChange={onValueChange} />);
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveTextContent("3");
    expect(screen.getByText("Alpha panel")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByText("Beta panel")).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith("b");
  });
  it("moves with arrow keys and skips disabled tabs", async () => {
    renderUI(<Tabs label="Sections" items={items} />);
    screen.getByRole("tab", { name: /Alpha/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveFocus();
  });
  it("works controlled", async () => {
    function C() {
      const [v, setV] = useState("b");
      return <Tabs label="S" items={items} value={v} onValueChange={setV} />;
    }
    renderUI(<C />);
    expect(screen.getByText("Beta panel")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /Alpha/ }));
    expect(screen.getByText("Alpha panel")).toBeInTheDocument();
  });
});
