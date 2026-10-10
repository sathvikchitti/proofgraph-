import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { LabelTab } from "./label-tab";

describe("LabelTab", () => {
  it("renders its caption and marks itself for sibling styling", () => {
    renderUI(<LabelTab>Chat with the agent</LabelTab>);
    expect(screen.getByText("Chat with the agent")).toHaveAttribute("data-part", "label-tab");
  });
});
