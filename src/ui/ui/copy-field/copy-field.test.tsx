import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { CopyField } from "./copy-field";

describe("CopyField", () => {
  it("copies the value and announces it", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    renderUI(<CopyField value="PG-1234" aria-label="Code" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await navigator.clipboard.readText()).toBe("PG-1234");
    expect(onCopy).toHaveBeenCalledWith("PG-1234");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });
  it("hides secrets until revealed but copies the real value", async () => {
    const user = userEvent.setup();
    renderUI(<CopyField secret value="tok_secret_value" aria-label="Token" />);
    expect(screen.getByLabelText("Token")).not.toHaveValue("tok_secret_value");
    await user.click(screen.getByRole("button", { name: "Show value" }));
    expect(screen.getByLabelText("Token")).toHaveValue("tok_secret_value");
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await navigator.clipboard.readText()).toBe("tok_secret_value");
  });
});
