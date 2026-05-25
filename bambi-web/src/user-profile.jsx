// user-profile.jsx — UserProfilePage: view user details and their listings
import React from 'react';
import api from './api.js';
import { useApi, PageWrap, Empty, ListingCard } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';
import { IconChevL, IconEdit, IconTrash } from './icons.jsx';

export function UserProfilePage({ id }) {
  const apiCall = useApi();
  const auth = useAuth();
  const [user, setUser] = React.useState(null);
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const isOwnProfile = auth.user?.id == id;

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      apiCall(() => api.getUser(id)),
      isOwnProfile ? 
        apiCall(() => api.listMyListings(1, 100)) :
        apiCall(() => api.listListings({ pageSize: 100 }))
    ]).then(([userData, listingsData]) => {
      if (userData) {
        setUser(userData);
        setEditData({
          description: userData.description || "",
          city: userData.city || "",
          phoneNumber: userData.phoneNumber || "",
          email: userData.email || "",
        });
      }
      if (listingsData?.items) {
        const userListings = isOwnProfile 
          ? listingsData.items 
          : listingsData.items.filter(l => l.sellerId == id);
        setListings(userListings);
      }
      setLoading(false);
    });
  }, [id, isOwnProfile]);

  if (loading) {
    return (
      <PageWrap>
        <div className="col" style={{ gap: 20 }}>
          <div className="skel" style={{ height: 100, borderRadius: 20 }} />
          <div className="skel" style={{ height: 200, borderRadius: 20 }} />
        </div>
      </PageWrap>
    );
  }

  if (!user) {
    return (
      <PageWrap>
        <Empty title="User not found"
               hint="This seller doesn't exist or has been removed."
               action={<a href="#/shop" className="btn btn--pink">Back to shop</a>} />
      </PageWrap>
    );
  }

  return (
    <PageWrap wide>
      <button className="btn btn--ghost btn--sm" onClick={() => window.history.back()} style={{ marginBottom: 16 }}>
        <IconChevL size={14} /> Back
      </button>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start", padding: 24, marginBottom: 30 }}>
        <div style={{ position: "relative" }}>
          {user.profilePicUrl ? (
            <img src={user.profilePicUrl} alt={user.username} style={{ width: 100, height: 100, borderRadius: 16, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: 16, background: "linear-gradient(135deg, var(--pink), var(--tangerine))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 900, color: "var(--paper)", fontFamily: "var(--font-display)" }}>
              {user.username[0].toUpperCase()}
            </div>
          )}
          {isOwnProfile && (
            <label style={{ position: "absolute", bottom: 0, right: 0, background: "var(--pink)", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 14 }}>
              📷
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSaving(true);
                const uploaded = await apiCall(() => api.uploadProfileImage(file));
                if (uploaded) {
                  setUser({ ...user, profilePicUrl: uploaded.profilePicUrl });
                }
                setSaving(false);
              }} />
            </label>
          )}
        </div>
        <div>
          {!isEditing ? (
            <>
              <h1 style={{ margin: "0 0 6px 0" }}>@{user.username}</h1>
              {user.city && <p className="muted" style={{ fontSize: 16, margin: "0 0 12px 0" }}>📍 {user.city}</p>}
              {user.description && <p style={{ fontSize: 14, margin: "0 0 12px 0" }}>{user.description}</p>}
              <div className="row" style={{ gap: 12, fontSize: 13 }}>
                {user.email && <span className="muted">📧 {user.email}</span>}
                {user.phoneNumber && <span className="muted">📱 {user.phoneNumber}</span>}
              </div>
              {user.role === "admin" && <span className="sticker sticker--lime" style={{ marginTop: 12, display: "inline-block" }}>● Admin</span>}
              {isOwnProfile && (
                <div className="row" style={{ gap: 8, marginTop: 16 }}>
                  <button className="btn btn--primary btn--sm" onClick={() => setIsEditing(true)}>✏️ Edit profile</button>
                  <a href="#/my-listings" className="btn btn--primary btn--sm">📦 My Listings</a>
                  <a href="#/my-purchases" className="btn btn--blue btn--sm">🛍️ My Purchases</a>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              setSaving(true);
              apiCall(() => api.updateUser(user.id, editData)).then((res) => {
                if (res) {
                  setUser({ ...user, ...editData });
                  setIsEditing(false);
                }
                setSaving(false);
              });
            }} className="col" style={{ gap: 12 }}>
              <div className="field">
                <label className="field__label">Bio</label>
                <textarea className="textarea" placeholder="Tell others about yourself…"
                  value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
              </div>
              <div className="field">
                <label className="field__label">City</label>
                <input className="input" placeholder="e.g. Berlin, DE"
                  value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
              </div>
              <div className="field">
                <label className="field__label">Phone</label>
                <input className="input" type="tel" placeholder="+49 123 456789"
                  value={editData.phoneNumber} onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })} />
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="input" type="email" placeholder="your@email.com"
                  value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
              </div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <button className="btn btn--primary" disabled={saving}>Save</button>
                <button className="btn btn--ghost" type="button" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <div style={{ marginBottom: 30 }}>
          <button className="btn btn--ghost" onClick={() => {
            if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
              apiCall(() => api.deleteAccount()).then(() => {
                auth.logout();
                navigate("/shop");
              });
            }
          }} style={{ color: "var(--ink-soft)" }}>
            Delete account
          </button>
        </div>
      )}

      <div style={{ marginBottom: 30 }}>
        <div className="section-head">
          <h2>Active listings</h2>
          <span className="sticker sticker--lime sticker--tilt-l">{listings.length}</span>
        </div>
        {listings.length === 0 ? (
          <Empty title="No listings yet" hint={isOwnProfile ? "Create your first listing to get started." : "This seller hasn't listed anything yet."} />
        ) : (
          <div className="grid-listings">
            {listings.map(l =>
              <ListingCard key={l.id} listing={l} onClick={() => navigate("/listing/" + l.id)} />
            )}
          </div>
        )}
      </div>
    </PageWrap>
  );
}
