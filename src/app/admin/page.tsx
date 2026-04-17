import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import AdminClient from "./admin-client";
import { LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function AdminPage(): Promise<React.ReactElement> {
  const session = await auth();

  // 🔐 Protect route
  if (!session?.user) redirect("/login");

  // 🚫 Role check
  if (session.user.role !== "admin") {
    return (
      <main className="flex h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <Shield size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mb-6 text-red-600">
            You must be an administrator to view this page.
          </p>
          <Link href="/portal" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Go to Customer Portal
          </Link>
        </div>
      </main>
    );
  }

  // ✅ Pass session to client component
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-cyan-900 transition-colors hover:text-cyan-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
              <Shield size={18} />
            </span>
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex text-sm">
              <span className="font-medium text-slate-500">{session.user.email}</span>
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                Admin
              </span>
            </div>
            <Link href="/api/auth/signout" className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <LogOut size={16} className="mr-2 hidden sm:block" />
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <AdminClient />
      </main>
    </div>
  );
}