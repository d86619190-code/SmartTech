import * as React from "react";
import cls from "./TechModal.module.css";

type TechModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const TechModal: React.FC<TechModalProps> = ({ title, open, onClose, children, footer }) => {
  React.useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={cls.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={cls.panel}
        role="dialog"
        aria-modal
        aria-labelledby="tech-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={cls.head}>
          <h2 id="tech-modal-title" className={cls.title}>
            {title}
          </h2>
          <button type="button" className={cls.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={cls.body}>{children}</div>
        {footer ? <div className={cls.footer}>{footer}</div> : null}
      </div>
    </div>
  );
};
