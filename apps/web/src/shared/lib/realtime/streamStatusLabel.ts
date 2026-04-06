import type { StreamStatus } from "./openSseStream";

export function streamStatusLabel(status: StreamStatus): string {
  switch (status) {
    case "connected":
      return "Connection: online";
    case "reconnecting":
      return "Connection: reconnect...";
    case "auth_error":
      return "Your session has expired - please refresh the page or log in again";
    default:
      return "Connection: connection...";
  }
}

/** Same meaning as `streamStatusLabel`, but for a list of messages (not “connection”, but “updates”). */
export function streamUpdatesLabel(status: StreamStatus): string {
  return streamStatusLabel(status).replace("Compound", "Updates");
}
