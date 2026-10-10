import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { AreaChart } from "../area-chart";
import { BarChart } from "../bar-chart";
import { Donut, RadialProgress } from "../donut";
import { LineChart } from "./line-chart";

const data = [{ m: "Jan", a: 1, b: 3 }, { m: "Feb", a: 4, b: 2 }, { m: "Mar", a: 3, b: 5 }];
const series = [{ key: "a", label: "Alpha" }, { key: "b", label: "Beta", tone: "danger" as const }];
const common = { data, xKey: "m", series, width: 420, height: 220 };

describe("LineChart / AreaChart / BarChart", () => {
  it("LineChart draws one line per series with token colors and a legend", () => {
    const { container } = renderUI(<LineChart {...common} label="Lines" />);
    expect(screen.getByRole("img", { name: "Lines" })).toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-line")).toHaveLength(2);
    const strokes = Array.from(container.querySelectorAll(".recharts-line-curve")).map((p) => p.getAttribute("stroke"));
    expect(strokes).toEqual(["var(--series-1)", "var(--danger)"]);
    expect(screen.getByRole("list", { name: "Legend" })).toHaveTextContent("Alpha");
    expect(screen.getByRole("list", { name: "Legend" })).toHaveTextContent("Beta");
  });
  it("LineChart draws threshold reference lines and hides the legend for one series", () => {
    const { container } = renderUI(<LineChart {...common} series={[series[0]!]} thresholds={[{ value: 3, label: "Cap" }]} label="One" />);
    expect(container.querySelectorAll(".recharts-reference-line")).toHaveLength(1);
    expect(screen.queryByRole("list", { name: "Legend" })).toBeNull();
  });
  it("shows the empty state when there is no data", () => {
    renderUI(<LineChart {...common} data={[]} label="Empty" emptyLabel="No scans" />);
    expect(screen.getByText("No scans")).toBeInTheDocument();
  });
  it("AreaChart draws areas, stacked on request", () => {
    const { container, rerender } = renderUI(<AreaChart {...common} label="Areas" />);
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2);
    rerender(<AreaChart {...common} label="Areas" stacked />);
    expect(container.querySelectorAll(".recharts-area")).toHaveLength(2);
  });
  it("BarChart draws bars for each datum and series, and supports horizontal", () => {
    const { container, rerender } = renderUI(<BarChart {...common} label="Bars" />);
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(6);
    rerender(<BarChart {...common} label="Bars" orientation="horizontal" stacked />);
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(6);
  });
});

describe("Donut / RadialProgress", () => {
  const slices = [{ name: "Verified", value: 14, tone: "success" as const }, { name: "Weak", value: 5, tone: "warning" as const }];
  it("draws a sector per datum with a center value and legend", () => {
    const { container } = renderUI(<Donut label="Claims" width={220} size={220} data={slices} centerValue={19} centerCaption="claims" />);
    expect(container.querySelectorAll(".recharts-pie-sector")).toHaveLength(2);
    expect(screen.getByText("19")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Legend" })).toHaveTextContent("Verified");
  });
  it("treats all-zero data as empty", () => {
    renderUI(<Donut label="Claims" data={[{ name: "A", value: 0 }]} />);
    expect(screen.getByText("No data for this period.")).toBeInTheDocument();
  });
  it("RadialProgress is a radial Meter", () => {
    renderUI(<RadialProgress value={72} label="Quota" />);
    expect(screen.getByRole("meter", { name: "Quota" })).toHaveAttribute("aria-valuenow", "72");
  });
});
