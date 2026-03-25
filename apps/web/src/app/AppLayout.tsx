import * as React from "react";
import { Sidebar } from "@/widgets/Sidebar/ui/Sidebar";
import { PageTransition } from "@/features/page-transition";
import { ResponsiveShellLayout } from "./ResponsiveShellLayout";

export const AppLayout: React.FC = () => {
  return (
    <ResponsiveShellLayout sidebarId="app-sidebar" sidebar={<Sidebar />}>
      <PageTransition />
    </ResponsiveShellLayout>
  );
};

export default AppLayout;
