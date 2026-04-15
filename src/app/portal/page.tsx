import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function PortalPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Portal</h1>
      <p className="mt-2 text-neutral-600">
        Signed in as {session.user.email} ({session.user.role}).
      </p>
      <p className="mt-6 rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        Build the customer-facing Service Requests flow here. See <code>README.md</code>.
      </p>
    </main>
  );
}
