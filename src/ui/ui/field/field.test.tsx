import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Input } from "../input";
import { Field } from "./field";

describe("Field", () => {
  it("links label, hint and error to the control", () => {
    renderUI(<Field label="Email" hint="Work address" error="Invalid"><Input /></Field>);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const described = input.getAttribute("aria-describedby")!.split(" ");
    expect(described.map((id) => document.getElementById(id)?.textContent)).toEqual(
      expect.arrayContaining(["Work address", "Invalid"]),
    );
  });
  it("focuses the control when the label is clicked", async () => {
    renderUI(<Field label="Name"><Input /></Field>);
    await userEvent.click(screen.getByText("Name"));
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });
  it("marks required for assistive tech", () => {
    renderUI(<Field label="Name" required><Input /></Field>);
    expect(screen.getByLabelText(/Name/)).toBeRequired();
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });
  it("disables the wrapped control", () => {
    renderUI(<Field label="Locked" disabled><Input /></Field>);
    expect(screen.getByLabelText("Locked")).toBeDisabled();
  });
});
