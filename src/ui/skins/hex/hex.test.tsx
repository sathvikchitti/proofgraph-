import { render, screen } from "@testing-library/react";
import { SkinProvider } from "../../lib/skin";
import { Button } from "../../ui/button";
import { hexSkin } from ".";
import { defaultSkin } from "../default";

describe("hex skin", () => {
  it("only overrides recipes that exist in the default skin", () => {
    for (const name of Object.keys(hexSkin)) expect(defaultSkin).toHaveProperty(name);
  });

  it("restyles an element through its recipe without a prop change", () => {
    const { rerender } = render(<Button>Go</Button>);
    expect(screen.getByRole("button").className).not.toContain("--cta-bg");
    rerender(
      <SkinProvider skin={hexSkin}>
        <Button>Go</Button>
      </SkinProvider>,
    );
    expect(screen.getByRole("button").className).toContain("--cta-bg");
  });
});
