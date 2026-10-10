import { screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { renderUI } from "../../test/utils";
import { Icon } from "./icon";

describe("Icon", () => {
  it("is labelled as an image when a label is given", () => {
    renderUI(<Icon icon={Check} label="Verified" tone="success" />);
    expect(screen.getByRole("img", { name: "Verified" })).toHaveAttribute("data-tone", "success");
  });
  it("is decorative by default", () => {
    const { container } = renderUI(<Icon icon={Check} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
