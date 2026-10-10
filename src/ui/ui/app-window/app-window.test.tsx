import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { AppWindow } from "./app-window";

describe("AppWindow", () => {
  it("is a named group using its string title", () => {
    renderUI(<AppWindow title="Revenue">Body</AppWindow>);
    expect(screen.getByRole("group", { name: "Revenue" })).toHaveTextContent("Body");
  });
  it("draws decorative traffic dots in chrome mode", () => {
    const { container } = renderUI(<AppWindow chrome title="CLI">x</AppWindow>);
    const dots = container.querySelector("[aria-hidden='true']");
    expect(dots?.querySelectorAll("i")).toHaveLength(3);
  });
  it("can drop the bar", () => {
    renderUI(<AppWindow bare title="Hidden">x</AppWindow>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
