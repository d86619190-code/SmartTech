import * as React from "react";
import { useNavigate } from "react-router-dom";
import { isElectronApp } from "@/shared/lib/isElectronApp";
import { Button } from "@/shared/ui/Button/Button";
import { Input } from "@/shared/ui/Input/Input";
import cls from "./LeadForm.module.css";

type LeadFormProps = {
  className?: string;
};

export const LeadForm: React.FC<LeadFormProps> = ({ className }) => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isElectronApp()) {
      navigate("/create-order");
      return;
    }
    navigate("/sign-up");
  };

  return (
    <section className={[cls.root, className].filter(Boolean).join(" ")} aria-labelledby="lead-heading">
      <h2 id="lead-heading" className={cls.heading}>
        Всегда на связи
      </h2>
      <p className={cls.sub}>Оставьте заявку — расскажем детали и подскажем лучший вариант ремонта.</p>
      <form className={cls.form} onSubmit={onSubmit}>
        <Input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" fullWidth className={cls.cta}>
          Оставить заявку
        </Button>
      </form>
    </section>
  );
};
