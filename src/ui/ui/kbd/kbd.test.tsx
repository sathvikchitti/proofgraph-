import { renderUI } from "../../test/utils";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders one key per combo entry", () => {
    const { container } = renderUI(<Kbd keys={["⌘", "K"]} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
  });
  it("renders children as a single key", () => {
    const { container } = renderUI(<Kbd>Esc</Kbd>);
    expect(container.querySelector("kbd")).toHaveTextContent("Esc");
  });
});
