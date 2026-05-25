// create-edit.jsx — CreateListingPage + EditListingPage (share a form component)

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];

function ListingForm({ initial, onSubmit, submitLabel, busy }) {
  const [title, setTitle] = React.useState(initial?.title || "");
  const [description, setDescription] = React.useState(initial?.description || "");
  const [price, setPrice] = React.useState(initial?.price != null ? String(initial.price) : "");
  const [size, setSize] = React.useState(initial?.size || "");
  const [condition, setCondition] = React.useState(initial?.condition || 0);
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId || "");
  const [images, setImages] = React.useState(initial?.images || []);
  const [categories, setCategories] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState(false);
  const apiCall = window.useApi();
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    apiCall(() => window.BambiAPI.listCategories()).then((c) => c && setCategories(c));
  }, []);

  const validate = () => {
    const errs = {};
    if (!title.trim() || title.length < 4) errs.title = "Min 4 characters.";
    if (title.length > 90) errs.title = "Max 90 characters.";
    if (!description.trim() || description.length < 12) errs.description = "Tell buyers more (min 12 chars).";
    if (description.length > 800) errs.description = "Max 800 characters.";
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0) errs.price = "Enter a price above €0.";
    if (p > 99999) errs.price = "Max €99,999.";
    if (!size.trim()) errs.size = "Size is required.";
    if (!condition) errs.condition = "Pick a condition (1–5 stars).";
    if (!categoryId) errs.categoryId = "Pick a category.";
    if (!images.length) errs.images = "Add at least one image.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ title: title.trim(), description: description.trim(), price: Number(price), size: size.trim(), condition, categoryId, images });
  };

  React.useEffect(() => { if (touched) setErrors(validate()); }, [title, description, price, size, condition, categoryId, images]);

  // Image upload
  const handleFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, 8 - images.length);
    files.forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setImages((cur) => [...cur, reader.result]);
      reader.readAsDataURL(f);
    });
  };
  const removeImg = (i) => setImages((cur) => cur.filter((_, idx) => idx !== i));
  const makeCover = (i) => setImages((cur) => {
    if (i === 0) return cur;
    const next = [...cur];
    const [picked] = next.splice(i, 1);
    return [picked, ...next];
  });

  return (
    <form onSubmit={handleSubmit} className="col" style={{ gap: 22 }}>
      <div className="field">
        <label className="field__label">Title</label>
        <input className={`input ${errors.title ? "input--err" : ""}`}
               placeholder="e.g. Vintage Levi's 501, mid-blue"
               value={title} onChange={(e) => setTitle(e.target.value)} />
        {errors.title ? <span className="field__error">{errors.title}</span> : <span className="field__hint">{title.length}/90</span>}
      </div>

      <div className="field">
        <label className="field__label">Description</label>
        <textarea className={`textarea ${errors.description ? "textarea--err" : ""}`}
                  placeholder="Be honest: fit, fading, flaws, measurements…"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
        {errors.description ? <span className="field__error">{errors.description}</span> : <span className="field__hint">{description.length}/800</span>}
      </div>

      <div className="row-wrap" style={{ gap: 16 }}>
        <div className="field" style={{ flex: "1 1 200px" }}>
          <label className="field__label">Price (€)</label>
          <input type="number" min="1" step="1"
                 className={`input ${errors.price ? "input--err" : ""}`}
                 value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          {errors.price && <span className="field__error">{errors.price}</span>}
        </div>

        <div className="field" style={{ flex: "1 1 200px" }}>
          <label className="field__label">Size</label>
          <input className={`input ${errors.size ? "input--err" : ""}`}
                 value={size} onChange={(e) => setSize(e.target.value)}
                 placeholder="e.g. M, W30 L32, EU 40, OS" list="size-suggest" />
          <datalist id="size-suggest">
            {SIZE_PRESETS.map(s => <option key={s} value={s} />)}
          </datalist>
          {errors.size && <span className="field__error">{errors.size}</span>}
        </div>

        <div className="field" style={{ flex: "1 1 220px" }}>
          <label className="field__label">Category</label>
          <select className={`select ${errors.categoryId ? "select--err" : ""}`}
                  value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Pick one…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="field__error">{errors.categoryId}</span>}
        </div>
      </div>

      <div className="field">
        <label className="field__label">Condition</label>
        <div className="row" style={{ gap: 14 }}>
          <StarRating value={condition} onChange={setCondition} size={28} />
          <span className="muted">
            {["pick one", "Worn", "Fair", "Good", "Like-new", "New"][condition] || "pick one"}
          </span>
        </div>
        {errors.condition && <span className="field__error">{errors.condition}</span>}
      </div>

      <div className="field">
        <label className="field__label">Images <span className="muted" style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>— first one is the cover</span></label>
        <div className="uploader">
          <div className="upload-grid">
            {images.map((src, i) =>
              <div key={i} className="upload-preview">
                <img src={src} alt="" />
                {i === 0 ? (
                  <span className="upload-preview__cover">COVER</span>
                ) : (
                  <button type="button" className="upload-preview__cover" style={{ cursor: "pointer", background: "var(--lime)", color: "var(--ink)" }}
                          onClick={() => makeCover(i)}>SET COVER</button>
                )}
                <button type="button" className="upload-preview__x" onClick={() => removeImg(i)}>
                  <IconX size={12} />
                </button>
              </div>
            )}
            {images.length < 8 && (
              <button type="button" className="upload-tile" onClick={() => fileInputRef.current?.click()}>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <IconPlus size={20} />
                  add image
                </span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                 onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          <p className="muted" style={{ fontSize: 12 }}>PNG, JPG, WebP. Up to 8 images. Drag to reorder by clicking SET COVER on a thumbnail.</p>
        </div>
        {errors.images && <span className="field__error">{errors.images}</span>}
      </div>

      <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
        <button type="button" className="btn btn--ghost" onClick={() => window.history.back()}>Cancel</button>
        <button type="submit" className="btn btn--pink btn--lg" disabled={busy}>
          <IconCheck size={16} /> {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function CreateListingPage() {
  const apiCall = window.useApi();
  const toast = window.useToast();
  const auth = window.useAuth();
  const [busy, setBusy] = React.useState(false);

  // Guard — admins can't sell
  React.useEffect(() => {
    if (!auth.isLoggedIn) window.navigate("/login");
    else if (auth.isAdmin) window.navigate("/admin");
  }, [auth.isLoggedIn, auth.isAdmin]);
  if (!auth.isLoggedIn || auth.isAdmin) return null;

  const handleSubmit = async (data) => {
    setBusy(true);
    const res = await apiCall(() => window.BambiAPI.createListing(data));
    setBusy(false);
    if (res) {
      toast.ok("Listed! It's now in the rack.");
      window.navigate("/listing/" + res.id);
    }
  };

  return (
    <PageWrap narrow>
      <div className="page-header">
        <div className="page-header__title">
          <h1>List something</h1>
          <span className="sticker sticker--pink sticker--tilt-r">new drop</span>
        </div>
      </div>
      <div className="card card--lg">
        <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" busy={busy} />
      </div>
    </PageWrap>
  );
}

function EditListingPage({ id }) {
  const apiCall = window.useApi();
  const toast = window.useToast();
  const auth = window.useAuth();
  const [listing, setListing] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.isLoggedIn) { window.navigate("/login"); return; }
    if (auth.isAdmin) { window.navigate("/admin"); return; }
    apiCall(() => window.BambiAPI.getListing(id)).then((l) => {
      if (!l) return;
      if (l.sellerId !== auth.user.id) {
        toast.err("You can only edit your own listings.");
        window.navigate("/listing/" + id);
        return;
      }
      setListing(l);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageWrap narrow><div className="skel" style={{ height: 400, borderRadius: 20 }} /></PageWrap>;
  if (!listing) return null;

  const handleSubmit = async (data) => {
    setBusy(true);
    const res = await apiCall(() => window.BambiAPI.updateListing(id, data));
    setBusy(false);
    if (res) {
      toast.ok("Updated.");
      window.navigate("/listing/" + id);
    }
  };

  return (
    <PageWrap narrow>
      <div className="page-header">
        <div className="page-header__title">
          <h1>Edit listing</h1>
          <span className="sticker sticker--blue sticker--tilt-l">editing #{listing.id}</span>
        </div>
      </div>
      <div className="card card--lg">
        <ListingForm initial={listing} onSubmit={handleSubmit} submitLabel="Save changes" busy={busy} />
      </div>
    </PageWrap>
  );
}

Object.assign(window, { CreateListingPage, EditListingPage });
