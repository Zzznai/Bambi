// create-edit.jsx — CreateListingPage + EditListingPage (share a form component)
import React from 'react';
import api from './api.js';
import { useApi, useToast, PageWrap, StarRating } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';
import { IconX, IconPlus, IconCheck } from './icons.jsx';

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];

const normalizeFormImages = (images, imageItems = []) => {
  const source = Array.isArray(images) ? images : [];
  const mapped = (Array.isArray(imageItems) && imageItems.length ? imageItems : source)
    .map((image) => {
      const url = typeof image === "string"
        ? image
        : image?.imageUrl || image?.url || image?.ImageUrl || "";

      if (!url) return null;

      return {
        url,
        id: typeof image === "string" ? null : image?.id ?? null,
      };
    })
    .filter(Boolean);

  return mapped;
};

function ListingForm({ initial, onSubmit, submitLabel, busy }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [size, setSize] = React.useState("");
  const [condition, setCondition] = React.useState(0);
  const [categoryId, setCategoryId] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState(false);
  const apiCall = useApi();
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    apiCall(() => api.listCategories()).then((c) => c && setCategories(c));
  }, []);

  React.useEffect(() => {
    if (!initial) {
      setTitle("");
      setDescription("");
      setPrice("");
      setSize("");
      setCondition(0);
      setCategoryId("");
      setImages([]);
      setErrors({});
      setTouched(false);
      return;
    }

    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setPrice(initial.price != null ? String(initial.price) : "");
    setSize(initial.size || "");
    setCondition(initial.condition || 0);
    setCategoryId(initial.categoryId != null ? String(initial.categoryId) : "");
    setImages(normalizeFormImages(initial.images, initial.imageItems));
    setErrors({});
    setTouched(false);
  }, [initial]);

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

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, 8 - images.length);
    files.forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setImages((cur) => [...cur, { url: reader.result, id: null }]);
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
            {images.map((image, i) =>
              <div key={`${image.id ?? "new"}-${i}`} className="upload-preview">
                <img src={image.url} alt="" />
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

export function CreateListingPage() {
  const apiCall = useApi();
  const toast = useToast();
  const auth = useAuth();
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!auth.isLoggedIn) navigate("/login");
    else if (auth.isAdmin) navigate("/admin");
  }, [auth.isLoggedIn, auth.isAdmin]);
  if (!auth.isLoggedIn || auth.isAdmin) return null;

  const handleSubmit = async (data) => {
    setBusy(true);
    const images = (data.images || []).map((img) => img.url);
    const listingData = { ...data, images: undefined };
    delete listingData.images;

    const res = await apiCall(() => api.createListing(listingData));
    if (!res) {
      setBusy(false);
      return;
    }

    let uploadedCount = 0;
    let failedCount = 0;
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const base64 = images[i];
        if (!base64 || !base64.startsWith("data:")) {
          // Not a freshly picked file (e.g. an existing Cloudinary URL) — skip.
          continue;
        }
        try {
          const arr = base64.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let j = 0; j < n; j++) u8arr[j] = bstr.charCodeAt(j);
          const file = new File([u8arr], `image-${i}.${mime.split('/')[1]}`, { type: mime });

          // rethrow so failures surface — toast errors will show via apiCall.
          const result = await apiCall(() => api.uploadListingImage(res.id, file), { rethrow: true });
          if (result) uploadedCount += 1;
        } catch (err) {
          failedCount += 1;
          console.error("Image upload failed:", err);
        }
      }
    }

    setBusy(false);
    if (failedCount > 0) {
      toast.err(`Listing created, but ${failedCount} image${failedCount === 1 ? "" : "s"} failed to upload.`);
    } else {
      toast.ok("Listed! It's now in the rack.");
    }
    navigate("/listing/" + res.id);
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

export function EditListingPage({ id }) {
  const apiCall = useApi();
  const toast = useToast();
  const auth = useAuth();
  const [listing, setListing] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.isLoggedIn) { navigate("/login"); return; }
    if (auth.isAdmin) { navigate("/admin"); return; }
    apiCall(() => api.getListing(id)).then((l) => {
      if (!l) return;
      if (l.sellerId !== auth.user.id) {
        toast.err("You can only edit your own listings.");
        navigate("/listing/" + id);
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

    const imageEntries = data.images || [];
    const currentImageIds = imageEntries.filter((img) => img.id).map((img) => img.id);
    const originalImageIds = listing.imageItems?.map((img) => img.id).filter(Boolean) || [];
    const removedImageIds = originalImageIds.filter((imgId) => !currentImageIds.includes(imgId));
    const newImages = imageEntries.filter((img) => !img.id).map((img) => img.url);

    const listingData = { ...data, images: undefined };
    delete listingData.images;

    const res = await apiCall(() => api.updateListing(id, listingData));
    if (!res) {
      setBusy(false);
      return;
    }

    if (removedImageIds.length > 0) {
      for (const imageId of removedImageIds) {
        await apiCall(() => api.deleteListingImage(imageId)).catch(() => {
          toast.err("Could not remove one or more images.");
        });
      }
    }

    let failedCount = 0;
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const base64 = newImages[i];
        if (!base64 || !base64.startsWith("data:")) continue;
        try {
          const arr = base64.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let j = 0; j < n; j++) u8arr[j] = bstr.charCodeAt(j);
          const file = new File([u8arr], `image-${i}.${mime.split('/')[1]}`, { type: mime });
          await apiCall(() => api.uploadListingImage(id, file), { rethrow: true });
        } catch (err) {
          failedCount += 1;
          console.error("Image upload failed:", err);
        }
      }
    }

    setBusy(false);
    if (failedCount > 0) {
      toast.err(`Saved, but ${failedCount} new image${failedCount === 1 ? "" : "s"} failed to upload.`);
    } else {
      toast.ok("Updated.");
    }
    navigate("/listing/" + id);
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
