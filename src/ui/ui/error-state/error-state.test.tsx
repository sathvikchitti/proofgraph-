import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("is an alert that explains a {detail} API error with its status", () => {
    renderUI(<ErrorState error={{ status: 403, detail: "No access" }} title="Denied" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Denied");
    expect(alert).toHaveTextContent("No access");
    expect(alert).toHaveTextContent("403");
  });
  it("retries", async () => {
    const onRetry = vi.fn();
    renderUI(<ErrorState onRetry={onRetry} retryLabel="Again" />);
    await userEvent.click(screen.getByRole("button", { name: "Again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  it("disables retry while retrying", () => {
    renderUI(<ErrorState onRetry={() => {}} retrying />);
    expect(screen.getByRole("button", { name: /Try again/ })).toBeDisabled();
  });
  it("can show technical detail", () => {
    renderUI(<ErrorState showDetail error={Object.assign(new Error("bad json"), { name: "SyntaxError" })} />);
    expect(screen.getByText("SyntaxError")).toBeInTheDocument();
  });
});
