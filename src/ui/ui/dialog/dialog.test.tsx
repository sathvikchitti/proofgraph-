import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderUI } from "../../test/utils";
import { Dialog } from "./dialog";

describe("Dialog", () => {
  it("opens from its trigger with an accessible name and description", async () => {
    renderUI(<Dialog trigger={<button>Open</button>} title="Settings" description="Change things">Body</Dialog>);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dlg = screen.getByRole("dialog", { name: "Settings" });
    expect(dlg).toHaveAccessibleDescription("Change things");
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
  it("closes with Escape and restores focus to the trigger", async () => {
    renderUI(<Dialog trigger={<button>Open</button>} title="T">x</Dialog>);
    const trigger = screen.getByRole("button", { name: "Open" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });
  it("closes via the close button and reports open changes", async () => {
    const onOpenChange = vi.fn();
    renderUI(<Dialog defaultOpen onOpenChange={onOpenChange} title="T">x</Dialog>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("works controlled", async () => {
    function C() {
      const [o, setO] = useState(false);
      return (
        <>
          <button onClick={() => setO(true)}>Go</button>
          <Dialog open={o} onOpenChange={setO} title="Ctl" footer={<button onClick={() => setO(false)}>Done</button>} />
        </>
      );
    }
    renderUI(<C />);
    await userEvent.click(screen.getByText("Go"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Done"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
