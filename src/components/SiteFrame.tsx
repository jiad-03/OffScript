import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 pb-4 md:px-10">
        <Link to="/" className="font-display text-2xl tracking-tight">
          Off<span className="italic text-wine">Script</span>
        </Link>
        <span className="kicker hidden text-muted-foreground sm:block">The Internet Identity Toolkit</span>
        <Link to="/create" className="kicker border-b border-foreground pb-0.5 hover:text-wine hover:border-wine">
          Begin
        </Link>
      </header>
      <div className="mx-auto max-w-6xl px-5 md:px-10"><div className="rule-double" /></div>
      <main>{children}</main>
      <footer className="mx-auto mt-24 max-w-6xl px-5 pb-10 md:px-10">
        <div className="border-t border-border pt-6 flex flex-col gap-2 sm:flex-row sm:justify-between text-xs text-muted-foreground">
          <span className="font-display text-base text-foreground">One real personality. Many rooms online.</span>
          <span>No account. Your answers stay in this tab only.</span>
        </div>
      </footer>
    </div>
  );
}
