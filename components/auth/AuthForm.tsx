"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const authResponse = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (authResponse.error) {
      setError(authResponse.error.message);
      return;
    }

    if (isLogin || authResponse.data.session) {
      router.push("/app");
      router.refresh();
      return;
    }

    setMessage("Check your email to confirm your account, then sign in.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Email</span>
        <input
          type="email"
          value={email}
          required
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Password</span>
        <input
          type="password"
          value={password}
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-line bg-[#09090b] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60"
          placeholder="At least 6 characters"
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm leading-6 text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
        ) : (
          <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
        )}
        {isLogin ? "Sign In" : "Create Account"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/auth/signup" : "/auth/login"}
          className="font-medium text-zinc-300 transition hover:text-white"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
