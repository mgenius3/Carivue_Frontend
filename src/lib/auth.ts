import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function logoutUser(router: AppRouterInstance) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }

  router.replace("/signin");
  router.refresh();
}
