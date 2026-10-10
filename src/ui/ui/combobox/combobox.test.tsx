import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Combobox } from "./combobox";

const options = [
  { value: "py", label: "Python" },
  { value: "ts", label: "TypeScript" },
  { value: "go", label: "Go" },
];

describe("Combobox", () => {
  it("filters locally and selects with the keyboard", async () => {
    const onValueChange = vi.fn();
    renderUI(<Combobox options={options} aria-label="Skill" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Skill" }));
    await userEvent.type(screen.getByPlaceholderText("Search…"), "type");
    expect(screen.queryByText("Python")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("ts");
    expect(screen.getByRole("combobox", { name: "Skill" })).toHaveTextContent("TypeScript");
  });
  it("shows the empty state", async () => {
    renderUI(<Combobox options={options} aria-label="Skill" emptyLabel="Nothing" />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByPlaceholderText("Search…"), "zzz");
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });
  it("debounces async search and does not filter locally", async () => {
    const onSearchChange = vi.fn();
    renderUI(<Combobox options={options} aria-label="Skill" onSearchChange={onSearchChange} debounceMs={20} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByPlaceholderText("Search…"), "zz");
    await vi.waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith("zz"));
    expect(screen.getByText("Python")).toBeInTheDocument();
  });
  it("clears the selection", async () => {
    const onValueChange = vi.fn();
    renderUI(<Combobox options={options} defaultValue="go" clearable aria-label="Skill" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
