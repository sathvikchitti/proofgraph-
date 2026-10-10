import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Badge } from "./badge";

describe("Badge", () => {
  it("carries its tone scope and defaults to neutral", () => {
    renderUI(<><Badge>One</Badge><Badge tone="success">Two</Badge></>);
    expect(screen.getByText("One")).toHaveAttribute("data-tone", "neutral");
    expect(screen.getByText("Two")).toHaveAttribute("data-tone", "success");
  });
  it("renders a decorative dot", () => {
    const { container } = renderUI(<Badge dot>Live</Badge>);
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
  });
  it("supports asChild", () => {
    renderUI(<Badge asChild><a href="/b">Go</a></Badge>);
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("data-tone", "neutral");
  });
});
