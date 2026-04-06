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
        Our processes are completely transparent
      </h2>
      <p className={cls.intro}>no hidden fees or missed deadlines.</p>
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
                    After diagnostics, we offer several repair options with different costs - depending on
                    type of spare parts. All details are in section {" "}
                    <Link className={cls.inlineLink} to="/tracking">
                      "Order tracking"
                    </Link>
                    . You see in advance the price and terms, what is in stock and what will have to wait. Choose an option and
                    Confirm online - no hidden fees.
                  </>
                ) : s.n === 4 ? (
                  <>
                    We begin work only after your consent. The stages are displayed in the section{" "}
                    <Link className={cls.inlineLink} to="/tracking">
                      "Order tracking"
                    </Link>
                    . You can check the status or contact the manager at any time.
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
