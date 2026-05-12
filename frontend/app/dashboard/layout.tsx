import Link from "next/link";
import { DashboardGate } from "@/components/dashboard-gate";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/events", label: "My events" },
  { href: "/dashboard/events/new", label: "New event" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGate>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-10">
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full border border-cw-border bg-cw-surface px-4 py-2 text-xs font-semibold text-cw-muted transition hover:border-cw-accent hover:text-cw-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <aside className="hidden w-52 shrink-0 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-cw-muted">Workspace</p>
          <nav className="mt-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-cw-sm px-3 py-2 text-sm font-medium text-cw-muted transition hover:bg-cw-surface-2 hover:text-cw-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </DashboardGate>
  );
}
