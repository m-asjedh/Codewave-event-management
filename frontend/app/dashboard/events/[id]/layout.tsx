import { PRE_RENDERED_EVENT_IDS } from "@/lib/static-export-ids";

export function generateStaticParams() {
  return PRE_RENDERED_EVENT_IDS.map((id) => ({ id }));
}

export default function DashboardEventIdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
