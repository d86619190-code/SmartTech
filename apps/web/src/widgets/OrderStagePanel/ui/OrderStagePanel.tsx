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
          Заявка создана. Пожалуйста, передайте устройство в сервисный центр по адресу:{" "}
          <strong>{SITE.address}</strong>
        </p>
        <div className={cls.row}>
          <Button type="button" variant="outline" onClick={() => window.open(`tel:${SITE.phoneTel}`)}>
            Связаться
          </Button>
        </div>
      </div>
    );
  }

  if (step === "diagnostics") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>Устройство находится на диагностике.</p>
      </div>
    );
  }

  if (step === "awaiting_approval") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>Требуется согласовать вариант ремонта и стоимость.</p>
        <Link to={`/orders/${order.id}/approval`} className={cls.linkBtn}>
          Перейти к согласованию →
        </Link>
      </div>
    );
  }

  if (step === "in_repair") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>Устройство ремонтируется.</p>
        <ul className={cls.list}>
          <li>
            <strong>Тип детали:</strong> {selectedTitle ?? "—"}
          </li>
          <li>
            <strong>Итоговая стоимость:</strong> {formatRub(order.finalPriceRub)}
          </li>
          <li>
            <strong>Проблема:</strong> {order.issueSummary}
          </li>
        </ul>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>Устройство отремонтировано и готово к выдаче.</p>
      </div>
    );
  }

  if (step === "completed") {
    return (
      <div className={cls.panel}>
        <p className={cls.lead}>Заказ завершён. Возвращайтесь к нам снова!</p>
      </div>
    );
  }

  return null;
};
