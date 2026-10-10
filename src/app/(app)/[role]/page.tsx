import { notFound } from "next/navigation";
import { RoleHome } from "../../../components/role-home";
import { StudentHome } from "../../../features/student/student-home";
import { isRole } from "../../../lib/config";

export default async function RoleHomePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isRole(role)) notFound();
  // The student home reads the Validater backend (headline, scores, score events); the other roles use the summary template.
  return role === "student" ? <StudentHome /> : <RoleHome role={role} />;
}
