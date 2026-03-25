import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/widgets/PageHeader";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./CreateOrderSuccessPage.module.css";

export const CreateOrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cls.shell}>
      <PageHeader title="Заявка принята" />
      <div className={cls.body}>
        <div className={cls.card}>
          <p className={cls.text}>
            Мы получили заявку и скоро свяжемся с вами для уточнения. Статус можно отслеживать на главной и в
            разделе «История заказов».
          </p>
          <div className={cls.actions}>
            <Button type="button" onClick={() => navigate("/")}>
              На главную
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/history")}>
              История заказов
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
