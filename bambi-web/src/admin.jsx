// admin.jsx — AdminPanel: category & user management. Role-guarded.
import React from 'react';
import api from './api.js';
import { useApi, useToast, useConfirm, PageWrap } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';
import { IconShield, IconPlus, IconEdit, IconTrash, IconCheck } from './icons.jsx';

export function AdminPanel() {
  const auth = useAuth();
  const [tab, setTab] = React.useState("categories");

  React.useEffect(() => {
    if (!auth.isLoggedIn) { navigate("/login"); return; }
    if (!auth.isAdmin) { navigate("/shop"); return; }
  }, [auth.isLoggedIn, auth.isAdmin]);

  if (!auth.isAdmin) return null;

  return (
    <PageWrap wide>
      <div className="page-header">
        <div className="page-header__title">
          <h1>Admin panel</h1>
          <span className="sticker sticker--lime sticker--tilt-l"><IconShield size={12} /> admin</span>
        </div>
        <p className="muted">Manage categories and users.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "categories" ? "tab--on" : ""}`} onClick={() => setTab("categories")}>Categories</button>
        <button className={`tab ${tab === "users" ? "tab--on" : ""}`} onClick={() => setTab("users")}>Users</button>
      </div>

      {tab === "categories" ? <CategoryManager /> : <UserManager />}
    </PageWrap>
  );
}

// =================== Categories ===================
function CategoryManager() {
  const apiCall = useApi();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState({ name: "", description: "", gender: "All", sortOrder: 1 });
  const [errors, setErrors] = React.useState({});

  const load = () => {
    setLoading(true);
    apiCall(() => api.listCategories()).then((c) => { if (c) setItems(c); setLoading(false); });
  };
  React.useEffect(load, []);

  const startNew = () => {
    setEditing("new");
    setDraft({ name: "", description: "", gender: "All", sortOrder: items.length + 1 });
    setErrors({});
  };
  const startEdit = (c) => {
    setEditing(c.id);
    setDraft({ name: c.name, description: c.description, gender: c.gender, sortOrder: c.sortOrder });
    setErrors({});
  };
  const cancel = () => { setEditing(null); setErrors({}); };

  const validate = (d) => {
    const e = {};
    if (!d.name.trim() || d.name.length < 2) e.name = "Min 2 chars.";
    if (!["All", "Women", "Men", "Unisex", "Kids"].includes(d.gender)) e.gender = "Pick a gender.";
    if (!d.sortOrder || isNaN(Number(d.sortOrder))) e.sortOrder = "Number.";
    return e;
  };

  const save = async () => {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editing === "new") {
      const res = await apiCall(() => api.createCategory(draft));
      if (res) { toast.ok("Category created."); setEditing(null); load(); }
    } else {
      const res = await apiCall(() => api.updateCategory(editing, draft));
      if (res) { toast.ok("Updated."); setEditing(null); load(); }
    }
  };

  const remove = async (c) => {
    const ok = await confirm.ask({
      title: "Delete category?",
      message: `"${c.name}" will be removed. Won't work if listings still use it.`,
      danger: true, confirmLabel: "Delete",
    });
    if (!ok) return;
    const res = await apiCall(() => api.deleteCategory(c.id));
    if (res) { toast.ok("Deleted."); load(); }
  };

  return (
    <div>
      {confirm.node}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div className="muted">{items.length} categories</div>
        <button className="btn btn--pink btn--sm" onClick={startNew}><IconPlus size={14} /> New category</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table" style={{ border: "none", boxShadow: "none" }}>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Gender</th><th>Sort</th><th style={{ width: 200 }}>Actions</th></tr>
          </thead>
          <tbody>
            {editing === "new" && <EditRow draft={draft} setDraft={setDraft} errors={errors} onSave={save} onCancel={cancel} />}
            {items.map(c =>
              editing === c.id ? (
                <EditRow key={c.id} draft={draft} setDraft={setDraft} errors={errors} onSave={save} onCancel={cancel} />
              ) : (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td className="muted">{c.description}</td>
                  <td><span className="tag">{c.gender}</span></td>
                  <td className="mono">{c.sortOrder}</td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => startEdit(c)}><IconEdit size={12} /> Edit</button>
                      <button className="btn btn--danger btn--sm" onClick={() => remove(c)}><IconTrash size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {loading && <tr><td colSpan="5"><div className="skel" style={{ height: 30 }} /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditRow({ draft, setDraft, errors, onSave, onCancel }) {
  const set = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));
  return (
    <tr style={{ background: "var(--cream-2)" }}>
      <td>
        <input className={`input ${errors.name ? "input--err" : ""}`} value={draft.name} onChange={set("name")} placeholder="Name" />
        {errors.name && <div className="field__error">{errors.name}</div>}
      </td>
      <td><input className="input" value={draft.description} onChange={set("description")} placeholder="Description" /></td>
      <td>
        <select className="select" value={draft.gender} onChange={set("gender")} style={{ minWidth: 120 }}>
          {["All", "Women", "Men", "Unisex", "Kids"].map(g => <option key={g}>{g}</option>)}
        </select>
      </td>
      <td><input className="input" type="number" value={draft.sortOrder} onChange={set("sortOrder")} style={{ width: 70 }} /></td>
      <td>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn--pink btn--sm" onClick={onSave}><IconCheck size={12} /> Save</button>
          <button className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
        </div>
      </td>
    </tr>
  );
}

// =================== Users ===================
function UserManager() {
  const apiCall = useApi();
  const toast = useToast();
  const auth = useAuth();
  const confirm = useConfirm();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [filterCity, setFilterCity] = React.useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (q) params.username = q;
    if (filterCity) params.city = filterCity;
    params.pageSize = 100;
    apiCall(() => api.listUsers(params)).then((u) => { if (u) setItems(u); setLoading(false); });
  };
  
  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [q, filterCity]);

  const changeRole = async (u, role) => {
    if (u.role === role) return;
    const res = await apiCall(() => api.updateUserRole(u.id, role));
    if (res) { toast.ok(`@${u.username} → ${role}`); load(); }
  };

  const remove = async (u) => {
    const ok = await confirm.ask({
      title: "Delete user?",
      message: `@${u.username} will be removed. This can't be undone.`,
      danger: true, confirmLabel: "Delete",
    });
    if (!ok) return;
    const res = await apiCall(() => api.deleteUser(u.id));
    if (res) { toast.ok("User deleted."); load(); }
  };

  return (
    <div>
      {confirm.node}
      <div style={{ marginBottom: 14 }}>
        <div className="muted" style={{ marginBottom: 10 }}>{items.length} users</div>
        <div className="row" style={{ gap: 8 }}>
          <input className="input" placeholder="Search by username" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="input" placeholder="Filter by city" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table" style={{ border: "none", boxShadow: "none" }}>
          <thead>
            <tr>
              <th>User</th><th>Email</th><th>City</th><th>Phone</th><th>Role</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => {
              const me = auth.user.id === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="nav__avatar" style={{ width: 32, height: 32, fontSize: 13, background: u.role === "admin" ? "var(--pink)" : "var(--blue)" }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>@{u.username} {me && <span className="muted" style={{ fontWeight: 400, fontSize: 11 }}>(you)</span>}</div>
                        <div className="mono muted" style={{ fontSize: 11 }}>{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td className="muted">{u.city || "—"}</td>
                  <td className="muted">{u.phoneNumber || "—"}</td>
                  <td>
                    <select className="select" value={u.role} style={{ minWidth: 100 }}
                            disabled={me}
                            onChange={(e) => changeRole(u, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn--danger btn--sm" onClick={() => remove(u)} disabled={me}>
                      <IconTrash size={12} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {loading && <tr><td colSpan="6"><div className="skel" style={{ height: 30 }} /></td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center" }} className="muted">No matches.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
