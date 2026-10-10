import { ScansPage } from "../../../../features/student/scans";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  await expectRole(params, "student");
  return <ScansPage />;
}
