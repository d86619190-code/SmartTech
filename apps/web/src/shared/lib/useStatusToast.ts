import * as React from "react";
import type { StatusTone } from "@/shared/ui/StatusToast/StatusToast";

export function useStatusToast(timeoutMs = 2800) {
  const [toast, setToast] = React.useState<{ tone: StatusTone; message: string } | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), timeoutMs);
    return () => window.clearTimeout(t);
  }, [toast, timeoutMs]);

  const showToast = React.useCallback((tone: StatusTone, message: string) => {
    setToast({ tone, message });
  }, []);

  const closeToast = React.useCallback(() => setToast(null), []);

  return { toast, showToast, closeToast };
}
