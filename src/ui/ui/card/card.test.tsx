import { screen } from "@testing-library/react";
import { renderUI } from "../../test/utils";
import { Card, CardBody, CardFooter, CardHeader } from "./card";

describe("Card", () => {
  it("renders header parts, body and footer", () => {
    renderUI(
      <Card>
        <CardHeader title="Title" description="Desc" actions={<button>Act</button>} />
        <CardBody>Body</CardBody>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );
    for (const t of ["Title", "Desc", "Body", "Foot"]) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument();
  });
  it("can be a link with asChild", () => {
    renderUI(<Card asChild interactive><a href="/c">Go</a></Card>);
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
  });
});
