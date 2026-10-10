"use client";
import { Suspense } from "react";
import { PRODUCT_NAME } from "../../../lib/config";
import { SignInForm } from "../../../components/sign-in-form";
import { DotFieldBackground } from "../../../ui/blocks/motion";
import { AuthCard } from "../../../ui/ui/auth-card";
import { Tabs } from "../../../ui/ui/tabs";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      <DotFieldBackground />
      <div className="relative w-full max-w-md">
        <AuthCard title={<>Welcome to <em>{PRODUCT_NAME}</em></>} description="Proof, not claims. Sign in or create an account.">
          <Suspense>
            <Tabs
              label="Account"
              items={[
                { value: "signin", label: "Sign in", content: <div className="pt-1"><SignInForm mode="signin" /></div> },
                { value: "signup", label: "Create account", content: <div className="pt-1"><SignInForm mode="signup" /></div> },
              ]}
            />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}
