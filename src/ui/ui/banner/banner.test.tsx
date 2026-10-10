import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Banner } from "./banner";

describe("Banner", () => {
  it("dismisses itself when uncontrolled", async () => {
    const onOpenChange = vi.fn();
    renderUI(<Banner dismissible onOpenChange={onOpenChange}>Demo mode</Banner>);
    expect(screen.getByRole("region", { name: "Notice" })).toHaveTextContent("Demo mode");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Demo mode")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
  it("stays visible when controlled open", async () => {
    renderUI(<Banner open dismissible>Pinned</Banner>);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.getByText("Pinned")).toBeInTheDocument();
  });
  it("renders the action slot", () => {
    renderUI(<Banner action={<a href="/x">Learn more</a>}>Hi</Banner>);
    expect(screen.getByRole("link", { name: "Learn more" })).toBeInTheDocument();
  });
});
