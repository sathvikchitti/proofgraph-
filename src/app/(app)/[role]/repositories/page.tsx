import { RepositoriesPage } from "../../../../features/student/repositories";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  await expectRole(params, "student");
  return <RepositoriesPage />;
}
