"use client";
import { useEffect } from "react";
import { ErrorPage, StatusPage } from "../components/status-page";
import { Button } from "../ui/ui/button";

/** The 500 boundary for every route below the root layout. */
export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <StatusPage>
      <ErrorPage
        code="500"
        title="Something went wrong"
        description={error.digest ? `Please try again. Reference: ${error.digest}` : "Please try again, or come back in a moment."}
        actions={<Button onClick={reset}>Try again</Button>}
      />
    </StatusPage>
  );
}
