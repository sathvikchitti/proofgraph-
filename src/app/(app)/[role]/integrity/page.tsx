import { IntegrityPage } from "../../../../features/student/integrity";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  await expectRole(params, "student");
  return <IntegrityPage />;
}
