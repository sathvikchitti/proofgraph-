import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Code } from "./code";

describe("Code", () => {
  it("renders inline code", () => {
    renderUI(<Code tone="info">npm test</Code>);
    expect(screen.getByText("npm test").tagName).toBe("CODE");
  });
});
