import { act, screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Toaster, toast } from "./toast";

describe("Toast", () => {
  it("shows a toast with description and action", async () => {
    const retry = vi.fn();
    renderUI(<Toaster />);
    act(() => {
      toast.error("Could not save", { description: "Server error", action: { label: "Retry", onClick: retry } });
    });
    expect(await screen.findByText("Could not save")).toBeInTheDocument();
    expect(screen.getByText("Server error")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Retry" }).click());
    expect(retry).toHaveBeenCalled();
  });
  it("labels its region", () => {
    renderUI(<Toaster label="Alerts" />);
    expect(screen.getByLabelText(/^Alerts/)).toBeInTheDocument();
  });
});
