import { ResumeStudioPage } from "../../../../features/student/resume-studio";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  await expectRole(params, "student");
  return <ResumeStudioPage />;
}
