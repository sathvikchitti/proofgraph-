import { screen } from "@testing-library/react";
import { renderWithSession, sessionFor } from "../test/render";
import { RoleGate } from "./role-gate";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/admin/tenants",
}));
beforeEach(() => replace.mockClear());

describe("RoleGate", () => {
  it("renders children for an allowed role", () => {
    renderWithSession(<RoleGate allow="admin">secret</RoleGate>, sessionFor("admin"));
    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("accepts a list of roles", () => {
    renderWithSession(<RoleGate allow={["college", "admin"]}>shared</RoleGate>, sessionFor("college"));
    expect(screen.getByText("shared")).toBeInTheDocument();
  });

  it("shows the 403 state to another role, with a way back to their own home", () => {
    renderWithSession(<RoleGate allow="admin">secret</RoleGate>, sessionFor("student"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your home" })).toHaveAttribute("href", "/student");
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to login and remembers the page", () => {
    renderWithSession(<RoleGate allow="admin">secret</RoleGate>, null);
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/login?next=%2Fadmin%2Ftenants");
  });

  it("lets the caller replace the 403 state", () => {
    renderWithSession(
      <RoleGate allow="admin" forbidden={(role) => <p>custom for {role}</p>}>secret</RoleGate>,
      sessionFor("company"),
    );
    expect(screen.getByText("custom for company")).toBeInTheDocument();
  });
});
