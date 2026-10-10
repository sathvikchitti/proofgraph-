import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("announces loading once", () => {
    renderUI(<Skeleton lines={3} label="Loading profile" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading profile");
    expect(document.querySelectorAll("[aria-hidden]")).toHaveLength(3);
  });
});
