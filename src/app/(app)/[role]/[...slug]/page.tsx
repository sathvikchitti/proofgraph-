import { notFound } from "next/navigation";
import { ComingSoon } from "../../../../components/coming-soon";
import { isRole, ROLES } from "../../../../lib/config";
import { BUILT_PAGES, findNavEntry, navEntries } from "../../../../lib/nav/nav-config";

/** Only the pages in the nav config exist; any other slug is a real 404 (status included), not a soft one. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ROLES.flatMap((role) =>
    navEntries(role)
      .filter((e) => e.href.startsWith(`/${role}/`) && !BUILT_PAGES.has(e.href))
      .map((e) => ({ role, slug: e.href.slice(role.length + 2).split("/") })),
  );
}

/** Every planned page for a role resolves here until it gets its own route; unknown slugs are real 404s. */
export default async function PlannedPage({ params }: { params: Promise<{ role: string; slug: string[] }> }) {
  const { role, slug } = await params;
  if (!isRole(role)) notFound();
  const entry = findNavEntry(role, slug);
  if (!entry) notFound();
  return <ComingSoon role={role} title={entry.label} description={entry.description} />;
}
