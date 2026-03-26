import crypto from "node:crypto";
import { withStore, type ClientOrderDraftRow } from "../store.js";

type DraftPayload = ClientOrderDraftRow["payload"];

export async function listClientOrderDrafts(userId: string): Promise<ClientOrderDraftRow[]> {
  return withStore((s) => {
    const rows = s.orderDraftsByUserId[userId] ?? [];
    return [...rows].sort((a, b) => b.saved_at - a.saved_at);
  });
}

export async function saveClientOrderDraft(
  userId: string,
  payload: DraftPayload,
  draftId?: string
): Promise<ClientOrderDraftRow> {
  return withStore((s) => {
    const rows = s.orderDraftsByUserId[userId] ?? [];
    const id = draftId?.trim() || crypto.randomUUID();
    const device = payload.device.trim();
    const issue = payload.issue.trim();
    const title = device
      ? `${device}${issue ? ` — ${issue.slice(0, 38)}${issue.length > 38 ? "…" : ""}` : ""}`
      : "Черновик заявки";
    const next: ClientOrderDraftRow = {
      id,
      title,
      saved_at: Date.now(),
      payload: {
        ...payload,
        device,
        issue,
        contactPhone: payload.contactPhone.trim(),
        photos: payload.photos.slice(0, 8),
      },
    };
    s.orderDraftsByUserId[userId] = [next, ...rows.filter((x) => x.id !== id)].slice(0, 20);
    return next;
  });
}

export async function deleteClientOrderDraft(userId: string, draftId: string): Promise<boolean> {
  return withStore((s) => {
    const rows = s.orderDraftsByUserId[userId] ?? [];
    const next = rows.filter((x) => x.id !== draftId);
    s.orderDraftsByUserId[userId] = next;
    return next.length !== rows.length;
  });
}

