import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { ConfirmDialog } from "./confirm-dialog";

const open = () => userEvent.click(screen.getByRole("button", { name: "Open" }));

describe("ConfirmDialog", () => {
  it("is an alertdialog that runs onConfirm and closes", async () => {
    const onConfirm = vi.fn();
    renderUI(<ConfirmDialog trigger={<button>Open</button>} title="Sure?" description="d" onConfirm={onConfirm} confirmLabel="Yes" />);
    await open();
    expect(screen.getByRole("alertdialog", { name: "Sure?" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
  it("shows loading while the async confirm runs", async () => {
    let release!: () => void;
    const onConfirm = () => new Promise<void>((r) => (release = r));
    renderUI(<ConfirmDialog trigger={<button>Open</button>} title="Sure?" description="d" onConfirm={onConfirm} confirmLabel="Yes" />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(screen.getByRole("button", { name: "Yes" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Yes" })).toHaveAttribute("aria-busy", "true");
    release();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
  it("stays open and shows the error when confirm rejects", async () => {
    renderUI(<ConfirmDialog trigger={<button>Open</button>} title="Sure?" description="d" onConfirm={() => Promise.reject({ detail: "Server said no" })} confirmLabel="Yes" />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server said no");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
  it("cancel closes without confirming", async () => {
    const onConfirm = vi.fn();
    renderUI(<ConfirmDialog trigger={<button>Open</button>} title="Sure?" description="d" onConfirm={onConfirm} />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
});
