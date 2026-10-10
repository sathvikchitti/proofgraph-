import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Text } from "./text";

describe("Text", () => {
  it("renders the requested tag and tone scope", () => {
    renderUI(<Text as="span" tone="danger" mono>x</Text>);
    const el = screen.getByText("x");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-tone", "danger");
    expect(el).toHaveClass("font-mono");
  });
});
