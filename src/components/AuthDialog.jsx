import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function AuthDialog({ onClose, onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const result = await apiRequest(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSignedIn(result.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="relative w-full max-w-md rounded-3xl bg-[#f8f5ef] p-6 shadow-2xl sm:p-9" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-xl text-muted transition hover:bg-black/5" type="button" onClick={onClose} aria-label="Close sign-in dialog">×</button>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-clay">Stronger starts here</p>
        <h2 id="auth-title" className="mt-3 text-3xl font-black tracking-tight">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="mt-2 text-sm text-muted">{mode === "signup" ? "Join the crew and make room for progress." : "Sign in to pick up where you left off."}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && <label className="block text-sm font-bold">Name<input className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-forest" name="name" type="text" minLength="1" maxLength="80" autoComplete="name" required /></label>}
          <label className="block text-sm font-bold">Email<input className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-forest" name="email" type="email" autoComplete="email" required /></label>
          <label className="block text-sm font-bold">Password<input className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none transition focus:border-forest" name="password" type="password" minLength="8" maxLength="72" autoComplete={mode === "signup" ? "new-password" : "current-password"} required /><span className="mt-1 block text-xs font-normal text-muted">At least 8 characters.</span></label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}
          <button className="w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-wait disabled:opacity-60" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">{mode === "signup" ? "Already have an account?" : "New to Stronger Fitness?"}{" "}<button className="font-bold text-forest underline underline-offset-2" type="button" onClick={() => { setError(""); setMode(mode === "signup" ? "login" : "signup"); }}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
      </section>
    </div>
  );
}
