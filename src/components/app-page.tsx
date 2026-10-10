import type { ReactNode } from "react";
import { ROLE_LABEL, type Role } from "../lib/config";
import { homeHref } from "../lib/nav/nav-config";
import { PageHeader } from "../ui/layout/page-header";

export interface AppPageProps {
  role: Role;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Crumbs between the role home and this page, e.g. Skill graph on a concept page. */
  parents?: { label: string; href: string }[];
  children: ReactNode;
}

/** The frame every feature page shares: breadcrumbs from the role home, the page header, then the content. */
export function AppPage({ role, title, description, meta, actions, parents = [], children }: AppPageProps) {
  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title={title}
        description={description}
        meta={meta}
        actions={actions}
        breadcrumbs={[{ label: ROLE_LABEL[role], href: homeHref(role) }, ...parents, { label: title }]}
      />
      {children}
    </div>
  );
}
