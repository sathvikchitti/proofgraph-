import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { CropMarks } from "./crop-marks";

describe("CropMarks", () => {
  it("wraps children", () => {
    renderUI(<CropMarks>Inside</CropMarks>);
    expect(screen.getByText("Inside")).toHaveClass("crop-marks");
  });
  it("applies the marks to the child with asChild", () => {
    renderUI(
      <CropMarks asChild size="lg">
        <nav aria-label="Main">x</nav>
      </CropMarks>,
    );
    expect(screen.getByRole("navigation")).toHaveClass("crop-marks");
  });
});
