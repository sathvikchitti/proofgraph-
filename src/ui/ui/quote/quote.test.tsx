import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Quote } from "./quote";

describe("Quote", () => {
  it("renders the quote with its attribution as a figure", () => {
    renderUI(<Quote author="Sam Rivera." role="VP of Engineering">Proof, <strong>not claims</strong>.</Quote>);
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(screen.getByText("not claims").tagName).toBe("STRONG");
    expect(screen.getByText("Sam Rivera.")).toBeInTheDocument();
  });
  it("omits the caption without author or role", () => {
    const { container } = renderUI(<Quote>Alone</Quote>);
    expect(container.querySelector("figcaption")).toBeNull();
  });
});
