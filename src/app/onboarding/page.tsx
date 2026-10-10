"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Code2, GitBranch } from "lucide-react";
import { useRequireSession } from "../../lib/auth";
import { PRODUCT_NAME, ROLE_SHORT, ROLES, type Role } from "../../lib/config";
import { homeHref } from "../../lib/nav/nav-config";
import { useSwitchRole } from "../../lib/queries";
import { AnimatedCheckbox, ThoughtLine } from "../../ui/blocks/motion";
import { Button } from "../../ui/ui/button";
import { ConnectAccountCard, type ConnectionStatus } from "../../ui/ui/connect-account-card";
import { DisplayHeading } from "../../ui/ui/display-heading";
import { Field } from "../../ui/ui/field";
import { FileDropzone, type UploadItem } from "../../ui/ui/file-dropzone";
import { PageFrame } from "../../ui/ui/page-frame";
import { SegmentedControl } from "../../ui/ui/segmented-control";
import { Select } from "../../ui/ui/select";
import { Spinner } from "../../ui/ui/spinner";
import { Wizard } from "../../ui/ui/stepper";

const TARGETS = [
  { value: "backend", label: "Backend SDE" },
  { value: "fullstack", label: "Full-stack engineer" },
];
const ANALYSIS_STEPS = ["Reading your file", "Extracting claims", "Matching claims to concepts"];

type AccountKey = "github" | "linkedin" | "leetcode";
const ACCOUNTS: { key: AccountKey; name: string; description: string; icon: typeof GitBranch; account: string }[] = [
  { key: "github", name: "GitHub", description: "Your repositories are the evidence.", icon: GitBranch, account: "@priya-g" },
  { key: "linkedin", name: "LinkedIn", description: "Optional: your data export lists claimed skills.", icon: Briefcase, account: "@priya-gupta" },
  { key: "leetcode", name: "LeetCode", description: "Optional: public stats by username.", icon: Code2, account: "@priya_lc" },
];

/** Runs a mock analysis for a few seconds after a file is added: the ThoughtLine shows steps, then settles. */
function Analysis({ run }: { run: number }) {
  const [steps, setSteps] = useState([ANALYSIS_STEPS[0]!]);
  const [working, setWorking] = useState(true);
  useEffect(() => {
    setSteps([ANALYSIS_STEPS[0]!]);
    setWorking(true);
    const ids = [setTimeout(() => setSteps(ANALYSIS_STEPS.slice(0, 2)), 1200), setTimeout(() => setSteps(ANALYSIS_STEPS), 2400), setTimeout(() => setWorking(false), 3600)];
    return () => ids.forEach(clearTimeout);
  }, [run]);
  return <ThoughtLine key={run} label="Analysing your profile…" working={working} steps={steps} fontSize={14} />;
}

export default function OnboardingPage() {
  const session = useRequireSession();
  const router = useRouter();
  const switchRole = useSwitchRole();
  const [role, setRole] = useState<Role>("student");
  const [status, setStatus] = useState<Record<AccountKey, ConnectionStatus>>({ github: "disconnected", linkedin: "disconnected", leetcode: "disconnected" });
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [analysisRuns, setAnalysisRuns] = useState(0);
  const [target, setTarget] = useState("backend");
  const [tasks, setTasks] = useState({ profile: true, viva: false, share: false });

  useEffect(() => {
    if (session.status === "ready") setRole(session.user.role);
  }, [session]);

  if (session.status === "loading") return <div className="grid min-h-screen place-items-center"><Spinner label="Loading" size="lg" /></div>;

  const connect = (key: AccountKey) =>
    new Promise<void>((resolve) => {
      setStatus((s) => ({ ...s, [key]: "connecting" }));
      setTimeout(() => { setStatus((s) => ({ ...s, [key]: "connected" })); resolve(); }, 700);
    });

  const finish = async () => {
    if (session.user.role !== role) await switchRole.mutateAsync(role);
    router.replace(homeHref(role));
  };

  return (
    <PageFrame as="main" className="min-h-screen py-10">
      <div className="mx-auto grid max-w-3xl gap-8">
        <header className="grid gap-2">
          <DisplayHeading as="h1" size="sm">Set up <em>{PRODUCT_NAME}</em></DisplayHeading>
          <p className="m-0 text-fg-muted">Five short steps. Everything here can be changed later in Settings.</p>
        </header>
        <Wizard
          finishing={switchRole.isPending}
          onFinish={finish}
          labels={{ finish: "Go to my home" }}
          steps={[
            {
              id: "role",
              label: "Your role",
              content: (
                <div className="grid max-w-md gap-3">
                  <Field label="I am a" hint="This sets which workspace you start in.">
                    <SegmentedControl label="Role" value={role} onValueChange={(v) => setRole(v as Role)} options={ROLES.map((r) => ({ value: r, label: ROLE_SHORT[r] }))} fullWidth />
                  </Field>
                </div>
              ),
            },
            {
              id: "accounts",
              label: "Connect accounts",
              optional: true,
              content: (
                <div className="grid gap-3 md:grid-cols-2">
                  {ACCOUNTS.map((a) => (
                    <ConnectAccountCard key={a.key} provider={a.name} description={a.description} icon={<a.icon className="size-5" aria-hidden="true" />} status={status[a.key]} account={status[a.key] === "connected" ? a.account : undefined} onConnect={() => connect(a.key)} onDisconnect={() => setStatus((s) => ({ ...s, [a.key]: "disconnected" }))} />
                  ))}
                </div>
              ),
            },
            {
              id: "profile",
              label: "Upload profile",
              optional: true,
              content: (
                <div className="grid gap-4">
                  <FileDropzone
                    title="Drop your LinkedIn export or resume"
                    hint="ZIP, PDF or DOCX, up to 10 MB"
                    accept={[".zip", ".pdf", ".docx"]}
                    maxSize={10 * 1024 * 1024}
                    multiple={false}
                    value={files}
                    onValueChange={setFiles}
                    onFilesAdded={() => setAnalysisRuns((n) => n + 1)}
                    onRemove={() => setFiles([])}
                  />
                  {analysisRuns > 0 && files.length > 0 ? <Analysis run={analysisRuns} /> : null}
                </div>
              ),
            },
            {
              id: "target",
              label: "Target role",
              content: (
                <div className="grid max-w-md gap-3">
                  <Field label="The role you are aiming for" hint="Readiness is measured against this role’s concepts.">
                    <Select options={TARGETS} value={target} onValueChange={setTarget} aria-label="Target role" />
                  </Field>
                </div>
              ),
            },
            {
              id: "done",
              label: "Done",
              content: (
                <div className="grid max-w-md gap-3">
                  <p className="m-0 text-fg-muted">You are set. A few good first moves:</p>
                  <div className="grid gap-1" role="group" aria-label="First steps">
                    <AnimatedCheckbox label="Create your profile" checked={tasks.profile} onChange={(v) => setTasks((t) => ({ ...t, profile: v }))} />
                    <AnimatedCheckbox label="Take your first viva" checked={tasks.viva} onChange={(v) => setTasks((t) => ({ ...t, viva: v }))} />
                    <AnimatedCheckbox label="Share your Proof Profile" checked={tasks.share} onChange={(v) => setTasks((t) => ({ ...t, share: v }))} strike="center" />
                  </div>
                </div>
              ),
            },
          ]}
        />
        <div className="text-sm"><Button variant="link" onClick={() => router.replace(homeHref(role))}>Skip for now</Button></div>
      </div>
    </PageFrame>
  );
}
