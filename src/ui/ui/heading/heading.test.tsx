import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Heading } from "./heading";

describe("Heading", () => {
  it("level picks the tag independently of size", () => {
    renderUI(<Heading level={3} size="2xl">Hi</Heading>);
    const h = screen.getByRole("heading", { level: 3, name: "Hi" });
    expect(h.className).toContain("text-3xl");
  });
});
