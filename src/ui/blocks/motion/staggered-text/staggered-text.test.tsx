import { screen } from "@testing-library/react";
import { renderUI } from "../../../test/utils";
import { StaggeredText } from "./staggered-text";

describe("StaggeredText", () => {
  it("exposes the whole sentence once to assistive technology", () => {
    renderUI(<StaggeredText as="h2" segmentBy="words" text="Proof not claims" />);
    expect(screen.getByRole("heading", { level: 2, name: "Proof not claims" })).toBeInTheDocument();
  });
});
