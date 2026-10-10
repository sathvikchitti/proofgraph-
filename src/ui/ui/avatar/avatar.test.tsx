import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Avatar, AvatarGroup } from "./avatar";

describe("Avatar", () => {
  it("falls back to initials and names itself", () => {
    renderUI(<Avatar name="Asha Rao" />);
    expect(screen.getByRole("img", { name: "Asha Rao" })).toHaveTextContent("AR");
  });
  it("announces status when labelled", () => {
    renderUI(<Avatar name="B" status="success" statusLabel="Online" />);
    expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
  });
  it("collapses overflow into +N", () => {
    renderUI(<AvatarGroup max={2} items={[{ name: "A A" }, { name: "B B" }, { name: "C C" }, { name: "D D" }]} />);
    expect(screen.getByRole("img", { name: "2 more" })).toHaveTextContent("+2");
  });
});
