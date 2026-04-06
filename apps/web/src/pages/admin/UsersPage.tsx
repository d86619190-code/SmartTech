import * as React from "react";
import { listAdminUsersApi, setAdminUserRoleApi, type Role } from "@/shared/lib/adminUsersApi";
import {
  AdminInput,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTd,
  AdminTh,
  FilterBar,
} from "@/widgets/admin";
import { useStatusToast } from "@/shared/lib/useStatusToast";
import { StatusToast } from "@/shared/ui/StatusToast/StatusToast";
import cls from "./adminPages.module.css";

const ROLE_OPTS: { value: "all" | Role; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "client", label: "Client" },
  { value: "master", label: "Master" },
  { value: "admin", label: "Admin" },
  { value: "boss", label: "Boss" },
];

export const AdminUsersPage: React.FC = () => {
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<"all" | Role>("all");
  const [users, setUsers] = React.useState<Awaited<ReturnType<typeof listAdminUsersApi>>>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const { toast, showToast, closeToast } = useStatusToast();

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const rows = await listAdminUsersApi();
        if (mounted) setUsers(rows);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load users";
        showToast("error", msg);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const rows = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!qq) return true;
      return `${u.name ?? ""} ${u.phone ?? ""} ${u.email ?? ""}`.toLowerCase().includes(qq);
    });
  }, [q, role, users]);

  const changeRole = async (userId: string, nextRole: Role) => {
    setBusyId(userId);
    try {
      const updated = await setAdminUserRoleApi(userId, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      showToast("success", "Role updated");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update role";
      showToast("error", msg);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageHeader title="Users and roles" subtitle="Manage access levels of registered users." />
      <FilterBar>
        <AdminInput placeholder="Search by name, phone, email..." value={q} onChange={(e) => setQ(e.target.value)} />
        <AdminSelect value={role} onChange={(e) => setRole(e.target.value as "all" | Role)}>
          {ROLE_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </AdminSelect>
      </FilterBar>
      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Client</AdminTh>
            <AdminTh>Contacts</AdminTh>
            <AdminTh>Current Role</AdminTh>
            <AdminTh>Issue role</AdminTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <AdminTd>
                <strong>{u.name ?? "User"}</strong>
              </AdminTd>
              <AdminTd>
                <div>{u.phone ?? "—"}</div>
                <div className={cls.muted}>{u.email ?? "—"}</div>
              </AdminTd>
              <AdminTd>{u.role}</AdminTd>
              <AdminTd>
                <AdminSelect
                  value={u.role}
                  disabled={busyId === u.id}
                  onChange={(e) => void changeRole(u.id, e.target.value as Role)}
                >
                  {ROLE_OPTS.filter((o) => o.value !== "all").map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </AdminSelect>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {toast ? <StatusToast tone={toast.tone} message={toast.message} onClose={closeToast} /> : null}
    </>
  );
};
