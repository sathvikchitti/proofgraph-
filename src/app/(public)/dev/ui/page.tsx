import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { Badge } from "../../../../ui/ui/badge";
import { Button } from "../../../../ui/ui/button";
import { Card, CardBody, CardHeader } from "../../../../ui/ui/card";
import { Heading } from "../../../../ui/ui/heading";
import { HexBadge } from "../../../../ui/ui/hex-badge";
import { Input } from "../../../../ui/ui/input";
import { Progress } from "../../../../ui/ui/progress";
import { StatCard } from "../../../../ui/ui/stat-card";
import { Tag } from "../../../../ui/ui/tag";
import { ThemeToggle } from "../../../../ui/ui/theme-toggle";

/** Development only: the build excludes it from production by returning 404. */
export default function DevUi() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto grid max-w-4xl gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <Heading level={1} size="2xl">UI in <em>context</em></Heading>
        <ThemeToggle size="sm" />
      </div>
      <Card>
        <CardHeader><h2 className="text-base font-semibold">Library playground</h2></CardHeader>
        <CardBody className="grid gap-2 text-sm text-fg-muted">
          <p className="m-0">Every element, under every skin, theme and density, lives in the library fork. Run it with:</p>
          <code className="w-fit rounded-chip bg-bg-subtle px-2 py-1 font-mono">cd ../ui-library-hex &amp;&amp; npm run dev</code>
          <p className="m-0">Open the <strong>Hex</strong> page first. This app ships only the hex skin.</p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="text-base font-semibold">The hex skin here</h2></CardHeader>
        <CardBody className="grid gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button data-handles>Primary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button>
            <Badge tone="success">Verified</Badge><Badge tone="warning">Weak</Badge><Badge tone="neutral">Unverified</Badge>
            <Tag>Backend SDE</Tag><HexBadge label="Evidence"><Eye /></HexBadge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2"><Card variant="outline"><CardBody><StatCard label="Honesty" value={78} unit="/ 100" delta={4.2} /></CardBody></Card><div className="grid content-center gap-3"><Input placeholder="Search" aria-label="Search" /><Progress value={64} label="Readiness" /></div></div>
        </CardBody>
      </Card>
    </main>
  );
}
