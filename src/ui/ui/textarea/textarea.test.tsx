import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderUI } from "../../test/utils";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("counts characters against maxLength and links the counter", async () => {
    renderUI(<Textarea aria-label="Bio" maxLength={10} showCounter />);
    const ta = screen.getByLabelText("Bio");
    await userEvent.type(ta, "hello");
    expect(screen.getByText("5/10")).toBeInTheDocument();
    expect(ta.getAttribute("aria-describedby")).toBe(screen.getByText("5/10").id);
  });
  it("works controlled", async () => {
    function C() {
      const [v, setV] = useState("");
      return <Textarea aria-label="C" value={v} onValueChange={setV} />;
    }
    renderUI(<C />);
    await userEvent.type(screen.getByLabelText("C"), "xyz");
    expect(screen.getByLabelText("C")).toHaveValue("xyz");
  });
  it("supports auto-resize without throwing", async () => {
    renderUI(<Textarea aria-label="Auto" autoResize defaultValue="a" />);
    await userEvent.type(screen.getByLabelText("Auto"), "{Enter}b");
    expect(screen.getByLabelText("Auto")).toHaveValue("a\nb");
  });
});
