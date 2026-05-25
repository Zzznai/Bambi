// listing.jsx — ListingPage: single listing detail
import React from 'react';
import api from './api.js';
import { useApi, useToast, useConfirm, PageWrap, StarRating } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';
import { IconChevL, IconBag, IconEdit, IconX, IconShield } from './icons.jsx';

export function ListingPage({ id }) {
  const apiCall = useApi();
  const toast = useToast();
  const auth = useAuth();
  const confirm = useConfirm();
  const [listing, setListing] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [galleryIdx, setGalleryIdx] = React.useState(0);
  const [buying, setBuying] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    apiCall(() => api.getListing(id)).then((l) => {
      if (l) setListing(l);
      setLoading(false);
    });
  }, [id]);

  React.useEffect(() => { load(); }, [load]);

  const handleBuy = async () => {
    const ok = await confirm.ask({
      title: "Buy this piece?",
      message: `You're about to buy "${listing.title}" for €${listing.price}. This will mark it as sold.`,
      confirmLabel: `Buy for €${listing.price}`,
    });
    if (!ok) return;
    setBuying(true);
    const res = await apiCall(() => api.createPurchase(listing.id, null, null));
    setBuying(false);
    if (res) {
      toast.ok("It's yours! Check My purchases for status.");
      setTimeout(() => navigate("/my-purchases"), 1500);
    }
  };

  if (loading || !listing) {
    return (
      <PageWrap>
        <div className="listing">
          <div className="skel" style={{ aspectRatio: "4/5", borderRadius: 20 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skel" style={{ height: 30, width: "70%" }} />
            <div className="skel" style={{ height: 60, width: "40%" }} />
            <div className="skel" style={{ height: 100 }} />
          </div>
        </div>
      </PageWrap>
    );
  }

  const isSeller = auth.user?.id === listing.sellerId;
  const canBuy = auth.isLoggedIn && !auth.isAdmin && !isSeller && listing.status === "available";
  const conditionLabel = ["", "Worn", "Fair", "Good", "Like-new", "New"][listing.condition];

  return (
    <PageWrap wide>
      {confirm.node}
      <button className="btn btn--ghost btn--sm" onClick={() => window.history.back()} style={{ marginBottom: 16 }}>
        <IconChevL size={14} /> Back
      </button>

      <div className="listing">
        <div className="gallery">
          <div className="gallery__main">
            {listing.images.length > 0 ? (
              <img src={listing.images[galleryIdx]} alt={listing.title} />
            ) : (
              <div style={{
                width: "100%", aspectRatio: "4/5", borderRadius: 20,
                background: "var(--cream-2)", border: "2.5px dashed var(--ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 8, color: "var(--ink-soft)",
              }}>
                <span style={{ fontSize: 48 }}>📷</span>
                <span style={{ fontWeight: 700 }}>No images yet</span>
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="gallery__thumbs">
              {listing.images.map((img, i) =>
                <button key={i}
                        className={`gallery__thumb ${i === galleryIdx ? "gallery__thumb--on" : ""}`}
                        onClick={() => setGalleryIdx(i)}>
                  <img src={img} alt="" />
                  {i === 0 && (
                    <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 9, fontWeight: 700, background: "var(--pink)", color: "var(--paper)", padding: "1px 5px", borderRadius: 4, border: "1.5px solid var(--ink)" }}>COVER</span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="detail-side">
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <span className="sticker sticker--lime sticker--tilt-l">{listing.category?.name || "Item"}</span>
              {listing.status === "sold" && <span className="sticker sticker--ink">SOLD</span>}
              {listing.status === "available" && <span className="sticker sticker--pink sticker--tilt-r">Available</span>}
            </div>
            <h1>{listing.title}</h1>
            <div className="detail-price" style={{ marginTop: 14 }}>€{listing.price}</div>
          </div>

          <div className="card detail-rows">
            <div className="detail-row">
              <span className="detail-row__label">Size</span>
              <span className="detail-row__value mono">{listing.size}</span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Condition</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StarRating value={listing.condition} readOnly size={16} />
                <span className="detail-row__value">{conditionLabel}</span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Listed</span>
              <span className="detail-row__value">{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="card">
            <button onClick={() => window.location.hash = `/user/${listing.sellerId}`} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div className="seller-card">
                {listing.sellerProfilePicUrl ? (
                  <img
                    src={listing.sellerProfilePicUrl}
                    alt={listing.sellerUsername}
                    className="seller-card__avatar"
                    style={{ objectFit: "cover", padding: 0 }}
                    onError={(e) => {
                      // If the image 404s, fall back to the initial letter.
                      e.currentTarget.outerHTML = `<div class="seller-card__avatar">${listing.sellerUsername[0].toUpperCase()}</div>`;
                    }}
                  />
                ) : (
                  <div className="seller-card__avatar">{listing.sellerUsername[0].toUpperCase()}</div>
                )}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>
                    @{listing.sellerUsername}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{listing.sellerCity}</div>
                </div>
              </div>
            </button>
          </div>

          {!auth.isLoggedIn && (
            <a href="#/login" className="btn btn--primary btn--lg btn--block">
              <IconBag size={18} /> Log in to buy
            </a>
          )}
          {auth.isLoggedIn && auth.isAdmin && (
            <div className="card" style={{ background: "var(--cream-2)", textAlign: "center", padding: 14 }}>
              <div className="row" style={{ justifyContent: "center", gap: 8 }}>
                <IconShield size={16} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Admin view — buying disabled</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Admins manage the platform but can't transact.</p>
            </div>
          )}
          {auth.isLoggedIn && !auth.isAdmin && isSeller && (
            <div className="row" style={{ gap: 8 }}>
              <a href={`#/edit/${listing.id}`} className="btn btn--lime btn--block">
                <IconEdit size={16} /> Edit listing
              </a>
            </div>
          )}
          {canBuy && (
            <button className="btn btn--pink btn--lg btn--block" onClick={handleBuy} disabled={buying}>
              <IconBag size={18} /> {buying ? "Working…" : `Buy for €${listing.price}`}
            </button>
          )}
          {auth.isLoggedIn && !auth.isAdmin && !isSeller && listing.status === "sold" && (
            <button className="btn btn--lg btn--block" disabled>
              <IconX size={16} /> No longer available
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <div className="section-head">
          <span className="sticker sticker--blue sticker--tilt-l">the details</span>
          <h2>Description</h2>
        </div>
        <div className="card card--lg" style={{ maxWidth: 800 }}>
          <p style={{ whiteSpace: "pre-wrap", fontSize: 15.5, lineHeight: 1.55 }}>{listing.description}</p>
        </div>
      </div>
    </PageWrap>
  );
}
