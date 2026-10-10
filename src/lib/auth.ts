"use client";
/** Session access for client components that need a signed-in user. */
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "./api";
import { useSession } from "./queries";

/** Set by an explicit sign-out so the redirect to /login does not carry a `next` back to a page the user chose to leave. */
let signingOut = false;
export function markSigningOut() {
  signingOut = true;
}

export type RequiredSession = { status: "loading" } | { status: "ready"; user: User };

/** Returns the signed-in user, or sends a signed-out visitor to /login (remembering where they were going). */
export function useRequireSession(): RequiredSession {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const signedOut = !isPending && !session;

  useEffect(() => {
    if (!signedOut) return;
    if (signingOut) {
      signingOut = false;
      router.replace("/login");
    } else {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [signedOut, router, pathname]);

  return session ? { status: "ready", user: session.user } : { status: "loading" };
}
