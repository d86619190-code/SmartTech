import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import AppLayout from "./app/AppLayout";
import { RouteLoading } from "./app/RouteLoading";
import "./app/index.css";
import { ContactsPage } from "./pages/Contacts";
import { CreateOrderPage, CreateOrderSuccessPage } from "./pages/CreateOrder";
import { LoginPage } from "./pages/Login";
import { OrderHistoryPage } from "./pages/OrderHistory";
import { OrderRepairApprovalPage } from "./pages/OrderRepairApproval";
import { ProfilePage } from "./pages/Profile";
import { TrackingDetailPage, TrackingPage } from "./pages/Tracking";
import { LegalStubPage } from "./pages/LegalStub";
import {
  AccountSettingsPage,
  ChatPage as ClientChatPage,
  HelpPage,
  MessagesListPage,
  OrderPickupPage,
  ReviewsPage,
  WarrantyPage,
} from "./pages/client";
import { AdminLayout } from "@/widgets/admin";
import {
  AdminAnalyticsPage,
  AdminDashboardPage,
  AdminLogsPage,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminPricingPage,
  AdminServicesPage,
  AdminSettingsPage,
  AdminTechnicianDetailPage,
  AdminTechniciansPage,
  AdminUserDetailPage,
  AdminUsersPage,
} from "./pages/admin";
import { TechLayout } from "@/widgets/technician";
import {
  TechApprovalSendPage,
  TechChatPage,
  TechCompletedPage,
  TechDashboardPage,
  TechDiagnosticsPage,
  TechIncomingDetailPage,
  TechIncomingPage,
  TechMessagesPage,
  TechPartsPage,
  TechPricePage,
  TechProfilePage,
  TechRepairDetailPage,
  TechSettingsPage,
  TechTasksPage,
  TechTrackingPage,
} from "./pages/tech";

const HomePage = React.lazy(() => import("./pages/Home").then((m) => ({ default: m.HomePage })));
const LandingPage = React.lazy(() => import("./pages/Landing").then((m) => ({ default: m.LandingPage })));

function OrdersToTrackingRedirect() {
  const { orderId } = useParams<{ orderId: string }>();
  return <Navigate to={`/tracking/${orderId}`} replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route
          path="landing"
          element={
            <Suspense fallback={<RouteLoading />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteLoading />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route path="tracking/:orderId" element={<TrackingDetailPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="repairs" element={<Navigate to="/history" replace />} />
          <Route path="history" element={<OrderHistoryPage />} />
          <Route path="create-order" element={<CreateOrderPage />} />
          <Route path="create-order/success" element={<CreateOrderSuccessPage />} />
          <Route path="orders/:orderId/approval" element={<OrderRepairApprovalPage />} />
          <Route path="orders/:orderId/pickup" element={<OrderPickupPage />} />
          <Route path="orders/:orderId" element={<OrdersToTrackingRedirect />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="warranty" element={<WarrantyPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="messages" element={<MessagesListPage />} />
          <Route path="messages/:orderId" element={<ClientChatPage />} />
          <Route path="account/settings" element={<AccountSettingsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="forgot-password"
            element={
              <div style={{ padding: 32, fontFamily: "var(--font-sans)" }}>Восстановление пароля — скоро.</div>
            }
          />
          <Route
            path="sign-up"
            element={<div style={{ padding: 32, fontFamily: "var(--font-sans)" }}>Регистрация — скоро.</div>}
          />
          <Route path="privacy" element={<LegalStubPage title="Политика конфиденциальности" />} />
          <Route path="terms" element={<LegalStubPage title="Пользовательское соглашение" />} />
          <Route path="personal-data" element={<LegalStubPage title="Обработка персональных данных" />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:userId" element={<AdminUserDetailPage />} />
          <Route path="technicians" element={<AdminTechniciansPage />} />
          <Route path="technicians/:techId" element={<AdminTechnicianDetailPage />} />
          <Route path="pricing" element={<AdminPricingPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="logs" element={<AdminLogsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="tech" element={<TechLayout />}>
          <Route index element={<TechDashboardPage />} />
          <Route path="incoming" element={<TechIncomingPage />} />
          <Route path="incoming/:requestId" element={<TechIncomingDetailPage />} />
          <Route path="repairs/:repairId" element={<TechRepairDetailPage />} />
          <Route path="repairs/:repairId/diagnostics" element={<TechDiagnosticsPage />} />
          <Route path="repairs/:repairId/price" element={<TechPricePage />} />
          <Route path="repairs/:repairId/approval" element={<TechApprovalSendPage />} />
          <Route path="repairs/:repairId/tracking" element={<TechTrackingPage />} />
          <Route path="repairs/:repairId/parts" element={<TechPartsPage />} />
          <Route path="tasks" element={<TechTasksPage />} />
          <Route path="completed" element={<TechCompletedPage />} />
          <Route path="messages" element={<TechMessagesPage />} />
          <Route path="messages/:threadId" element={<TechChatPage />} />
          <Route path="profile" element={<TechProfilePage />} />
          <Route path="settings" element={<TechSettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
