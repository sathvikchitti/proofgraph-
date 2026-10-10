import { MissionsPage } from "../../../../features/student/missions";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params, searchParams }: { params: Promise<{ role: string }>; searchParams: Promise<{ concept?: string }> }) {
  await expectRole(params, "student");
  const { concept } = await searchParams;
  return <MissionsPage concept={concept} />;
}
