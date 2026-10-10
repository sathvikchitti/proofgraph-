import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("appears on keyboard focus and describes the trigger", async () => {
    renderUI(<Tooltip content="Save changes" shortcut={["⌘", "S"]}><button>Save</button></Tooltip>);
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Save changes");
    expect(tip).toHaveTextContent("⌘");
  });
  it("appears on hover and hides on Escape", async () => {
    renderUI(<Tooltip content="Hint" delayDuration={0}><button>Hover</button></Tooltip>);
    await userEvent.hover(screen.getByRole("button"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Hint");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
  it("renders just the child when disabled", async () => {
    renderUI(<Tooltip content="x" disabled><button>Plain</button></Tooltip>);
    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
