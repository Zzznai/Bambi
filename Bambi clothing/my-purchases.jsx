// my-purchases.jsx — MyPurchasesPage
function MyPurchasesPage() {
  const apiCall = window.useApi();
  const auth = window.useAuth();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.isLoggedIn) { window.navigate("/login"); return; }
    if (auth.isAdmin) { window.navigate("/admin"); return; }
    apiCall(() => window.BambiAPI.listListings({ buyerId: auth.user.id, pageSize: 200, sort: "newest" }))
      .then((res) => { if (res) setItems(res.items); setLoading(false); });
  }, [auth.isLoggedIn]);

  const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <PageWrap wide>
      <div className="page-header">
        <div className="page-header__title">
          <h1>My purchases</h1>
          <span className="sticker sticker--blue sticker--tilt-l">{items.length} item{items.length === 1 ? "" : "s"}</span>
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
        <div className="col" style={{ gap: 14 }}>
          {items.map(l => {
            // Mock status timeline based on time-since-purchase
            const daysAgo = Math.floor((Date.now() - (l.soldAt || Date.now())) / (1000 * 60 * 60 * 24));
            const status = daysAgo >= 7 ? "Delivered" : daysAgo >= 3 ? "Shipped" : daysAgo >= 1 ? "Packed" : "Confirmed";
            const statusColor = status === "Delivered" ? "var(--good)" : status === "Shipped" ? "var(--blue)" : status === "Packed" ? "var(--tangerine)" : "var(--pink)";

            return (
              <article key={l.id} className="card" style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 16, alignItems: "center", cursor: "pointer" }}
                       onClick={() => window.navigate("/listing/" + l.id)}>
                <div style={{ width: 100, height: 120, borderRadius: 12, border: "2.5px solid var(--ink)", overflow: "hidden" }}>
                  <img src={l.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <h3>{l.title}</h3>
                  <div className="row" style={{ gap: 12, fontSize: 13, color: "var(--ink-soft)" }}>
                    <span>Size {l.size}</span>
                    <span>·</span>
                    <span>from @{l.sellerUsername}</span>
                    <span>·</span>
                    <span>{l.sellerCity}</span>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 4 }}>
                    <span className="sticker" style={{ background: statusColor, color: "var(--paper)" }}>● {status}</span>
                    <span className="muted" style={{ fontSize: 12 }}>Bought {fmt(l.soldAt)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26 }}>€{l.price}</div>
                  <span className="mono muted" style={{ fontSize: 11 }}>#{l.id}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}
window.MyPurchasesPage = MyPurchasesPage;
