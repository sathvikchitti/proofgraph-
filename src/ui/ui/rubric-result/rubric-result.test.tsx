import { screen, within } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { RubricResult } from "./rubric-result";

const criteria = [{ id: "a", label: "Correctness", score: 4, feedback: "Good" }, { id: "b", label: "Depth", score: 2 }];

describe("RubricResult", () => {
  it("lists criteria with accessible scores and feedback", () => {
    renderUI(<RubricResult criteria={criteria} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole("img", { name: "4 out of 5" })).toBeInTheDocument();
    expect(within(items[0]!).getByText("Good")).toBeInTheDocument();
    expect(items[0]).toHaveAttribute("data-tone", "success");
    expect(items[1]).toHaveAttribute("data-tone", "danger"); // 2 of 5 is at the 40% danger boundary
  });
  it("computes the overall average unless one is given", () => {
    const { rerender } = renderUI(<RubricResult criteria={criteria} />);
    expect(screen.getByLabelText("Overall: 3 out of 5")).toBeInTheDocument();
    rerender(<RubricResult criteria={criteria} overall={4.5} overallLabel="Final" />);
    expect(screen.getByLabelText("Final: 4.5 out of 5")).toBeInTheDocument();
  });
  it("fills one segment per point and supports other scales", () => {
    const { container } = renderUI(<RubricResult criteria={[{ id: "a", label: "X", score: 7 }]} max={10} showOverall={false} />);
    const segs = container.querySelectorAll("[data-filled]");
    expect(segs).toHaveLength(10);
    expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(7);
  });
  it("renders the follow-up slot and summary", () => {
    renderUI(<RubricResult criteria={criteria} summary="Overall fine" followUp={<button>Answer</button>} />);
    expect(screen.getByText("Overall fine")).toBeInTheDocument();
    expect(screen.getByText("Follow-up")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Answer" })).toBeInTheDocument();
  });
  it("accepts a custom tone function", () => {
    renderUI(<RubricResult criteria={[{ id: "a", label: "X", score: 5 }]} toneFor={() => "info"} showOverall={false} />);
    expect(screen.getByRole("listitem")).toHaveAttribute("data-tone", "info");
  });
});
