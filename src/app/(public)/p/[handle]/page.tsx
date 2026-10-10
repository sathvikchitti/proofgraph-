import { PublicProfilePage } from "../../../../features/student/public-profile";

export const metadata = { title: "Proof Profile" };
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ handle: "demo-owner" }];
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <PublicProfilePage handle={handle} />;
}
