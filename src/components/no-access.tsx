"use client";
import Link from "next/link";
import { ROLE_LABEL, type Role } from "../lib/config";
import { homeHref } from "../lib/nav/nav-config";
import { Button } from "../ui/ui/button";
import { ErrorPage } from "../ui/ui/error-page";

/** The 403 state: shown by RoleGate, and reusable as a page. */
export function NoAccess({ role }: { role?: Role }) {
  return (
    <ErrorPage
      code="403"
      title="No access"
      description={role ? `Your ${ROLE_LABEL[role]} workspace cannot open this page.` : "You do not have access to this page."}
      actions={
        role ? (
          <Button asChild variant="outline">
            <Link href={homeHref(role)}>Back to your home</Link>
          </Button>
        ) : null
      }
    />
  );
}
