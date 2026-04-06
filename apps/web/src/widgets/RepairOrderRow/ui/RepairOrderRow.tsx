import * as React from "react";
import type { RepairOrder, RepairOrderStatus } from "@/entities/repair-order";
import { Badge, type BadgeVariant } from "@/shared/ui/Badge/Badge";
import cls from "./RepairOrderRow.module.css";

type RepairOrderRowProps = {
  order: RepairOrder;
};

const statusToVariant: Record<RepairOrderStatus, BadgeVariant> = {
  completed: "success",
  canceled: "danger",
  in_progress: "warning",
};

const statusLabel: Record<RepairOrderStatus, string> = {
  completed: "Completed",
  canceled: "Canceled",
  in_progress: "In progress",
};

function formatRub(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(safe);
}

export const RepairOrderRow: React.FC<RepairOrderRowProps> = ({ order }) => {
  return (
    <li className={cls.row}>
      <div className={cls.thumbWrap}>
        <img
          className={cls.thumb}
          src={order.imageUrl}
          alt={`${order.deviceName}, ${order.serviceName}`}
          loading="lazy"
          width={76}
          height={76}
        />
      </div>
      <div className={cls.main}>
        <p className={cls.device}>{order.deviceName}</p>
        <p className={cls.service}>{order.serviceName}</p>
        <p className={cls.meta}>{order.metaLine}</p>
      </div>
      <div className={cls.side}>
        <Badge variant={statusToVariant[order.status]} className={cls.statusBadge}>
          {statusLabel[order.status]}
        </Badge>
        <span className={cls.date}>{order.orderDateLabel}</span>
        <span className={cls.price}>{formatRub(order.priceRub)}</span>
      </div>
    </li>
  );
};
