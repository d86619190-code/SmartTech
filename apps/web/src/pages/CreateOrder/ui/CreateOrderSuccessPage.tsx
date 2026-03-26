import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./CreateOrderSuccessPage.module.css";

export const CreateOrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cls.shell}>
      <div className={cls.body}>
        <h1 className={cls.title}>Заявка принята</h1>
        <div className={cls.card}>
          <p className={cls.text}>
            Мы получили заявку и скоро свяжемся с вами для уточнения. Статус можно отслеживать на главной и в
            разделе «Сообщения».
          </p>
          <div className={cls.actions}>
            <Button type="button" onClick={() => navigate("/")}>
              На главную
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/messages")}>
              Сообщения
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
