import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { GuideLine, PageFrame } from "./page-frame";

describe("PageFrame", () => {
  it("renders the chosen landmark with its children", () => {
    renderUI(<PageFrame as="main">Hello</PageFrame>);
    expect(screen.getByRole("main")).toHaveTextContent("Hello");
  });
  it("guide lines are decorative and report their orientation", () => {
    const { container } = renderUI(
      <>
        <GuideLine />
        <GuideLine orientation="vertical" dashed />
      </>,
    );
    const lines = container.querySelectorAll("[aria-hidden='true']");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toHaveAttribute("data-orientation", "vertical");
  });
});
