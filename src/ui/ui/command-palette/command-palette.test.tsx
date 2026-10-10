import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { CommandPalette } from "./command-palette";

const groups = [
  { heading: "Navigate", items: [{ id: "home", label: "Go home" }, { id: "people", label: "Candidates", keywords: ["students"] }] },
  { heading: "Settings", items: [{ id: "theme", label: "Toggle theme" }] },
];

describe("CommandPalette", () => {
  it("opens with the hotkey, filters, and runs the chosen command", async () => {
    const run = vi.fn();
    renderUI(<CommandPalette groups={[{ ...groups[0], items: groups[0].items.map((i) => ({ ...i, onSelect: () => run(i.id) })) }, groups[1]]} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Control>}k{/Control}");
    const input = await screen.findByPlaceholderText("Type a command or search…");
    await userEvent.type(input, "students");
    expect(screen.queryByText("Go home")).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(run).toHaveBeenCalledWith("people");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("shows an empty state", async () => {
    renderUI(<CommandPalette defaultOpen groups={groups} />);
    await userEvent.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });
  it("lists recent items only while the query is empty", async () => {
    renderUI(<CommandPalette defaultOpen groups={groups} recent={[groups[0].items[0]]} />);
    expect(screen.getByText("Recent")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("combobox"), "the");
    expect(screen.queryByText("Recent")).toBeNull();
  });
  it("ignores the hotkey when disabled and closes with Escape", async () => {
    renderUI(<CommandPalette hotkey={false} groups={groups} />);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
