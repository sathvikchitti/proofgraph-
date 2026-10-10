import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithSession } from "../test/render";
import { SignInForm } from "./sign-in-form";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), useSearchParams: () => new URLSearchParams("next=/student/claims") }));
beforeEach(() => replace.mockClear());

describe("SignInForm", () => {
  it("offers GitHub to students and signs in to the page they asked for", async () => {
    renderWithSession(<SignInForm mode="signin" />, null);
    await userEvent.click(screen.getByRole("button", { name: "Sign in with GitHub" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/student/claims"), { timeout: 3000 });
  });

  it("asks other roles for an email and validates it before signing in", async () => {
    renderWithSession(<SignInForm mode="signin" />, null);
    await userEvent.click(screen.getByRole("radio", { name: "College" }));
    expect(screen.queryByRole("button", { name: /GitHub/ })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Email/), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Sign in with email" }));
    expect(await screen.findByText("Enter a valid work or college email.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends new accounts to onboarding", async () => {
    renderWithSession(<SignInForm mode="signup" />, null);
    await userEvent.click(screen.getByRole("button", { name: "Create account with GitHub" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"), { timeout: 3000 });
  });
});
