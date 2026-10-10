import Link from "next/link";
import { Building2, Eye, FileSearch, GraduationCap, ListChecks, Mic, Search } from "lucide-react";
import { PRODUCT_NAME } from "../../lib/config";
import { GlassPillNav, HeroWaves, StaggeredText } from "../../ui/blocks/motion";
import { Button } from "../../ui/ui/button";
import { Card, CardBody } from "../../ui/ui/card";
import { DisplayHeading } from "../../ui/ui/display-heading";
import { GuideLine, PageFrame } from "../../ui/ui/page-frame";
import { Heading } from "../../ui/ui/heading";
import { HexBadge } from "../../ui/ui/hex-badge";
import { LabelTab } from "../../ui/ui/label-tab";
import { ThemeToggle } from "../../ui/ui/theme-toggle";

const STEPS = [
  { icon: ListChecks, title: "Claims", body: "We read the skills a student states on LinkedIn and the resume, and map each to one of eight core concepts." },
  { icon: FileSearch, title: "Evidence", body: "Fixed, versioned rules find the commit, file and line in the student’s own code that shows each concept." },
  { icon: Mic, title: "Viva", body: "A timed quiz on the student’s own code is the gate. Code alone is Weak; code plus a passed viva is Verified." },
];

const AUDIENCES = [
  { icon: GraduationCap, name: "Students", body: "See the gap, prove the skill, watch the score move. Share a Proof Profile instead of an unverifiable resume line." },
  { icon: Building2, name: "Colleges", body: "Batch readiness by department, curriculum gaps and integrity checks, with an on-prem option." },
  { icon: Search, name: "Recruiters", body: "Search by verified concepts and open the evidence behind every skill, with the student’s consent." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <PageFrame as="main" className="pb-0">
        <header id="platform" className="relative h-20">
          <GlassPillNav
            logo={<Eye className="size-6" aria-hidden="true" />}
            logoAlt={PRODUCT_NAME}
            activeHref="#platform"
            items={[{ label: "How it works", href: "#how" }, { label: "Who it is for", href: "#audiences" }, { label: "Sign in", href: "/login" }]}
          />
        </header>

        <section className="relative isolate overflow-hidden pb-28 pt-12 sm:pt-20">
          <HeroWaves className="-z-10 [mask-image:linear-gradient(to_bottom,transparent_25%,black_85%)]" />
          <div className="grid gap-6">
            <DisplayHeading as="h1" size="lg">Proof, <em>not</em> claims</DisplayHeading>
            <StaggeredText as="p" className="max-w-xl text-lg text-fg-muted" segmentBy="words" delay={40} direction="bottom" text="Every skill on a student’s profile links to the code that shows it and the quiz that confirms it." />
            <div className="flex flex-wrap items-center gap-6">
              <Button asChild size="lg" data-handles><Link href="/login">Get started free</Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#how">See how it works</a></Button>
            </div>
          </div>
        </section>
        <GuideLine dashed />

        <section className="grid gap-8 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-labelledby="problem">
          <div className="grid content-start gap-4">
            <div><LabelTab>The problem</LabelTab></div>
            <Heading level={2} size="xl" id="problem">A resume is <em>self-reported</em></Heading>
          </div>
          <div className="grid gap-4 text-fg-muted">
            <p className="m-0 text-lg">Students without networks cannot prove what they know. Recruiters cannot verify a resume, and students cannot see their own gaps.</p>
            <p className="m-0 text-lg">Skilled students get ignored. Unskilled ones bluff through. {PRODUCT_NAME} replaces the claim with the evidence.</p>
          </div>
        </section>
        <GuideLine />

        <section id="how" className="py-14" aria-labelledby="how-title">
          <Heading level={2} size="xl" id="how-title" className="mb-8">From claims to evidence to <em>viva</em></Heading>
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <Card className="h-full">
                  <CardBody className="grid content-start gap-3">
                    <HexBadge size="md" label={`Step ${i + 1}`}><s.icon /></HexBadge>
                    <h3 className="m-0 font-(family-name:--font-display) text-lg font-semibold tracking-[-0.02em] [font-stretch:112%]">{s.title}</h3>
                    <p className="m-0 text-sm text-fg-muted">{s.body}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl text-sm text-fg-muted">The model never decides the score. It can phrase claims and questions; fixed rules compute every number, so the same code always gets the same result.</p>
        </section>
        <GuideLine />

        <section id="audiences" className="py-14" aria-labelledby="aud-title">
          <Heading level={2} size="xl" id="aud-title" className="mb-8">One platform, three <em>audiences</em></Heading>
          <div className="grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <Card key={a.name} className="h-full">
                <CardBody className="grid content-start gap-3">
                  <a.icon className="size-5 text-accent-fg" aria-hidden="true" />
                  <h3 className="m-0 text-base font-semibold">{a.name}</h3>
                  <p className="m-0 text-sm text-fg-muted">{a.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        <section className="relative my-10 overflow-hidden rounded-card border border-border bg-bg-raised px-6 py-14 text-center">
          <div className="relative mx-auto grid max-w-xl justify-items-center gap-5">
            <DisplayHeading size="sm">Show what you can <em>prove</em></DisplayHeading>
            <p className="m-0 text-fg-muted">Connect GitHub, see your Honesty and Readiness scores, and close one gap at a time.</p>
            <Button asChild size="lg" data-handles><Link href="/login">Create your Proof Profile</Link></Button>
          </div>
        </section>
        <GuideLine />
        <footer className="flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-fg-muted">
          <span>© {new Date().getFullYear()} {PRODUCT_NAME}</span>
          <ThemeToggle size="sm" />
        </footer>
      </PageFrame>
    </div>
  );
}
