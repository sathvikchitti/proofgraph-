import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { ConnectAccountCard } from "./connect-account-card";

describe("ConnectAccountCard", () => {
  it("offers Connect when disconnected", async () => {
    const onConnect = vi.fn();
    renderUI(<ConnectAccountCard provider="GitHub" status="disconnected" onConnect={onConnect} />);
    expect(screen.getByText("Not connected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalled();
  });
  it("shows account, last sync and sync/disconnect when connected", async () => {
    const onSync = vi.fn();
    renderUI(<ConnectAccountCard provider="GitHub" status="connected" account="@asha" lastSyncedAt={Date.now() - 3 * 3600_000} onSync={onSync} onDisconnect={() => {}} />);
    expect(screen.getByText("@asha")).toBeInTheDocument();
    expect(screen.getByText(/Last synced 3 hours ago/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sync now" }));
    expect(onSync).toHaveBeenCalled();
  });
  it("asks for confirmation before disconnecting", async () => {
    const onDisconnect = vi.fn();
    renderUI(<ConnectAccountCard provider="GitHub" status="connected" onDisconnect={onDisconnect} />);
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("alertdialog", { name: "Disconnect GitHub?" });
    await userEvent.click(screen.getAllByRole("button", { name: "Disconnect" }).find((b) => dialog.contains(b))!);
    await waitFor(() => expect(onDisconnect).toHaveBeenCalledTimes(1));
  });
  it("can skip the confirmation", async () => {
    const onDisconnect = vi.fn();
    renderUI(<ConnectAccountCard provider="GitHub" status="connected" confirmDisconnect={false} onDisconnect={onDisconnect} />);
    await userEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalled();
  });
  it("shows an error with a reconnect action", async () => {
    const onConnect = vi.fn();
    renderUI(<ConnectAccountCard provider="GitHub" status="error" error="Token expired" onConnect={onConnect} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Token expired");
    await userEvent.click(screen.getByRole("button", { name: "Reconnect" }));
    expect(onConnect).toHaveBeenCalled();
  });
  it("shows busy states", () => {
    const { rerender } = renderUI(<ConnectAccountCard provider="GitHub" status="connecting" />);
    expect(screen.getByRole("button", { name: /Connect/ })).toHaveAttribute("aria-busy", "true");
    rerender(<ConnectAccountCard provider="GitHub" status="syncing" onSync={() => {}} onDisconnect={() => {}} />);
    expect(screen.getByRole("button", { name: /Sync now/ })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeDisabled();
  });
});
