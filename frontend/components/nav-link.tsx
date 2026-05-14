"use client";

import Link, { type LinkProps } from "next/link";
import { useLoading } from "@/lib/loading-context";

type NavLinkProps = LinkProps & {
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function NavLink({ onClick, ...props }: NavLinkProps) {
  const { beginNavigation } = useLoading();
  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) beginNavigation();
      }}
    />
  );
}
