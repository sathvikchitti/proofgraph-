import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { RoleGate } from "../../../components/role-gate";
import { isRole, ROLES } from "../../../lib/config";

/** Only the four role segments exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ROLES.map((role) => ({ role }));
}

export default async function RoleLayout({ children, params }: { children: ReactNode; params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isRole(role)) notFound();
  return <RoleGate allow={role}>{children}</RoleGate>;
}
