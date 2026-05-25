// my-listings.jsx — MyListingsPage
function MyListingsPage() {
  const apiCall = window.useApi();
  const toast = window.useToast();
  const auth = window.useAuth();
  const confirm = window.useConfirm();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all"); // all | available | sold

  React.useEffect(() => {
    if (!auth.isLoggedIn) { window.navigate("/login"); return; }
    if (auth.isAdmin) { window.navigate("/admin"); return; }
    load();
  }, [auth.isLoggedIn, auth.isAdmin]);

  const load = () => {
    setLoading(true);
    apiCall(() => window.BambiAPI.listListings({ sellerId: auth.user.id, pageSize: 200, sort: "newest" }))
      .then((res) => { if (res) setItems(res.items); setLoading(false); });
  };

  const handleDelete = async (l) => {
    const ok = await confirm.ask({
      title: "Delete this listing?",
      message: `"${l.title}" will be removed permanently.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await apiCall(() => window.BambiAPI.deleteListing(l.id));
    if (res) {
      toast.ok("Deleted.");
      load();
    }
  };

  const filtered = items.filter(l =>
    filter === "all" ? true : filter === "available" ? l.status === "available" : l.status === "sold"
  );

  const totals = {
    all: items.length,
    available: items.filter(l => l.status === "available").length,
    sold: items.filter(l => l.status === "sold").length,
  };

  return (
    <PageWrap wide>
      {confirm.node}
      <div className="page-header">
        <div className="page-header__title">
          <h1>My listings</h1>
          <span className="sticker sticker--lime sticker--tilt-r">{totals.all} total</span>
        </div>
        <a href="#/sell" className="btn btn--pink"><IconPlus size={16} /> New listing</a>
      </div>

      <div className="tabs">
        {[
          ["all", "All", totals.all],
          ["available", "Available", totals.available],
          ["sold", "Sold", totals.sold],
        ].map(([k, label, n]) =>
          <button key={k} className={`tab ${filter === k ? "tab--on" : ""}`} onClick={() => setFilter(k)}>
            {label} <span className="muted">({n})</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid-listings">
          {Array.from({ length: 6 }, (_, i) =>
            <div key={i} className="skel" style={{ aspectRatio: "4/5", borderRadius: 20 }} />
          )}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="No listings yet"
               hint="Post your first piece and start clearing out the closet."
               action={<a href="#/sell" className="btn btn--pink"><IconPlus size={16} /> List something</a>} />
      ) : (
        <div className="grid-listings">
          {filtered.map(l =>
            <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ListingCard listing={l} onClick={() => window.navigate("/listing/" + l.id)} />
              <div className="row" style={{ gap: 8 }}>
                <a href={`#/edit/${l.id}`} className="btn btn--ghost btn--sm" style={{ flex: 1 }}>
                  <IconEdit size={13} /> Edit
                </a>
                <button className="btn btn--danger btn--sm" style={{ flex: 1 }} onClick={() => handleDelete(l)}>
                  <IconTrash size={13} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrap>
  );
}
window.MyListingsPage = MyListingsPage;
