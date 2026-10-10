import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Stepper, Wizard, type WizardStep } from "./stepper";

describe("Stepper", () => {
  const steps = [{ id: "a", label: "One" }, { id: "b", label: "Two", optional: true }, { id: "c", label: "Three" }];
  it("marks the current step and completed steps accessibly", () => {
    renderUI(<Stepper steps={steps} current={1} />);
    expect(screen.getByRole("list", { name: "Progress" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).toHaveAttribute("data-status", "completed");
    expect(items[0]).toHaveTextContent("completed");
    expect(items[1]).toHaveTextContent("(Optional)");
  });
  it("makes reachable steps buttons", async () => {
    const onStepClick = vi.fn();
    renderUI(<Stepper steps={steps} current={2} onStepClick={onStepClick} canGoTo={(i) => i === 0} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button"));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});

describe("Wizard", () => {
  const make = (validate?: WizardStep["validate"], onFinish?: () => void): [WizardStep[], () => void] => [
    [
      { id: "a", label: "First", content: <p>Panel A</p>, validate },
      { id: "b", label: "Second", content: <p>Panel B</p> },
    ],
    onFinish ?? (() => {}),
  ];

  it("walks next/back and finishes", async () => {
    const onFinish = vi.fn();
    const [steps] = make(undefined, onFinish);
    renderUI(<Wizard steps={steps} onFinish={onFinish} />);
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Panel B")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("Panel A")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.click(await screen.findByRole("button", { name: "Finish" }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  });

  it("blocks advancing when validation fails and shows the message", async () => {
    const [steps] = make(() => "Name is required");
    renderUI(<Wizard steps={steps} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Name is required");
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("data-status", "error");
  });

  it("does not finish when the last step fails validation", async () => {
    const onFinish = vi.fn();
    const steps: WizardStep[] = [{ id: "a", label: "Only", content: <p>x</p>, validate: () => false }];
    renderUI(<Wizard steps={steps} onFinish={onFinish} />);
    await userEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Please fix the issues");
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("shows loading during async validation and moves focus to the panel after a step change", async () => {
    let release!: () => void;
    const [steps] = make(() => new Promise<boolean>((r) => (release = () => r(true))));
    renderUI(<Wizard steps={steps} />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("aria-busy", "true");
    await act(async () => release());
    const panel = await screen.findByRole("group", { name: "Second" });
    await waitFor(() => expect(panel).toHaveFocus());
  });

  it("uses translated labels", () => {
    const [steps] = make();
    renderUI(<Wizard steps={steps} labels={{ next: "Siguiente", back: "Atrás", stepOf: (i, n) => `Paso ${i} de ${n}` }} />);
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });
});
