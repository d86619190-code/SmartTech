import * as React from "react";
import { ORDER_FLOW_STEPS, stepIndex, type OrderFlowStepId } from "@/entities/order";
import cls from "./OrderTimeline.module.css";

type OrderTimelineProps = {
  currentStep: OrderFlowStepId;
  /** Горизонтальный таймлайн (ТЗ: линия с точками, скролл если не влезает) */
  variant?: "vertical" | "horizontal";
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStep, variant = "vertical" }) => {
  const activeIdx = stepIndex(currentStep);

  return (
    <ol
      className={[cls.root, variant === "horizontal" && cls.rootHorizontal].filter(Boolean).join(" ")}
      aria-label="Этапы заказа"
    >
      {ORDER_FLOW_STEPS.map((step, i) => {
        const state = i < activeIdx ? "done" : i === activeIdx ? "current" : "upcoming";
        return (
          <li key={step.id} className={[cls.item, cls[state]].filter(Boolean).join(" ")}>
            <span className={cls.dot} aria-hidden />
            <span className={cls.label}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
};
