import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { readAuthSession } from "@/shared/lib/authSession";
import { ResponsiveShellLayout } from "@/app/ResponsiveShellLayout";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import cls from "./AdminLayout.module.css";

export const AdminLayout: React.FC = () => {
  const role = readAuthSession()?.user.role;
  if (role !== "admin" && role !== "boss") {
    return <Navigate to="/login" replace />;
  }
  return (
    <ResponsiveShellLayout sidebarId="admin-sidebar" sidebar={<AdminSidebar />}>
      <div className={cls.column}>
        <AdminTopbar />
        <div className={cls.scroll} data-panel-scroll>
          <div className={cls.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </ResponsiveShellLayout>
  );
};
