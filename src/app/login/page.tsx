"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState("customer@example.com");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Unknown email. Try customer@example.com or admin@example.com.");
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 mb-4 transition-transform hover:scale-105">
            <LogIn size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
        </div>

        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="bg-indigo-50 text-indigo-700 text-sm p-3 rounded-lg border border-indigo-100 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>Demo accounts: <b>customer@example.com</b> or <b>admin@example.com</b>. Any password works.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  placeholder="name@example.com"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 text-base mt-2">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
