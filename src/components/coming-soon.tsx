import Link from "next/link";
import { Hourglass } from "lucide-react";
import { ROLE_LABEL, type Role } from "../lib/config";
import { homeHref } from "../lib/nav/nav-config";
import { PageHeader } from "../ui/layout/page-header";
import { Badge } from "../ui/ui/badge";
import { Button } from "../ui/ui/button";
import { Card } from "../ui/ui/card";
import { EmptyState } from "../ui/ui/empty-state";

export interface ComingSoonProps {
  /** The feature's name, as it appears in the sidebar. */
  title: string;
  /** What the page will show once the backend is final. */
  description: string;
  role?: Role;
}

/** The shared placeholder for every planned page. Building the real page replaces it; the navigation does not change. */
export function ComingSoon({ title, description, role }: ComingSoonProps) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title={title}
        meta={<Badge tone="info">Planned</Badge>}
        breadcrumbs={role ? [{ label: ROLE_LABEL[role], href: homeHref(role) }, { label: title }] : undefined}
      />
      <Card variant="outline">
        <EmptyState
          icon={<Hourglass aria-hidden="true" />}
          title="Coming soon"
          description={`${title} will show: ${description}`}
          action={
            role ? (
              <Button asChild variant="outline">
                <Link href={homeHref(role)}>Back to home</Link>
              </Button>
            ) : null
          }
        />
      </Card>
    </div>
  );
}
