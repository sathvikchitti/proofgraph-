import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { QuestionCard } from "./question-card";

describe("QuestionCard", () => {
  it("shows progress, prompt, hint and the timer slot", () => {
    renderUI(<QuestionCard index={2} total={5} prompt="Why?" hint="Be brief" timer={<span>0:30</span>} />);
    expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Why?" })).toBeInTheDocument();
    expect(screen.getByText("Be brief")).toBeInTheDocument();
    expect(screen.getByText("0:30")).toBeInTheDocument();
  });
  it("text mode: submit is disabled until there is an answer, then submits the value", async () => {
    const onSubmit = vi.fn();
    renderUI(<QuestionCard prompt="Q" onSubmit={onSubmit} />);
    const submit = screen.getByRole("button", { name: "Submit answer" });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Your answer"), "my answer");
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledWith("my answer");
  });
  it("shows loading while an async submit runs", async () => {
    let release!: () => void;
    renderUI(<QuestionCard prompt="Q" defaultValue="x" onSubmit={() => new Promise<void>((r) => (release = r))} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(screen.getByRole("button", { name: "Submit answer" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Your answer")).toBeDisabled();
    release();
    await waitFor(() => expect(screen.getByLabelText("Your answer")).not.toBeDisabled());
  });
  it("choice mode: selects with the keyboard and reports the value", async () => {
    const onValueChange = vi.fn();
    renderUI(<QuestionCard prompt="Q" mode="choice" choices={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]} onValueChange={onValueChange} onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "Beta" })).toBeChecked();
  });
  it("result state locks input, announces the verdict and marks choices", () => {
    renderUI(<QuestionCard prompt="Q" mode="choice" choices={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]} defaultValue="b" onSubmit={() => {}} result={{ verdict: "incorrect", correctValue: "a", feedback: "Alpha is right." }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Not quite");
    expect(screen.getByRole("status")).toHaveTextContent("Alpha is right.");
    expect(screen.getByRole("radio", { name: /Alpha/ })).toHaveAttribute("data-verdict", "correct");
    expect(screen.getByRole("radio", { name: /Beta/ })).toHaveAttribute("data-verdict", "incorrect");
    expect(screen.getByRole("radio", { name: /Alpha/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Submit answer" })).toBeNull();
  });
  it("custom mode renders the slot and does not require text; skip works", async () => {
    const onSkip = vi.fn();
    const onSubmit = vi.fn();
    renderUI(<QuestionCard prompt="Q" mode="custom" answer={<button>Record</button>} onSubmit={onSubmit} onSkip={onSkip} />);
    expect(screen.getByRole("button", { name: "Record" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));
    expect(onSubmit).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalled();
  });
});
