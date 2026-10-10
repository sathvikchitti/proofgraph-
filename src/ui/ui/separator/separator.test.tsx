import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Separator } from "./separator";

describe("Separator", () => {
  it("is decorative by default", () => {
    renderUI(<Separator />);
    expect(screen.queryByRole("separator")).toBeNull();
  });
  it("exposes role=separator when not decorative", () => {
    renderUI(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });
  it("shows a label", () => {
    renderUI(<Separator label="or" />);
    expect(screen.getByText("or")).toBeInTheDocument();
  });
});
