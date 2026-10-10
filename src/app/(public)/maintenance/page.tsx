import Link from "next/link";
import { ErrorPage, StatusPage } from "../../../components/status-page";
import { Button } from "../../../ui/ui/button";

export const metadata = { title: "Down for maintenance" };

/** Point a maintenance rewrite or redirect here. */
export default function MaintenancePage() {
  return (
    <StatusPage>
      <ErrorPage code="503" title="Down for maintenance" description="We are making improvements and will be back shortly. Your data is safe." actions={<Button asChild variant="outline"><Link href="/">Check again</Link></Button>} />
    </StatusPage>
  );
}
