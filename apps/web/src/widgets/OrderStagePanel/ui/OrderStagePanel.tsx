import * as React from "react";
import { Link } from "react-router-dom";
import type { ServiceOrder } from "@/entities/order";
import { SITE } from "@/shared/config/siteContacts";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./OrderStagePanel.module.css";

type OrderStagePanelProps = {
  order: ServiceOrder;
  selectedTitle?: string;
};

function formatRub(n: number | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(
    n
  );
}

export const OrderStagePanel: React.FC<OrderStagePanelProps> = ({ order, selectedTitle }) => {
  const { step } = order;

  if (step === "created" || step === "awaiting_device") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>
          The application has been created. Please send the device to the service center at:{" "}
          <strong>{SITE.address}</strong>
        </p>
        <div className={cls.row}>
          <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
            Contact
          </Button>
        </div>
      </div>
    );
  }

  if (step === "diagnostics") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>The device is undergoing diagnostics.</p>
      </div>
    );
  }

  if (step === "awaiting_approval") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>It is necessary to agree on the repair option and cost.</p>
        <Link to={`/orders/${order.id}/approval`} className={cls.linkBtn}>
          Go to approval →
        </Link>
      </div>
    );
  }

  if (step === "in_repair") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>The device is being repaired.</p>
        <ul className={cls.list}>
          <li>
            <strong>Part Type:</strong>{selectedTitle ??"—"}
          </li>
          <li>
            <strong>Final cost:</strong>{formatRub(order.finalPriceRub)}
          </li>
          <li>
            <strong>Issue:</strong>{order.issueSummary}
          </li>
        </ul>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>The device has been repaired and is ready for pickup.</p>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>The order is completed. Come back to us again!</p>
      </div>
    );
  }

  return null;
};
