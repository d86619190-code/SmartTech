import type { ClientRepairDto } from "@/shared/lib/clientInboxApi";
import type { TrackingCardData } from "./types";

export function clientRepairToTrackingCard(dto: ClientRepairDto): TrackingCardData {
  return {
    id: dto.id,
    deviceName: dto.deviceName,
    issueLabel: dto.issueLabel,
    imageUrl: dto.imageUrl,
    progressPercent: dto.progressPercent,
    estimateLabel: dto.estimateLabel,
    orderId: dto.orderId,
  };
}
