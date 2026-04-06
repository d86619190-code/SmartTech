import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button/Button";
import cls from "./CreateOrderSuccessPage.module.css";

export const CreateOrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={cls.shell}>
      <div className={cls.body}>
        <h1 className={cls.title}>Application accepted</h1>
        <div className={cls.card}>
          <p className={cls.text}>
            We have received your application and will contact you soon for clarification. The status can be tracked on the main page and in
            "Messages" section.
          </p>
          <div className={cls.actions}>
            <Button type="button" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/messages")}>
              Messages
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
