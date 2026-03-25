import * as React from "react";
import {
  openInboxSummaryStream,
  openOrderMessagesStream,
  type ChatMessage,
  type InboxSummary,
} from "@/shared/lib/clientInboxApi";
import { techApi } from "@/shared/lib/techApi";
import type { StreamStatus } from "./openSseStream";

export function useInboxSummarySse(enabled: boolean, onSummary: (summary: InboxSummary) => void): StreamStatus {
  const [streamStatus, setStreamStatus] = React.useState<StreamStatus>("connecting");
  const onSummaryRef = React.useRef(onSummary);
  onSummaryRef.current = onSummary;
  React.useEffect(() => {
    if (!enabled) return;
    return openInboxSummaryStream(
      (s) => {
        onSummaryRef.current(s);
      },
      undefined,
      setStreamStatus
    );
  }, [enabled]);
  return streamStatus;
}

export function useOrderMessagesSse(
  orderId: string | undefined,
  onMessages: (messages: ChatMessage[]) => void,
  onChatMeta?: (meta: { serviceTyping: boolean }) => void
): StreamStatus {
  const [streamStatus, setStreamStatus] = React.useState<StreamStatus>("connecting");
  const onMessagesRef = React.useRef(onMessages);
  onMessagesRef.current = onMessages;
  const onChatMetaRef = React.useRef(onChatMeta);
  onChatMetaRef.current = onChatMeta;
  React.useEffect(() => {
    if (!orderId) return;
    return openOrderMessagesStream(
      orderId,
      (msgs) => {
        onMessagesRef.current(msgs);
      },
      undefined,
      setStreamStatus,
      (meta) => onChatMetaRef.current?.(meta)
    );
  }, [orderId]);
  return streamStatus;
}

export function useTechThreadSse(
  threadId: string | undefined,
  onSnapshot: (payload: { thread: unknown; messages: unknown[] }) => void
): StreamStatus {
  const [streamStatus, setStreamStatus] = React.useState<StreamStatus>("connecting");
  const onSnapshotRef = React.useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;
  React.useEffect(() => {
    if (!threadId) return;
    return techApi.openThreadStream(
      threadId,
      (payload) => {
        onSnapshotRef.current(payload);
      },
      undefined,
      setStreamStatus
    );
  }, [threadId]);
  return streamStatus;
}
