import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Terminal, TerminalToken } from "./terminal";

describe("Terminal", () => {
  it("is a named, focusable block of preformatted text", () => {
    renderUI(
      <Terminal aria-label="Create thread">
        $ run <TerminalToken kind="value">ok</TerminalToken>
      </Terminal>,
    );
    const pre = screen.getByLabelText("Create thread");
    expect(pre.tagName).toBe("PRE");
    expect(pre).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
  it("hides the decorative caret from assistive technology", () => {
    const { container } = renderUI(<Terminal caret>$ </Terminal>);
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });
});
