import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatEventDate } from "@/lib/format-date";
import type { EventRecord } from "@/lib/types";

export function EventCard({ event, href }: { event: EventRecord; href: string }) {
  const banner = event.bannerUrl?.trim() ?? "";
  return (
    <Link href={href} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cw-bg">
      <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-cw">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-cw-surface-2">
          {banner ? (
            <Image
              src={banner}
              alt={event.title}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cw-text/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
            <Badge className="border-0 bg-white/15 text-white backdrop-blur-md">
              {formatEventDate(event.startsAt)}
            </Badge>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold tracking-tight text-cw-text group-hover:text-cw-accent">
            {event.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-cw-muted">{event.description}</p>
          <p className="mt-3 text-xs font-medium text-cw-muted">{event.location}</p>
        </div>
      </Card>
    </Link>
  );
}
