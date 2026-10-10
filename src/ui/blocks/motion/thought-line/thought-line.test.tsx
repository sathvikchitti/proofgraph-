import { screen } from "@testing-library/react";
import { renderUI } from "../../../test/utils";
import { ThoughtLine } from "./thought-line";

describe("ThoughtLine", () => {
  it("shows the working label and the latest step", () => {
    renderUI(<ThoughtLine working steps={["Reading the question", "Searching your notes"]} />);
    expect(screen.getAllByText(/Thinking/).length).toBeGreaterThan(0);
    expect(screen.getByText("Searching your notes")).toBeInTheDocument();
  });
  it("settles into a done line when work finishes", () => {
    renderUI(<ThoughtLine working={false} elapsed={4.2} steps={["Reading the question"]} />);
    expect(screen.getAllByText(/Thought for/).length).toBeGreaterThan(0);
  });
});
