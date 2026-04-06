const LAST_ROUTE_KEY = "auth.lastRoute.v1";

function getRouteFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash ?? "";
  if (!hash) return null;
  // HashRouter format: "#/path?query"
  if (hash.startsWith("#/")) return hash.slice(1);
  // Fallback: just strip leading "#"
  if (hash.startsWith("#")) return hash.slice(1);
  return null;
}

export function setLastAuthRoute(routeWithSearch: string): void {
  if (typeof sessionStorage === "undefined") return;
  if (!routeWithSearch) return;
  if (routeWithSearch.startsWith("/login")) return; // avoid loops
  sessionStorage.setItem(LAST_ROUTE_KEY, routeWithSearch);
}

function readLastAuthRoute(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(LAST_ROUTE_KEY);
  } catch {
    return null;
  }
}

function getCurrentRouteFallback(): string {
  const fromHash = getRouteFromHash();
  if (fromHash) return fromHash;
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function redirectToLoginForAuthMissing(nextPath?: string): void {
  if (typeof window === "undefined") return;

  const baseUrl = window.location.href.split("#")[0];

  let next = nextPath?.trim();
  if (!next) {
    next = readLastAuthRoute() ?? getCurrentRouteFallback();
  }
  if (!next.startsWith("/")) next = `/${next}`;
  if (next.startsWith("/login")) next = "/";

  const url = `${baseUrl}#/login?next=${encodeURIComponent(next)}`;

  // Using location assignment so it works from non-react code (api wrappers).
  window.location.assign(url);
}

export function isAuthRequiredMessage(message: string): boolean {
  return /Required\s+authorization/i.test(message);
}

export function normalizeAuthRequiredMessage(message: string): string {
  if (isAuthRequiredMessage(message)) return "Authorization required";
  return message;
}


