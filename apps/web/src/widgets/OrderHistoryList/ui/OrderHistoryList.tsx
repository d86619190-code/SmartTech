import * as React from "react";
import type { RepairOrder } from "@/entities/repair-order";
import { RepairOrderRow } from "@/widgets/RepairOrderRow";
import cls from "./OrderHistoryList.module.css";

type OrderHistoryListProps = {
  orders: RepairOrder[];
  className?: string;
  heading?: string;
};

export const OrderHistoryList: React.FC<OrderHistoryListProps> = ({
  orders,
  className,
  heading = "Past repair orders",
}) => {
  return (
    <section className={[cls.card, className].filter(Boolean).join(" ")} aria-labelledby="past-repair-orders-heading">
      <h2 id="past-repair-orders-heading" className={cls.sectionLabel}>
        {heading}
      </h2>
      <ul className={cls.list}>
        {orders.map((order) => (
          <RepairOrderRow key={order.id} order={order} />
        ))}
      </ul>
    </section>
  );
};
