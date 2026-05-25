// components.jsx — shared UI primitives + ToastHost + ListingCard + StarRating

// =========== Toast host ===========
const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const idRef = React.useRef(1);
  const push = React.useCallback((kind, message) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 4200);
  }, []);
  const value = React.useMemo(() => ({
    ok: (m) => push("ok", m),
    err: (m) => push("err", m),
    info: (m) => push("info", m),
  }), [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-stack">
        {toasts.map(t =>
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() {
  const v = React.useContext(ToastCtx);
  if (!v) throw new Error("useToast outside provider");
  return v;
}

// =========== API call helper with global error handling ===========
// Wraps any api.* call; on rejection calls toast.err with a friendly message.
function useApi() {
  const toast = useToast();
  const auth = window.useAuth();
  return React.useCallback(async (fn, opts = {}) => {
    try {
      return await fn();
    } catch (e) {
      const msg = e?.message || "Something went wrong. Try again.";
      if (e?.status === 401) {
        auth.logout();
        toast.err("Your session ended. Please log in again.");
        window.navigate("/login");
      } else if (!opts.silent) {
        toast.err(msg);
      }
      if (opts.rethrow) throw e;
      return null;
    }
  }, [toast, auth]);
}

// =========== Star rating ===========
function StarRating({ value = 0, max = 5, size = 18, onChange, readOnly = false }) {
  return (
    <div className={`stars ${size >= 22 ? "stars--lg" : ""}`}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const on = n <= value;
        return (
          <span key={n}
                style={{ cursor: readOnly ? "default" : "pointer", display: "inline-flex" }}
                onClick={() => !readOnly && onChange && onChange(n)}>
            <IconStar on={on} size={size} />
          </span>
        );
      })}
    </div>
  );
}

// =========== Modal ===========
function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 24 }}>{title}</h2>
            <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
          </div>
        )}
        <div>{children}</div>
        {actions && <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}

// =========== Empty state ===========
function Empty({ title, hint, action }) {
  return (
    <div className="empty">
      <div className="sticker sticker--pink sticker--tilt-l">Nothing here</div>
      <h2 style={{ fontSize: 24 }}>{title}</h2>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  );
}

// =========== Listing card ===========
function ListingCard({ listing, onClick }) {
  const cover = listing.images?.[0];
  const conditionLabel = ["", "Worn", "Fair", "Good", "Like-new", "New"][listing.condition] || "—";
  return (
    <article className="listing-card" onClick={onClick}>
      <div className="listing-card__media">
        {cover ? <img src={cover} alt={listing.title} loading="lazy" /> : <div className="ph" style={{ background: "var(--cream-2)" }}>no image</div>}
        <div className="listing-card__pricetag">€{listing.price}</div>
        {listing.status === "sold" && (
          <div className="listing-card__sold"><span>SOLD</span></div>
        )}
      </div>
      <div className="listing-card__body">
        <div className="listing-card__title">{listing.title}</div>
        <div className="listing-card__meta">
          <span>{listing.size}</span>
          <span>·</span>
          <span>{listing.category?.name || "—"}</span>
        </div>
        <div className="listing-card__bottom">
          <StarRating value={listing.condition} size={14} readOnly />
          <span className="muted" style={{ fontSize: 12 }}>@{listing.sellerUsername}</span>
        </div>
      </div>
    </article>
  );
}

// =========== Pagination ===========
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const items = [];
  const pushRange = (a, b) => { for (let i = a; i <= b; i++) items.push(i); };
  if (pages <= 7) pushRange(1, pages);
  else {
    items.push(1);
    if (page > 3) items.push("…");
    pushRange(Math.max(2, page - 1), Math.min(pages - 1, page + 1));
    if (page < pages - 2) items.push("…");
    items.push(pages);
  }
  return (
    <div className="pagination">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}><IconChevL size={16} /></button>
      {items.map((it, i) =>
        it === "…"
          ? <button key={i} disabled style={{ background: "transparent", border: "none", boxShadow: "none" }}>…</button>
          : <button key={i} className={it === page ? "on" : ""} onClick={() => onChange(it)}>{it}</button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}><IconChevR size={16} /></button>
    </div>
  );
}

// =========== Page transition wrapper ===========
function PageWrap({ children, narrow, wide }) {
  return <main className={`page ${narrow ? "page--narrow" : ""} ${wide ? "page--wide" : ""}`}>{children}</main>;
}

// =========== Confirm dialog hook ===========
function useConfirm() {
  const [state, setState] = React.useState(null);
  const ask = React.useCallback(({ title, message, danger, confirmLabel = "Confirm" }) =>
    new Promise((resolve) => {
      setState({ title, message, danger, confirmLabel, resolve });
    }), []);
  const node = state ? (
    <Modal open title={state.title} onClose={() => { state.resolve(false); setState(null); }}
      actions={
        <>
          <button className="btn btn--ghost" onClick={() => { state.resolve(false); setState(null); }}>Cancel</button>
          <button className={`btn ${state.danger ? "btn--danger" : "btn--primary"}`} onClick={() => { state.resolve(true); setState(null); }}>{state.confirmLabel}</button>
        </>
      }>
      <p>{state.message}</p>
    </Modal>
  ) : null;
  return { ask, node };
}

Object.assign(window, {
  ToastProvider, useToast, useApi,
  StarRating, Modal, Empty, ListingCard, Pagination, PageWrap, useConfirm,
});
