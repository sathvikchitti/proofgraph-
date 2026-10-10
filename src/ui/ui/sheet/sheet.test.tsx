import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Sheet } from "./sheet";

describe("Sheet", () => {
  it("opens, names itself, and closes on Escape", async () => {
    renderUI(<Sheet trigger={<button>Open</button>} side="left" title="Filters" description="Narrow results">Body</Sheet>);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
  it("renders the footer slot and the close button", async () => {
    renderUI(<Sheet defaultOpen title="T" footer={<button>Apply</button>}>x</Sheet>);
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
