import Link from "next/link";
import { LogIn, Shield, Users } from "lucide-react";

export default function Home(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-200/40 to-cyan-200/40 blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium rounded-full text-indigo-700 bg-indigo-100/80 backdrop-blur-sm border border-indigo-200/50">
          <span className="flex w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Service Requests Platform
        </div>

        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 via-slate-800 to-indigo-900">
          Manage Requests <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">With Elegance</span>
        </h1>

        <p className="max-w-2xl mb-12 text-lg sm:text-xl text-slate-600">
          A robust, secure, and beautiful platform to handle customer service requests seamlessly. Experience the next generation of portal management.
        </p>

        <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
          <Link
            href="/login"
            className="group relative flex flex-col items-center p-6 space-y-4 transition-all bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white"
          >
            <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
              <LogIn size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">Log In</h3>
              <p className="text-sm text-slate-500">Access your account</p>
            </div>
          </Link>

          <Link
            href="/portal"
            className="group relative flex flex-col items-center p-6 space-y-4 transition-all bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white"
          >
            <div className="p-4 bg-blue-100 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">Customer Portal</h3>
              <p className="text-sm text-slate-500">Submit & track requests</p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="group relative flex flex-col items-center p-6 space-y-4 transition-all bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-white"
          >
            <div className="p-4 bg-cyan-100 rounded-full text-cyan-600 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">Admin Dashboard</h3>
              <p className="text-sm text-slate-500">Manage all operations</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}