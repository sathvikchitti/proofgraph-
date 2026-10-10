import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Alert } from "./alert";

describe("Alert", () => {
  it("uses role=alert for danger/warning and status otherwise", () => {
    renderUI(<><Alert tone="danger" title="D" /><Alert tone="info" title="I" /></>);
    expect(screen.getByRole("alert")).toHaveTextContent("D");
    expect(screen.getByRole("status")).toHaveTextContent("I");
  });
  it("carries the tone scope and renders actions", () => {
    renderUI(<Alert tone="success" title="Done" actions={<button>Undo</button>}>Body</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("data-tone", "success");
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });
  it("dismisses", async () => {
    const onDismiss = vi.fn();
    renderUI(<Alert onDismiss={onDismiss} title="x" />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
