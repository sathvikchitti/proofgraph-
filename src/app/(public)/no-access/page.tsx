"use client";
import { StatusPage } from "../../../components/status-page";
import { NoAccess } from "../../../components/no-access";
import { useSession } from "../../../lib/queries";

export default function NoAccessPage() {
  const { data } = useSession();
  return <StatusPage><NoAccess role={data?.user.role} /></StatusPage>;
}
