import { useState } from "react";
import { Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Mode = "signin" | "signup" | "magic";

export default function Login() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "magic") {
        const { error } = await signInWithMagicLink(email);
        if (error) setError(error);
        else setNotice(`We sent a magic sign-in link to ${email}. Check your inbox.`);
      } else if (mode === "signup") {
        const { error, needsConfirm } = await signUpWithPassword(email, password);
        if (error) setError(error);
        else if (needsConfirm)
          setNotice(`Account created. Confirm via the link we emailed to ${email}, then sign in.`);
        // if no confirm needed, onAuthStateChange logs them in automatically
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) setError(error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            S
          </div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Welcome to SubTrack</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "signup" ? "Create an account" : "Sign in to your subscriptions"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {mode !== "magic" && (
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
          {notice && (
            <p className="flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "magic" ? "Send magic link" : "Sign in"}
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
                setNotice(null);
              }}
              className="font-medium text-brand-600 hover:underline"
            >
              {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "magic" ? "signin" : "magic");
                setError(null);
                setNotice(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              {mode === "magic" ? "Use password" : "Email me a link"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Your subscriptions are private to your account.
        </p>
      </div>
    </div>
  );
}
