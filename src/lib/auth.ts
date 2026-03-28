import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function buildSignInPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/signin";
  }

  return `/signin?next=${encodeURIComponent(nextPath)}`;
}

export function logoutUser(router: AppRouterInstance) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }

  router.replace("/signin");
  router.refresh();
}
