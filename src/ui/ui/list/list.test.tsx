import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { List, ListItem } from "./list";

describe("List", () => {
  it("renders link, button and static rows with trailing actions kept separate", async () => {
    const onClick = vi.fn();
    const onMore = vi.fn();
    renderUI(
      <List aria-label="Items">
        <ListItem title="Link row" href="/a" />
        <ListItem title="Button row" onClick={onClick} trailing={<button onClick={onMore}>More</button>} />
        <ListItem title="Static" />
      </List>,
    );
    expect(screen.getByRole("list", { name: "Items" }).children).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Link row" })).toHaveAttribute("href", "/a");
    await userEvent.click(screen.getByRole("button", { name: "Button row" }));
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onMore).toHaveBeenCalledTimes(1);
  });
  it("announces unread items", () => {
    renderUI(<List><ListItem title="Mail" unread /></List>);
    expect(screen.getByText("Unread:")).toBeInTheDocument();
  });
  it("shows loading rows and the empty slot", () => {
    const { rerender } = renderUI(<List loading loadingRows={2} aria-label="L" />);
    expect(screen.getByRole("list", { name: "L" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("list").children).toHaveLength(2);
    rerender(<List isEmpty empty={<p>Nothing</p>} />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });
  it("marks the selected row", () => {
    renderUI(<List><ListItem title="Cur" href="/c" selected /></List>);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "true");
  });
});
