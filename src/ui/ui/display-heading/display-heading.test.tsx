import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { DisplayHeading } from "./display-heading";

describe("DisplayHeading", () => {
  it("renders the requested level and keeps the accent run", () => {
    renderUI(<DisplayHeading as="h1">Make <em>everyone</em> a data person</DisplayHeading>);
    const h = screen.getByRole("heading", { level: 1 });
    expect(h.querySelector("em")).toHaveTextContent("everyone");
  });
  it("defaults to h2", () => {
    renderUI(<DisplayHeading>Title</DisplayHeading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
