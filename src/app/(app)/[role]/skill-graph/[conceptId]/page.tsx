import { ConceptDetailPage } from "../../../../../features/student/concept-detail";
import { CONCEPT_IDS } from "../../../../../lib/domain/concepts";
import { expectRole } from "../../../../../lib/role-route";

/** The eight known concepts are prerendered; concepts the backend adds later render on demand. */
export const dynamicParams = true;

export function generateStaticParams() {
  return CONCEPT_IDS.map((conceptId) => ({ conceptId }));
}

export default async function Page({ params }: { params: Promise<{ role: string; conceptId: string }> }) {
  const { conceptId } = await expectRole(params, "student");
  return <ConceptDetailPage conceptId={decodeURIComponent(conceptId)} />;
}
