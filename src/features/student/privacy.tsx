"use client";
import Link from "next/link";
import { toast } from "sonner";
import { AppPage } from "../../components/app-page";
import type { Privacy } from "../../lib/api";
import { asyncQuery } from "../../lib/async";
import { useProduct, useSaveProduct, useSettings, useWorkspace } from "../../lib/queries";
import { Alert } from "../../ui/ui/alert";
import { AsyncBoundary } from "../../ui/ui/async-boundary";
import { Button } from "../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../ui/ui/card";
import { DescriptionList } from "../../ui/ui/description-list";
import { PermissionMatrix } from "../../ui/ui/permission-matrix";
import { Tabs } from "../../ui/ui/tabs";

const AUDIENCES = ["college", "company", "public"] as const;
const KIND_LABEL: Record<Privacy["rows"][number]["kind"], string> = { profile: "Profile", concept: "Concepts", repository: "Repositories" };

export function PrivacyPage() {
  const privacy = useProduct("privacy");
  const save = useSaveProduct("privacy");
  const settings = useSettings();
  const workspace = useWorkspace();
  const data = privacy.data;
  const handle = settings.data?.profile.handle;

  const update = (rows: Privacy["rows"]) => save.mutate({ rows }, { onError: (e) => toast.error(e.message) });
  const set = (rowId: string, audience: string, value: boolean) => data && update(data.rows.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [audience]: value } } : r)));
  const revokeAll = () => data && update(data.rows.map((r) => ({ ...r, values: { college: false, company: false, public: false } })));
  const publicOn = data?.rows.find((r) => r.id === "profile")?.values.public;

  return (
    <AppPage role="student" title="Privacy and consent" description="Who can see what. Every switch is revocable at any time and every view is logged.">
      <AsyncBoundary query={asyncQuery(privacy)}>
        {data ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <Card>
              <CardBody>
                <Tabs
                  label="Consent by kind"
                  items={(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((kind) => {
                    const rows = data.rows.filter((r) => r.kind === kind);
                    return {
                      value: kind,
                      label: KIND_LABEL[kind],
                      count: rows.length,
                      content: (
                        <PermissionMatrix
                          audiences={[...AUDIENCES]}
                          rows={rows.map((r) => ({ id: r.id, label: r.label, values: r.values }))}
                          onChange={set}
                          onRevokeAll={kind === "profile" ? revokeAll : undefined}
                          revokeAllLabel="Revoke everything"
                        />
                      ),
                    };
                  })}
                />
              </CardBody>
            </Card>
            <div className="grid gap-6">
              <Card>
                <CardHeader title={<h2 className="text-base font-semibold">Public Proof Profile</h2>} />
                <CardBody className="grid gap-3">
                  {publicOn ? (
                    <Alert tone="success">Anyone with the link can see your scores and badges. Code stays hidden unless a repository allows it.</Alert>
                  ) : (
                    <Alert tone="neutral">Your profile is private. Turn on “public” for the Proof Profile row to share it.</Alert>
                  )}
                  {handle ? (
                    <Button asChild variant="outline"><Link href={`/p/${handle}`}>Preview /p/{handle}</Link></Button>
                  ) : null}
                </CardBody>
              </Card>
              <Card variant="sunken">
                <CardBody>
                  <DescriptionList
                    items={[
                      { label: "Stored", value: "Scores, evidence locators and commit SHAs. Source code stays in your repository's local mirror." },
                      { label: "GitHub token", value: "Encrypted at rest; never returned to the browser." },
                      { label: "Repositories connected", value: workspace.data?.repositories.length ?? 0 },
                    ]}
                    layout="stacked"
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </AppPage>
  );
}
