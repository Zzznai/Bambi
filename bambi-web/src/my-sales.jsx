// my-sales.jsx — MySalesPage: orders received for the caller's listings.
// Seller can advance status: Pending → Confirmed → Shipped → Delivered.
import React from 'react';
import api from './api.js';
import { useApi, useToast, PageWrap, Empty } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';

const STATUS_NAMES = ["Pending", "Confirmed", "Shipped", "Delivered"];
const STATUS_COLORS = {
  Pending: "var(--tangerine)",
  Confirmed: "var(--pink)",
  Shipped: "var(--blue)",
  Delivered: "var(--good)",
};

// Backend serialises PurchaseStatus enum as int by default — normalise both.
const statusName = (s) => {
  if (typeof s === "number") return STATUS_NAMES[s] || "Pending";
  return s || "Pending";
};

const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, {
  day: "numeric", month: "short", year: "numeric",
});

export function MySalesPage() {
  const apiCall = useApi();
  const toast = useToast();
  const auth = useAuth();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [savingId, setSavingId] = React.useState(null);

  React.useEffect(() => {
    if (!auth.isLoggedIn) { navigate("/login"); return; }
    if (auth.isAdmin) { navigate("/admin"); return; }
  }, [auth.isLoggedIn, auth.isAdmin]);

  const load = React.useCallback(() => {
    setLoading(true);
    apiCall(() => api.listMySales({
      page: 1,
      pageSize: 100,
      ...(statusFilter ? { status: statusFilter } : {}),
    })).then((res) => {
      if (res) setItems(res.items || []);
      setLoading(false);
    });
  }, [statusFilter]);

  React.useEffect(() => {
    if (auth.isLoggedIn && !auth.isAdmin) load();
  }, [auth.isLoggedIn, auth.isAdmin, load]);

  const changeStatus = async (purchase, nextStatus) => {
    setSavingId(purchase.id);
    const res = await apiCall(() => api.updatePurchaseStatus(purchase.id, nextStatus));
    setSavingId(null);
    if (res) {
      toast.ok(`Order #${purchase.id} → ${nextStatus}`);
      load();
    }
  };

  const totals = STATUS_NAMES.reduce((acc, name) => {
    acc[name] = items.filter((p) => statusName(p.status) === name).length;
    return acc;
  }, {});

  return (
    <PageWrap wide>
      <div className="page-header">
        <div className="page-header__title">
          <h1>Orders</h1>
          <span className="sticker sticker--pink sticker--tilt-r">{items.length} sale{items.length === 1 ? "" : "s"}</span>
        </div>
        <p className="muted">People who bought your listings. Move them through Pending → Confirmed → Shipped → Delivered.</p>
      </div>

      <div className="filters__group" style={{ marginBottom: 20 }}>
        <div className="filters__title">Filter by status</div>
        <div className="chip-row">
          <button
            className={`chip ${!statusFilter ? "chip--on" : ""}`}
            onClick={() => setStatusFilter("")}>
            All
          </button>
          {STATUS_NAMES.map((s) => (
            <button key={s}
              className={`chip ${statusFilter === s ? "chip--on" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s} <span className="muted">({totals[s] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="col" style={{ gap: 12 }}>
          {Array.from({ length: 4 }, (_, i) =>
            <div key={i} className="skel" style={{ height: 110, borderRadius: 16 }} />
          )}
        </div>
      ) : items.length === 0 ? (
        <Empty
          title="No orders yet"
          hint={statusFilter
            ? `Nothing with status ${statusFilter}.`
            : "When someone buys one of your listings it'll show up here."}
          action={statusFilter
            ? <button className="btn btn--pink" onClick={() => setStatusFilter("")}>Show all</button>
            : <a href="#/sell" className="btn btn--pink">List something</a>}
        />
      ) : (
        <div className="col" style={{ gap: 14 }}>
          {items.map((p) => {
            const status = statusName(p.status);
            const color = STATUS_COLORS[status] || "var(--ink)";
            const buyerInitial = (p.buyerUsername || "?")[0].toUpperCase();
            return (
              <article key={p.id} className="card"
                       style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center", padding: 16 }}>
                {/* Buyer avatar / item image */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.listingImageUrl ? (
                    <img src={p.listingImageUrl} alt=""
                         style={{ width: 80, height: 96, borderRadius: 12, border: "2.5px solid var(--ink)", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: 80, height: 96, borderRadius: 12, border: "2.5px dashed var(--ink)",
                      background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, color: "var(--ink-soft)",
                    }}>📦</div>
                  )}
                </div>

                {/* Middle: who, what */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{p.listingTitle || "Item"}</h3>

                  <div className="row" style={{ gap: 10 }}>
                    {p.buyerProfilePicUrl ? (
                      <img src={p.buyerProfilePicUrl} alt=""
                           style={{ width: 28, height: 28, borderRadius: 999, border: "2px solid var(--ink)", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: 28, height: 28, borderRadius: 999, background: "var(--blue)",
                        color: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12, border: "2px solid var(--ink)",
                      }}>{buyerInitial}</div>
                    )}
                    <button onClick={() => navigate(`/user/${p.buyerId}`)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", color: "var(--ink)" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>@{p.buyerUsername || "unknown"}</div>
                      {p.buyerCity && <div className="muted" style={{ fontSize: 12 }}>{p.buyerCity}</div>}
                    </button>
                  </div>

                  {p.deliveryAddress && (
                    <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>📍 {p.deliveryAddress}</div>
                  )}
                  {p.note && (
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>
                      “{p.note}”
                    </div>
                  )}
                  <div className="muted mono" style={{ fontSize: 11 }}>
                    Order #{p.id} · placed {fmt(p.purchasedAt)}
                  </div>
                </div>

                {/* Right: price, status, controls */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, minWidth: 180 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24 }}>
                    €{p.pricePaid}
                  </div>
                  <span className="sticker" style={{ background: color, color: "var(--paper)", whiteSpace: "nowrap" }}>
                    ● {status}
                  </span>
                  <select
                    className="select"
                    style={{ minWidth: 140 }}
                    value={status}
                    disabled={savingId === p.id}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next !== status) changeStatus(p, next);
                    }}>
                    {STATUS_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}
