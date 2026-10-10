import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Input } from "./input";

describe("Input", () => {
  it("reports typed values", async () => {
    const onValueChange = vi.fn();
    renderUI(<Input aria-label="Name" onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "ab");
    expect(onValueChange).toHaveBeenLastCalledWith("ab");
  });
  it("renders prefix and suffix slots", () => {
    renderUI(<Input aria-label="URL" prefix="https://" suffix=".com" />);
    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".com")).toBeInTheDocument();
  });
  it("reflects invalid and busy states in ARIA", () => {
    renderUI(<Input aria-label="X" invalid loading />);
    const el = screen.getByLabelText("X");
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el).toHaveAttribute("aria-busy", "true");
  });
  it("is disabled", async () => {
    renderUI(<Input aria-label="X" disabled />);
    expect(screen.getByLabelText("X")).toBeDisabled();
  });
});
