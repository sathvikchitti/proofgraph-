import { notFound } from "next/navigation";
import type { Role } from "./config";

/** For pages that exist for one role only: any other role segment is a real 404 (the [role] layout already gates access). */
export async function expectRole<P extends { role: string }>(params: Promise<P>, role: Role): Promise<P> {
  const p = await params;
  if (p.role !== role) notFound();
  return p;
}
