import { renderUI } from "../../../test/utils";
import { DotFieldBackground } from "./dot-field";

vi.mock("../../../vendor/hex-animations/dist/main-page.js", () => ({
  HeroWaves: () => null,
  DotFieldBackground: (props: { dotSpacing?: number }) => <canvas data-testid="dots" data-spacing={props.dotSpacing} />,
}));

describe("DotFieldBackground", () => {
  it("is decorative and forwards dot props", () => {
    const { container, getByTestId } = renderUI(<DotFieldBackground dotSpacing={14} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(getByTestId("dots")).toHaveAttribute("data-spacing", "14");
  });
});
