// my-purchases.jsx — MyPurchasesPage
import React from 'react';
import api from './api.js';
import { useApi, PageWrap, Empty } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';

const PURCHASE_STATUS_COLORS = {
  "Pending": "var(--tangerine)",
  "Confirmed": "var(--pink)",
  "Shipped": "var(--blue)",
  "Delivered": "var(--good)",
};

export function MyPurchasesPage() {
  const apiCall = useApi();
  const auth = useAuth();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    if (!auth.isLoggedIn) { navigate("/login"); return; }
    if (auth.isAdmin) { navigate("/admin"); return; }
  }, [auth.isLoggedIn, auth.isAdmin]);

  React.useEffect(() => {
    if (!auth.isLoggedIn) return;
    setLoading(true);
    const params = {
      page,
      pageSize,
      ...(statusFilter && { status: statusFilter })
    };
    apiCall(() => api.listMyPurchases(params))
      .then((res) => { 
        if (res) {
          setItems(res.items || []);
          setTotalPages(res.totalPages || 1);
        }
        setLoading(false);
      });
  }, [auth.isLoggedIn, page, statusFilter]);

  const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const getStatusDisplay = (status) => {
    // Handle enum or string status
    if (typeof status === 'number') {
      const statusMap = { 0: "Pending", 1: "Confirmed", 2: "Shipped", 3: "Delivered" };
      return statusMap[status] || "Unknown";
    }
    return status || "Pending";
  };

  return (
    <PageWrap wide>
      <div className="page-header">
        <div className="page-header__title">
          <h1>My purchases</h1>
          <span className="sticker sticker--blue sticker--tilt-l">{items.length} item{items.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="filters__group" style={{ marginBottom: 20 }}>
        <div className="filters__title">Filter by status</div>
        <div className="chip-row">
          <button className={`chip ${!statusFilter ? "chip--on" : ""}`} onClick={() => { setStatusFilter(""); setPage(1); }}>All</button>
          {["Pending", "Confirmed", "Shipped", "Delivered"].map(s => (
            <button key={s} className={`chip ${statusFilter === s ? "chip--on" : ""}`} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-listings">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skel" style={{ aspectRatio: "4/5", borderRadius: 20 }} />)}
        </div>
      ) : items.length === 0 ? (
        <Empty title="Nothing bought yet"
               hint="Find a piece you love and grab it before someone else does."
               action={<a href="#/shop" className="btn btn--pink">Browse the rack</a>} />
      ) : (
        <>
          <div className="col" style={{ gap: 14 }}>
            {items.map(p => {
              const statusDisplay = getStatusDisplay(p.status);
              const statusColor = PURCHASE_STATUS_COLORS[statusDisplay] || "var(--ink)";

              return (
                <article key={p.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, padding: 16, cursor: "pointer" }}
                         onClick={() => navigate("/listing/" + p.listingId)}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "start" }}>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", minWidth: 60, fontWeight: 500 }}>
                      Order #{p.id}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <h3 style={{ margin: 0 }}>{p.listingTitle || "Item"}</h3>
                      {p.deliveryAddress && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>📍 {p.deliveryAddress}</div>}
                      {p.note && <div style={{ fontSize: 13, color: "var(--ink-soft)", fontStyle: "italic" }}>"{p.note}"</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22 }}>€{p.pricePaid}</div>
                      <span className="muted" style={{ fontSize: 11 }}>{fmt(p.purchasedAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="sticker" style={{ background: statusColor, color: "var(--paper)", whiteSpace: "nowrap" }}>● {statusDisplay}</span>
                  </div>
                </article>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="row" style={{ gap: 12, justifyContent: "center", marginTop: 24 }}>
              <button className="btn btn--ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="muted" style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
              <button className="btn btn--ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </PageWrap>
  );
}
