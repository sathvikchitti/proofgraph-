"use client";
import type { ReactNode } from "react";
import { Spinner } from "../ui/ui/spinner";
import { useRequireSession } from "../lib/auth";
import type { Role } from "../lib/config";
import { NoAccess } from "./no-access";

export interface RoleGateProps {
  allow: Role | readonly Role[];
  children: ReactNode;
  /** Shown to a signed-in user with another role. Defaults to the 403 state. */
  forbidden?: (role: Role) => ReactNode;
}

/** Renders children only for the allowed roles. Signed-out visitors go to /login; other roles see the 403 state. */
export function RoleGate({ allow, children, forbidden }: RoleGateProps) {
  const session = useRequireSession();
  if (session.status === "loading") {
    return (
      <div className="grid min-h-48 place-items-center">
        <Spinner label="Loading" />
      </div>
    );
  }
  const allowed = Array.isArray(allow) ? (allow as readonly Role[]) : [allow as Role];
  if (!allowed.includes(session.user.role)) return <>{forbidden ? forbidden(session.user.role) : <NoAccess role={session.user.role} />}</>;
  return <>{children}</>;
}
