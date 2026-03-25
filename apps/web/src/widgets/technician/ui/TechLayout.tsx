import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { readAuthSession } from "@/shared/lib/authSession";
import { ResponsiveShellLayout } from "@/app/ResponsiveShellLayout";
import { TechSidebar } from "./TechSidebar";
import { TechTopbar } from "./TechTopbar";
import cls from "./TechLayout.module.css";

export const TechLayout: React.FC = () => {
  const role = readAuthSession()?.user.role;
  if (role !== "master" && role !== "admin" && role !== "boss") {
    return <Navigate to="/login" replace />;
  }
  return (
    <ResponsiveShellLayout sidebarId="tech-sidebar" sidebar={<TechSidebar />}>
      <div className={cls.column}>
        <TechTopbar />
        <div className={cls.scroll} data-panel-scroll>
          <div className={cls.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </ResponsiveShellLayout>
  );
};
