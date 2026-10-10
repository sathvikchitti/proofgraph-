import { renderUI } from "../../../test/utils";
import { GlassPillNav } from "./glass-pill-nav";

describe("GlassPillNav", () => {
  it("renders its links and marks the active one", () => {
    const { container } = renderUI(
      <GlassPillNav
        logoAlt="ProofGraph"
        items={[{ label: "Platform", href: "#platform" }, { label: "Pricing", href: "#pricing" }]}
        activeHref="#platform"
      />,
    );
    expect(container.querySelector('a[href="#pricing"]')).not.toBeNull();
    expect(container.querySelector('a[aria-current="page"]')).toHaveAttribute("href", "#platform");
  });
});
