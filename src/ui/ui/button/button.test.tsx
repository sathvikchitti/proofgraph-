import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { Button, ButtonGroup, IconButton } from "./button";

describe("Button", () => {
  it("fires onClick and defaults to type=button", async () => {
    const onClick = vi.fn();
    renderUI(<Button onClick={onClick}>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is activated by keyboard", async () => {
    const onClick = vi.fn();
    renderUI(<Button onClick={onClick}>Go</Button>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("blocks clicks and announces busy while loading", async () => {
    const onClick = vi.fn();
    renderUI(<Button loading onClick={onClick}>Saving</Button>);
    const btn = screen.getByRole("button", { name: /Saving/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes tone as a scope attribute (accent by default)", () => {
    renderUI(
      <>
        <Button>A</Button>
        <Button tone="danger">B</Button>
      </>,
    );
    expect(screen.getByText("A")).toHaveAttribute("data-tone", "accent");
    expect(screen.getByText("B")).toHaveAttribute("data-tone", "danger");
  });

  it("renders as its child with asChild", () => {
    renderUI(<Button asChild><a href="/x">Link</a></Button>);
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("href", "/x");
  });

  it("IconButton uses label as its accessible name", () => {
    renderUI(<IconButton label="Settings"><svg /></IconButton>);
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("ButtonGroup is a labelled group", () => {
    renderUI(<ButtonGroup aria-label="View"><Button>A</Button><Button>B</Button></ButtonGroup>);
    expect(screen.getByRole("group", { name: "View" })).toBeInTheDocument();
  });
});
