import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  it("keeps text in the accessibility tree but hides it visually", () => {
    renderUI(<button><VisuallyHidden>Search</VisuallyHidden></button>);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("Search")).toHaveClass("sr-only");
  });
});
