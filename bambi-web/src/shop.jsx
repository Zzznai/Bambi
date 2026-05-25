// shop.jsx — ShopPage: browse all listings with filters, sort, pagination
import React from 'react';
import api from './api.js';
import { useApi, ListingCard, Pagination, Empty, PageWrap, StarRating } from './components.jsx';
import { navigate } from './router.js';
import { IconSearch, IconSort, IconCheck, IconX } from './icons.jsx';

export function ShopPage() {
  const apiCall = useApi();
  const [categories, setCategories] = React.useState([]);
  const [sizes, setSizes] = React.useState([]);
  const [data, setData] = React.useState({ items: [], total: 0, page: 1, pages: 1, pageSize: 12 });
  // Stale-while-revalidate: show skeleton only on the very first load. After that,
  // keep showing the previous results (slightly dimmed) while a new fetch runs so
  // typing/sorting doesn't flash an empty grid.
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [catIds, setCatIds] = React.useState([]);
  const [selSizes, setSelSizes] = React.useState([]);
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");
  const [conditionMin, setConditionMin] = React.useState(0);
  const [onlyAvailable, setOnlyAvailable] = React.useState(true);
  const [sort, setSort] = React.useState("newest");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    apiCall(() => api.listCategories()).then((c) => c && setCategories(c));
    apiCall(() => api.listSizes()).then((s) => s && setSizes(s));
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 220);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    apiCall(() => api.listListings({
      search: searchDebounced.trim() || undefined,
      categoryIds: catIds,
      sizes: selSizes,
      priceMin: priceMin !== "" ? Number(priceMin) : undefined,
      priceMax: priceMax !== "" ? Number(priceMax) : undefined,
      conditionMin: conditionMin > 0 ? conditionMin : undefined,
      onlyAvailable,
      sort,
      page,
      pageSize: 12,
    })).then((res) => {
      if (cancelled) return;
      if (res) setData(res);
      setRefreshing(false);
      setInitialLoading(false);
    });
    return () => { cancelled = true; };
  }, [searchDebounced, catIds, selSizes, priceMin, priceMax, conditionMin, onlyAvailable, sort, page]);

  React.useEffect(() => { setPage(1); }, [searchDebounced, catIds, selSizes, priceMin, priceMax, conditionMin, onlyAvailable, sort]);

  const toggle = (arr, setArr, v) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const activeFilterCount =
    (searchDebounced ? 1 : 0) + catIds.length + selSizes.length +
    (priceMin !== "" ? 1 : 0) + (priceMax !== "" ? 1 : 0) +
    (conditionMin > 0 ? 1 : 0);

  const resetAll = () => {
    setSearch(""); setCatIds([]); setSelSizes([]); setPriceMin(""); setPriceMax("");
    setConditionMin(0); setOnlyAvailable(true); setSort("newest"); setPage(1);
  };

  return (
    <PageWrap wide>
      <div className="page-header">
        <div>
          <div className="row" style={{ gap: 10 }}>
            <h1>Shop the rack</h1>
            <span className="sticker sticker--lime sticker--tilt-r">fresh drops daily</span>
          </div>
          <p className="page-header__sub">
            {initialLoading ? "Loading…" : `${data.total} item${data.total === 1 ? "" : "s"} in the closet right now`}
          </p>
        </div>
      </div>

      <div className="shop">
        <aside className="filters">
          <div className="card" style={{ padding: 14 }}>
            <div className="row" style={{ gap: 8 }}>
              <IconSearch size={16} />
              <input
                className="input"
                style={{ padding: "8px 10px", boxShadow: "none", border: "none" }}
                placeholder="Search title, seller…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filters__group">
            <div className="filters__title">Category</div>
            <div className="chip-row">
              {categories.map(c => (
                <button key={c.id}
                  className={`chip ${catIds.includes(c.id) ? "chip--on" : ""}`}
                  onClick={() => toggle(catIds, setCatIds, c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <div className="filters__title">Size</div>
            <div className="chip-row">
              {sizes.map(s => (
                <button key={s}
                  className={`chip ${selSizes.includes(s) ? "chip--on" : ""}`}
                  onClick={() => toggle(selSizes, setSelSizes, s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <div className="filters__title">Price (€)</div>
            <div className="range-row">
              <input className="input" type="number" min="0" placeholder="min"
                     value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
              <span className="muted">–</span>
              <input className="input" type="number" min="0" placeholder="max"
                     value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
            </div>
          </div>

          <div className="filters__group">
            <div className="filters__title">Min condition</div>
            <div className="row" style={{ gap: 10 }}>
              <StarRating value={conditionMin} onChange={(v) => setConditionMin(conditionMin === v ? 0 : v)} size={22} />
              {conditionMin > 0 && <button className="btn btn--ghost btn--sm" onClick={() => setConditionMin(0)}>clear</button>}
            </div>
          </div>

          <div className="filters__group">
            <label className="checkbox-row">
              <span className={`checkbox ${onlyAvailable ? "checkbox--on" : ""}`}>
                {onlyAvailable && <IconCheck size={14} />}
              </span>
              <input type="checkbox" style={{ display: "none" }} checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
              <span style={{ fontSize: 14, fontWeight: 600 }} onClick={() => setOnlyAvailable(!onlyAvailable)}>Available only</span>
            </label>
          </div>

          {activeFilterCount > 0 && (
            <button className="btn btn--ghost btn--sm" onClick={resetAll}>
              <IconX size={14} /> Reset {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
            </button>
          )}
        </aside>

        <div>
          <div className="shop__header">
            <div className="shop__results">
              {data.total > 0 && <>Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.total, data.page * data.pageSize)} of {data.total}</>}
            </div>
            <div className="shop__controls">
              <div className="row" style={{ gap: 6 }}>
                <IconSort size={16} />
                <select className="select" style={{ minWidth: 180 }} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="condition_desc">Best condition</option>
                </select>
              </div>
            </div>
          </div>

          {initialLoading ? (
            <div className="grid-listings">
              {Array.from({ length: 8 }, (_, i) =>
                <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div className="skel" style={{ aspectRatio: "4/5", borderRadius: 0 }} />
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skel" style={{ height: 16, width: "80%" }} />
                    <div className="skel" style={{ height: 12, width: "50%" }} />
                  </div>
                </div>
              )}
            </div>
          ) : data.items.length === 0 && !refreshing ? (
            <Empty title="No matches in the rack"
                   hint="Try clearing some filters or searching for something else."
                   action={<button className="btn btn--pink" onClick={resetAll}>Reset filters</button>} />
          ) : (
            <div style={{
              opacity: refreshing ? 0.55 : 1,
              transition: "opacity 120ms ease",
              pointerEvents: refreshing ? "none" : "auto",
            }}>
              <div className="grid-listings">
                {data.items.map(l =>
                  <ListingCard key={l.id} listing={l} onClick={() => navigate("/listing/" + l.id)} />
                )}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </PageWrap>
  );
}
