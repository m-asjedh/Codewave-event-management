/**
 * Normalizes internal app paths for `trailingSlash: true` static export
 * (S3 + CloudFront expect `…/index.html` under each segment).
 */
export function withTrailingSlash(path: string): string {
  const raw = path.trim();
  if (!raw.startsWith("/")) return raw;

  const q = raw.indexOf("?");
  const pathname = q >= 0 ? raw.slice(0, q) : raw;
  const search = q >= 0 ? raw.slice(q) : "";

  if (pathname === "/" || pathname === "") {
    return search ? `/${search}` : "/";
  }

  const base = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${base}${search}`;
}
