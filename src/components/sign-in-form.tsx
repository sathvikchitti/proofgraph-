"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitBranch } from "lucide-react";
import { ROLE_SHORT, ROLES, type Role } from "../lib/config";
import { homeHref } from "../lib/nav/nav-config";
import { useSignIn } from "../lib/queries";
import { Alert } from "../ui/ui/alert";
import { Button } from "../ui/ui/button";
import { Field } from "../ui/ui/field";
import { Input } from "../ui/ui/input";
import { SegmentedControl } from "../ui/ui/segmented-control";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_SHORT[r] }));

/** Mock auth: the chosen role becomes the session. Students use GitHub; everyone else uses email. */
export function SignInForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const signIn = useSignIn();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const emailError = touched && !EMAIL.test(email.trim()) ? "Enter a valid work or college email." : undefined;
  const verb = mode === "signin" ? "Sign in" : "Create account";

  const go = (input: { role: Role; method: "github" | "email"; email?: string }) =>
    signIn.mutate(input, { onSuccess: () => router.replace(mode === "signup" ? "/onboarding" : next?.startsWith("/") ? next : homeHref(input.role)) });

  return (
    <div className="grid gap-5">
      <Field label="I am a">
        <SegmentedControl label="Role" value={role} onValueChange={(v) => setRole(v as Role)} options={OPTIONS} fullWidth />
      </Field>
      {signIn.error ? <Alert tone="danger" title="Could not sign in">{signIn.error.message}</Alert> : null}
      {role === "student" ? (
        <div className="grid gap-2">
          <Button size="lg" data-handles loading={signIn.isPending} leading={<GitBranch className="size-4" aria-hidden="true" />} onClick={() => go({ role, method: "github" })}>
            {verb} with GitHub
          </Button>
          <p className="m-0 text-xs text-fg-muted">GitHub proves the account. We read repositories you choose, never passwords.</p>
        </div>
      ) : (
        <form noValidate className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (EMAIL.test(email.trim())) go({ role, method: "email", email }); }}>
          <Field label="Email" error={emailError} required>
            <Input type="email" autoComplete="email" value={email} onValueChange={setEmail} onBlur={() => setTouched(true)} />
          </Field>
          <Button type="submit" size="lg" data-handles loading={signIn.isPending}>{verb} with email</Button>
        </form>
      )}
    </div>
  );
}
