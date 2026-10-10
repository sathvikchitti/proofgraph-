import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { ChartCard } from "./chart-card";

const data = { caption: "Scores", columns: [{ key: "d", label: "Day" }, { key: "v", label: "Value", align: "right" as const, format: (x: unknown) => `${x} pts` }], rows: [{ d: "Mon", v: 5 }, { d: "Tue", v: 7 }] };

describe("ChartCard", () => {
  it("shows title, description, content and footer", () => {
    renderUI(<ChartCard title="Honesty" description="Average" footer="Updates daily"><p>chart here</p></ChartCard>);
    expect(screen.getByRole("heading", { name: "Honesty" })).toBeInTheDocument();
    for (const t of ["Average", "chart here", "Updates daily"]) expect(screen.getByText(t)).toBeInTheDocument();
  });
  it("switches periods (uncontrolled) and reports them", async () => {
    const onPeriodChange = vi.fn();
    renderUI(<ChartCard title="T" periods={[{ value: "7d", label: "7d" }, { value: "30d", label: "30d" }]} onPeriodChange={onPeriodChange}>c</ChartCard>);
    expect(screen.getByRole("radio", { name: "7d" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "30d" }));
    expect(onPeriodChange).toHaveBeenCalledWith("30d");
  });
  it("toggles to an accessible data table and back", async () => {
    renderUI(<ChartCard title="T" data={data}><p>the chart</p></ChartCard>);
    const toggle = screen.getByRole("button", { name: "View data as table" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    const table = screen.getByRole("table", { name: "Scores" });
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Day", "Value"]);
    expect(within(table).getByText("7 pts")).toBeInTheDocument();
    expect(screen.queryByText("the chart")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "View chart" }));
    expect(screen.getByText("the chart")).toBeInTheDocument();
  });
  it("has no table toggle without data", () => {
    renderUI(<ChartCard title="T">c</ChartCard>);
    expect(screen.queryByRole("button", { name: /table/ })).toBeNull();
  });
  it("renders loading, empty and error states", async () => {
    const onRetry = vi.fn();
    const { rerender } = renderUI(<ChartCard title="T" loading>c</ChartCard>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading chart");
    rerender(<ChartCard title="T" isEmpty emptyLabel="No scans">c</ChartCard>);
    expect(screen.getByText("No scans")).toBeInTheDocument();
    rerender(<ChartCard title="T" error={{ detail: "Down" }} onRetry={onRetry}>c</ChartCard>);
    expect(screen.getByRole("alert")).toHaveTextContent("Down");
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(onRetry).toHaveBeenCalled();
  });
});
