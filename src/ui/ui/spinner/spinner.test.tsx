import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("is a status region when labelled", () => {
    renderUI(<Spinner label="Scanning" />);
    expect(screen.getByRole("status")).toHaveTextContent("Scanning");
  });
  it("is decorative without a label", () => {
    const { container } = renderUI(<Spinner />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
