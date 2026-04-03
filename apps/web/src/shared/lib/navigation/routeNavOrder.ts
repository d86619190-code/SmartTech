/**
 * Порядок пунктов сайдбара сверху вниз — для направления анимации перехода.
 * Ниже в меню → новый экран «поднимается» снизу (forward).
 */

export function getRouteNavOrder(pathname: string): number {
  const p = pathname.replace(/\/$/, "") || "/";

  const exact: Record<string, number> = {
    "/": 0,
    "/landing": 0.15,
    "/tracking": 1,
    "/create-order": 2,
    "/create-order/success": 2,
    "/history": 3,
    "/messages": 3.5,
    "/help": 3.55,
    "/warranty": 3.56,
    "/reviews": 3.57,
    "/contacts": 4,
    "/profile": 5,
    "/account/settings": 5.3,
    "/login/electron": 6,
    "/login": 6,
  };

  if (exact[p] !== undefined) return exact[p];
  if (p.startsWith("/messages/")) return 3.52;
  if (p.startsWith("/tracking/")) return 1.05;
  if (p.startsWith("/orders/") && p.endsWith("/pickup")) return 3.18;
  if (p.startsWith("/orders/") && p.endsWith("/approval")) return 3.25;
  if (p.startsWith("/orders/")) return 3.15;
  if (p === "/forgot-password" || p === "/sign-up") return 6.5;
  if (p === "/privacy" || p === "/terms" || p === "/personal-data") return 6.4;
  return 3;
}
