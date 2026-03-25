import * as React from "react";
import type { AdminLogEvent } from "@/entities/admin";
import cls from "./ActivityFeed.module.css";

type ActivityFeedProps = {
  items: AdminLogEvent[];
  title: string;
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, title }) => {
  return (
    <div className={cls.root}>
      <h3 className={cls.title}>{title}</h3>
      <ul className={cls.list}>
        {items.map((ev) => (
          <li key={ev.id} className={cls.item} data-severity={ev.severity}>
            <span className={cls.time}>{ev.at}</span>
            <span className={cls.msg}>{ev.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
