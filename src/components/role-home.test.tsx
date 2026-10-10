import { screen } from "@testing-library/react";
import { renderWithSession, sessionFor } from "../test/render";
import { RoleHome } from "./role-home";

const signedInAs = (role: "student" | "college" | "company" | "admin") =>
  localStorage.setItem("pg.mock.session", JSON.stringify(sessionFor(role)));
afterEach(() => localStorage.clear());

describe("RoleHome", () => {
  it("shows a loading state, then the KPI row, next steps and activity", async () => {
    signedInAs("student");
    renderWithSession(<RoleHome role="student" />, sessionFor("student"));
    expect(screen.getAllByText("Loading").length).toBeGreaterThan(0);
    expect(await screen.findByText("Honesty", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("Readiness")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What’s next" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Recent activity" })).toBeInTheDocument();
  });

  it.each(["college", "company", "admin"] as const)("%s home renders its own numbers", async (role) => {
    signedInAs(role);
    renderWithSession(<RoleHome role={role} />, sessionFor(role));
    expect(await screen.findByRole("heading", { name: "Recent activity" }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What’s next" })).toBeInTheDocument();
  });
});

describe("RoleHome failure", () => {
  it("shows an error with a retry when the session is gone", async () => {
    renderWithSession(<RoleHome role="student" />, sessionFor("student"));
    expect(await screen.findByRole("button", { name: "Try again" }, { timeout: 3000 })).toBeInTheDocument();
  });
});
