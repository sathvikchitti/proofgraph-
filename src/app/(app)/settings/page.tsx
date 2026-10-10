"use client";
import { useEffect, useState } from "react";
import { Briefcase, Code2, FileText, GitBranch } from "lucide-react";
import { toast } from "sonner";
import type { ConnectedAccount, Settings } from "../../../lib/api";
import { asyncQuery } from "../../../lib/async";
import { useSettings, useUpdateSettings } from "../../../lib/queries";
import { PageHeader } from "../../../ui/layout/page-header";
import { setTheme, useTheme } from "../../../ui/hooks/use-theme";
import { AsyncBoundary } from "../../../ui/ui/async-boundary";
import { Button } from "../../../ui/ui/button";
import { Card, CardBody } from "../../../ui/ui/card";
import { ConnectAccountCard, type ConnectionStatus } from "../../../ui/ui/connect-account-card";
import { Field } from "../../../ui/ui/field";
import { Input } from "../../../ui/ui/input";
import { PermissionMatrix } from "../../../ui/ui/permission-matrix";
import { SegmentedControl } from "../../../ui/ui/segmented-control";
import { Tabs } from "../../../ui/ui/tabs";
import { Textarea } from "../../../ui/ui/textarea";

const PROVIDERS: Record<ConnectedAccount["provider"], { name: string; description: string; icon: typeof GitBranch }> = {
  github: { name: "GitHub", description: "Repositories and commits are the evidence for your skills.", icon: GitBranch },
  linkedin: { name: "LinkedIn", description: "Upload your data export so claims can be compared with evidence.", icon: Briefcase },
  leetcode: { name: "LeetCode", description: "Public stats by username, confirmed with a one-time code in your bio.", icon: Code2 },
  resume: { name: "Resume", description: "A PDF or DOCX that is parsed into claims.", icon: FileText },
};
const STATUS: Record<ConnectedAccount["status"], ConnectionStatus> = { connected: "connected", not_connected: "disconnected", needs_attention: "error" };

function ProfileTab({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const [profile, setProfile] = useState(settings.profile);
  useEffect(() => setProfile(settings.profile), [settings.profile]);
  const dirty = JSON.stringify(profile) !== JSON.stringify(settings.profile);
  const handleError = profile.handle.trim() ? undefined : "Choose a handle for your public Proof Profile.";
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (handleError) return;
        update.mutate({ profile }, { onSuccess: () => toast.success("Profile saved"), onError: (err) => toast.error(err.message) });
      }}
    >
      <Field label="Display name" required><Input value={profile.displayName} onValueChange={(displayName) => setProfile({ ...profile, displayName })} /></Field>
      <Field label="Handle" hint="Used in your public Proof Profile address." error={handleError} required>
        <Input prefix="@" value={profile.handle} onValueChange={(handle) => setProfile({ ...profile, handle })} />
      </Field>
      <Field label="Bio"><Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></Field>
      <div><Button type="submit" disabled={!dirty || Boolean(handleError)} loading={update.isPending}>Save changes</Button></div>
    </form>
  );
}

function AccountsTab({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const set = async (provider: ConnectedAccount["provider"], status: ConnectedAccount["status"]) => {
    await update.mutateAsync({ accounts: settings.accounts.map((a) => (a.provider === provider ? { ...a, status, handle: status === "connected" ? a.handle ?? "demo-account" : undefined } : a)) });
  };
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {settings.accounts.map((a) => {
        const p = PROVIDERS[a.provider];
        return (
          <ConnectAccountCard
            key={a.provider}
            provider={p.name}
            icon={<p.icon className="size-5" aria-hidden="true" />}
            description={p.description}
            status={STATUS[a.status]}
            account={a.handle ? `@${a.handle}` : undefined}
            error={a.status === "needs_attention" ? "Needs attention: reconnect to keep scanning." : undefined}
            onConnect={() => set(a.provider, "connected")}
            onDisconnect={() => set(a.provider, "not_connected")}
          />
        );
      })}
    </div>
  );
}

function AppearanceTab({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const { theme } = useTheme();
  useEffect(() => document.documentElement.setAttribute("data-density", settings.appearance.density), [settings.appearance.density]);
  return (
    <div className="grid max-w-xl gap-6">
      <Field label="Theme" hint="System follows your device.">
        <SegmentedControl label="Theme" value={theme} onValueChange={(v) => { setTheme(v as typeof theme); update.mutate({ appearance: { ...settings.appearance, theme: v as Settings["appearance"]["theme"] } }); }} options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
      </Field>
      <Field label="Density" hint="Compact fits more rows on screen.">
        <SegmentedControl label="Density" value={settings.appearance.density} onValueChange={(v) => update.mutate({ appearance: { ...settings.appearance, density: v as Settings["appearance"]["density"] } })} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
      </Field>
    </div>
  );
}

function PrivacyTab({ settings }: { settings: Settings }) {
  const update = useUpdateSettings();
  const audiences = ["college", "company", "public"] as const;
  const granted = Object.fromEntries(settings.consents.map((c) => [c.audience, c.granted]));
  const setAll = (value: boolean) => update.mutate({ consents: audiences.map((audience) => ({ audience, granted: value })) });
  return (
    <div className="grid gap-3">
      <p className="m-0 max-w-prose text-sm text-fg-muted">Choose who can see your Proof Profile. You can revoke any of these at any time. Finer controls (per concept, per repository) arrive with the privacy page.</p>
      <PermissionMatrix
        audiences={[...audiences]}
        rows={[{ id: "profile", label: "Proof Profile", values: granted }]}
        onChange={(_row, audience, value) => update.mutate({ consents: audiences.map((a) => ({ audience: a, granted: a === audience ? value : Boolean(granted[a]) })) })}
        onRevokeAll={() => setAll(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  const query = useSettings();
  const s = query.data;
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Profile, connected accounts, appearance and privacy." />
      <AsyncBoundary query={asyncQuery(query)}>
        {s ? (
          <Card>
            <CardBody>
              <Tabs
                label="Settings sections"
                keepMounted
                items={[
                  { value: "profile", label: "Profile", content: <ProfileTab settings={s} /> },
                  { value: "accounts", label: "Connected accounts", content: <AccountsTab settings={s} /> },
                  { value: "appearance", label: "Appearance", content: <AppearanceTab settings={s} /> },
                  { value: "privacy", label: "Privacy", content: <PrivacyTab settings={s} /> },
                ]}
              />
            </CardBody>
          </Card>
        ) : null}
      </AsyncBoundary>
    </div>
  );
}
