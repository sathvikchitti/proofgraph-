import { ScanDetailPage } from "../../../../../features/student/scan-detail";
import { expectRole } from "../../../../../lib/role-route";

/** Scan ids are only known at runtime. */
export const dynamicParams = true;

export default async function Page({ params, searchParams }: { params: Promise<{ role: string; scanId: string }>; searchParams: Promise<{ live?: string }> }) {
  const { scanId } = await expectRole(params, "student");
  const { live } = await searchParams;
  return <ScanDetailPage scanId={decodeURIComponent(scanId)} replay={live === "1"} />;
}
