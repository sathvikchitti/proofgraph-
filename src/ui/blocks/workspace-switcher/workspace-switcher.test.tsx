import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { WorkspaceSwitcher } from "./workspace-switcher";

const ws = [{ id: "s", name: "Student", role: "Personal" }, { id: "c", name: "Acme Corp", role: "Recruiter" }, { id: "a", name: "Admin", disabled: true }];

describe("WorkspaceSwitcher", () => {
  it("shows the current workspace and switches (uncontrolled)", async () => {
    const onValueChange = vi.fn();
    renderUI(<WorkspaceSwitcher workspaces={ws} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: /Student/ });
    expect(trigger).toHaveTextContent("Personal");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Acme Corp/ }));
    expect(onValueChange).toHaveBeenCalledWith("c");
    expect(screen.getByRole("button", { name: /Acme Corp/ })).toBeInTheDocument();
  });
  it("marks the active workspace, disables unavailable ones and offers create", async () => {
    const onCreate = vi.fn();
    renderUI(<WorkspaceSwitcher workspaces={ws} defaultValue="c" onCreate={onCreate} />);
    await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));
    expect(screen.getByRole("menuitemradio", { name: /Acme Corp/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: /Admin/ })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("menuitem", { name: "Create workspace" }));
    expect(onCreate).toHaveBeenCalled();
  });
  it("compact mode is icon-only but keeps an accessible name", () => {
    renderUI(<WorkspaceSwitcher workspaces={ws} compact />);
    expect(screen.getByRole("button", { name: "Switch workspace: Student" })).toBeInTheDocument();
  });
  it("works controlled", async () => {
    renderUI(<WorkspaceSwitcher workspaces={ws} value="s" />);
    await userEvent.click(screen.getByRole("button", { name: /Student/ }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: /Acme Corp/ }));
    expect(screen.getByRole("button", { name: /Student/ })).toBeInTheDocument();
  });
});
