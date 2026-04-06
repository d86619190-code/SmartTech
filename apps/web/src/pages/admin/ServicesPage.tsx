import * as React from "react";
import type { AdminCategory } from "@/entities/admin";
import { getAdminCategoriesApi, updateAdminCategoriesApi } from "@/shared/lib/adminPanelApi";
import { Button } from "@/shared/ui/Button/Button";
import { AdminCard, AdminInput, AdminPageHeader } from "@/widgets/admin";
import cls from "./adminPages.module.css";

export const AdminServicesPage: React.FC = () => {
  const [tree, setTree] = React.useState<AdminCategory[]>([]);
  const [draftName, setDraftName] = React.useState("");
  React.useEffect(() => {
    void (async () => {
      const res = await getAdminCategoriesApi();
      setTree(res.rows as AdminCategory[]);
    })();
  }, []);

  const addRoot = () => {
    const name = draftName.trim();
    if (!name) return;
    setTree((t) => {
      const row = { id: `c${Date.now()}`, name, children: [] };
      const next = [...t, row];
      void updateAdminCategoriesApi(next);
      return next;
    });
    setDraftName("");
  };

  const addChild = (parentId: string) => {
    const label = window.prompt("Subcategory name");
    if (!label?.trim()) return;
    setTree((t) => {
      const next =
      t.map((c) =>
        c.id === parentId ? { ...c, children: [...c.children, { id: `ch${Date.now()}`, name: label.trim() }] } : c
      );
      void updateAdminCategoriesApi(next);
      return next;
    });
  };

  const removeChild = (parentId: string, childId: string) => {
    setTree((t) => {
      const next = t.map((c) => (c.id === parentId ? { ...c, children: c.children.filter((ch) => ch.id !== childId) } : c));
      void updateAdminCategoriesApi(next);
      return next;
    });
  };

  const removeRoot = (id: string) => {
    if (!window.confirm("Delete a category and all subcategories?")) return;
    setTree((t) => {
      const next = t.filter((c) => c.id !== id);
      void updateAdminCategoriesApi(next);
      return next;
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Services and categories"
        subtitle="Taxonomy of repairs: display, battery, water and common faults."
        actions={
          <Button type="button" onClick={addRoot} disabled={!draftName.trim()}>
            Add category
          </Button>
        }
      />
      <AdminCard style={{ marginBottom: 16, padding: 20 }}>
        <div className={cls.toolbar} style={{ marginBottom: 0 }}>
          <AdminInput placeholder="New root category" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
        </div>
      </AdminCard>
      {tree.map((cat) => (
        <AdminCard key={cat.id} style={{ marginBottom: 12 }}>
          <div className={cls.catBlock} style={{ border: "none", paddingTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 className={cls.catTitle}>{cat.name}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button type="button" variant="outline" onClick={() => addChild(cat.id)}>
                  Subcategory
                </Button>
                <Button type="button" variant="ghost" onClick={() => removeRoot(cat.id)}>
                  Delete
                </Button>
              </div>
            </div>
            {cat.children.length ? (
              <ul className={cls.subList}>
                {cat.children.map((ch) => (
                  <li key={ch.id}>
                    {ch.name}{" "}
                    <button type="button" className={cls.sortBtn} onClick={() => removeChild(cat.id, ch.id)} style={{ fontSize: 12 }}>
                      delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={cls.p} style={{ marginTop: 8 }}>
                No subcategories.
              </p>
            )}
          </div>
        </AdminCard>
      ))}
    </>
  );
};
