import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import PortalClient from "./portal-client";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function PortalPage(): Promise<React.ReactElement> {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-indigo-900 transition-colors hover:text-indigo-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <User size={18} />
            </span>
            Customer Portal
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              {session.user.email}
            </span>
            <Link href="/api/auth/signout" className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <PortalClient />
      </main>
    </div>
  );
}