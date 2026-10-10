import Link from "next/link";
import { ErrorPage, StatusPage } from "../components/status-page";
import { Button } from "../ui/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage>
      <ErrorPage code="404" title="Page not found" description="That page does not exist, or it moved." actions={<Button asChild variant="outline"><Link href="/">Back to the start</Link></Button>} />
    </StatusPage>
  );
}
