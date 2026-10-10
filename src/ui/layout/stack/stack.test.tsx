import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Container, Grid, Section, Stack } from "./stack";

describe("Stack / Grid / Section / Container", () => {
  it("Stack picks direction and gap classes and can render another tag", () => {
    const { container } = renderUI(<Stack as="ul" direction="row" gap="sm" wrap><li>a</li></Stack>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("UL");
    expect(el).toHaveClass("flex-row", "gap-2", "flex-wrap");
  });
  it("Stack md gap follows the density token", () => {
    const { container } = renderUI(<Stack>x</Stack>);
    expect(container.firstElementChild!.className).toContain("gap-(--gap-stack)");
  });
  it("Grid maps columns to responsive classes or auto-fit", () => {
    const { container, rerender } = renderUI(<Grid columns={4}>x</Grid>);
    expect(container.firstElementChild).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4");
    rerender(<Grid columns={{ base: 2, md: 3 }}>x</Grid>);
    expect(container.firstElementChild).toHaveClass("grid-cols-2", "md:grid-cols-3");
    rerender(<Grid minItemWidth="10rem">x</Grid>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--min-item")).toBe("10rem");
  });
  it("Section renders a heading at the requested level with description and actions", () => {
    renderUI(<Section title="T" headingLevel={3} description="D" actions={<button>Go</button>}>body</Section>);
    expect(screen.getByRole("heading", { level: 3, name: "T" })).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });
  it("Container sets max width and padding", () => {
    const { container } = renderUI(<Container size="sm">x</Container>);
    expect(container.firstElementChild).toHaveClass("max-w-2xl", "px-4");
  });
});
