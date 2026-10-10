import { act, waitFor } from "@testing-library/react";
import { renderUI } from "../../../test/utils";
import { HeroWaves } from "./hero-waves";

let mounts = 0;
vi.mock("../../../vendor/hex-animations/dist/main-page.js", async () => {
  const React = await import("react");
  return {
    HeroWaves: (props: { speed?: number }) => {
      React.useEffect(() => { mounts += 1; }, []);
      return <canvas data-testid="waves" data-speed={props.speed} />;
    },
    DotFieldBackground: () => null,
  };
});

describe("HeroWaves", () => {
  it("is decorative, fills its parent and forwards wave props", () => {
    const { container, getByTestId } = renderUI(<HeroWaves className="extra" speed={0.2} />);
    const wrap = container.firstElementChild as HTMLElement;
    expect(wrap).toHaveAttribute("aria-hidden", "true");
    expect(wrap).toHaveClass("absolute", "inset-0", "extra");
    expect(getByTestId("waves")).toHaveAttribute("data-speed", "0.2");
  });
  it("remounts when the skin changes so colour tokens are re-read", async () => {
    mounts = 0;
    renderUI(<HeroWaves />);
    expect(mounts).toBe(1);
    act(() => document.documentElement.setAttribute("data-skin", "hex"));
    await waitFor(() => expect(mounts).toBe(2));
    document.documentElement.removeAttribute("data-skin");
  });
});
