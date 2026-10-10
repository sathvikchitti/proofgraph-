import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Composer } from "./composer";

describe("Composer", () => {
  it("sends on Enter, clears itself and keeps Shift+Enter for new lines", async () => {
    const onSubmit = vi.fn();
    renderUI(<Composer onSubmit={onSubmit} />);
    const box = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(box, "hello{Shift>}{Enter}{/Shift}world");
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(box, "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hello\nworld");
    expect(box).toHaveValue("");
  });
  it("keeps send disabled until there is text", async () => {
    renderUI(<Composer />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox"), "x");
    expect(send).toBeEnabled();
  });
  it("does not send while loading or disabled", async () => {
    const onSubmit = vi.fn();
    renderUI(<Composer defaultValue="draft" loading onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("leaves a controlled value to the parent", async () => {
    const onSubmit = vi.fn();
    renderUI(<Composer value="fixed" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("fixed");
    expect(screen.getByRole("textbox")).toHaveValue("fixed");
  });
});
