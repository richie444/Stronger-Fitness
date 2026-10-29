import { useState } from "react";
import AuthDialog from "./AuthDialog.jsx";
import { apiRequest } from "../lib/api.js";

const navigation = [
  { href: "#schedule", label: "Classes" },
  { href: "#trainers", label: "Trainers" },
  { href: "#pricing", label: "Memberships" },
];

export default function Header({ user, onUserChange }) {
  const [authOpen, setAuthOpen] = useState(false);

  async function handleSignOut() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      onUserChange(null);
    } catch (error) {
      console.error("Could not sign out:", error.message);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:flex-nowrap lg:px-10">
          <a className="flex shrink-0 items-center gap-3" href="#top" aria-label="Stronger Fitness home">
            <span className="grid size-10 place-items-center rounded-full bg-clay text-lg font-black text-white shadow-card">S</span>
            <span className="text-[0.95rem] font-extrabold tracking-tight sm:text-lg">Stronger Fitness</span>
          </a>
          <nav className="order-3 flex w-full items-center justify-center gap-6 text-sm font-semibold text-muted sm:gap-9 lg:order-none lg:w-auto" aria-label="Main navigation">
            {navigation.map((item) => (
              <a key={item.href} className="transition-colors hover:text-clay" href={item.href}>{item.label}</a>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-32 truncate text-sm font-semibold text-muted sm:block">Hi, {user.name}</span>
              <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest" type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button className="px-1 py-2 text-sm font-bold text-ink transition hover:text-clay" type="button" onClick={() => setAuthOpen(true)}>Sign in</button>
              <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest" type="button" onClick={() => setAuthOpen(true)}>Join now</button>
            </div>
          )}
        </div>
      </header>
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onSignedIn={onUserChange} />}
    </>
  );
}
