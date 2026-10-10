import { InterviewPrepPage } from "../../../../features/student/interview-prep";
import { expectRole } from "../../../../lib/role-route";

export default async function Page({ params }: { params: Promise<{ role: string }> }) {
  await expectRole(params, "student");
  return <InterviewPrepPage />;
}
