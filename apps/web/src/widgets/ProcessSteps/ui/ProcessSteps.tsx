import * as React from "react";
import { Link } from "react-router-dom";
import type { ProcessStep } from "@/shared/config/marketing";
import cls from "./ProcessSteps.module.css";

type ProcessStepsProps = {
  steps: ProcessStep[];
  variant?: "default" | "dark";
};

export const ProcessSteps: React.FC<ProcessStepsProps> = ({ steps, variant = "default" }) => {
  return (
    <section
      className={[cls.root, variant === "dark" ? cls.dark : ""].filter(Boolean).join(" ")}
      aria-labelledby="process-heading"
    >
      <h2 id="process-heading" className={cls.title}>
        Наши процессы абсолютно прозрачны для вас
      </h2>
      <p className={cls.intro}>Пошагово — без скрытых платежей и сюрпризов.</p>
      <ol className={cls.track}>
        {steps.map((s) => (
          <li key={s.n} className={cls.step}>
            <div className={cls.visual} aria-hidden>
              <img src={s.imageUrl} alt="" className={cls.image} loading="lazy" referrerPolicy="no-referrer" />
            </div>
            <div className={cls.copy}>
              <span className={cls.badge}>{s.n}</span>
              <h3 className={cls.stepTitle}>{s.title}</h3>
              <p className={cls.body}>
                {s.n === 3 ? (
                  <>
                    После диагностики предлагаем несколько вариантов ремонта с разной стоимостью — в зависимости от
                    типа запчастей. Все подробности — в разделе{" "}
                    <Link className={cls.inlineLink} to="/tracking">
                      «Отслеживание заказа»
                    </Link>
                    . Вы заранее видите цену и сроки, что в наличии, а что придётся подождать. Выбираете вариант и
                    подтверждаете онлайн — без скрытых платежей.
                  </>
                ) : s.n === 4 ? (
                  <>
                    Приступаем к работе только после вашего согласия. Этапы отображаются в разделе{" "}
                    <Link className={cls.inlineLink} to="/tracking">
                      «Отслеживание заказа»
                    </Link>{" "}
                    — в любой момент можно проверить статус или связаться с менеджером.
                  </>
                ) : (
                  s.body
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
