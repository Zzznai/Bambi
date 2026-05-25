// nav.jsx — Top navigation
import React from 'react';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';
import { IconShield, IconLogout } from './icons.jsx';

export function Navbar({ route }) {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  // Admins manage the platform — they don't buy or sell.
  const links = [
    { href: "/shop", label: "Shop" },
    isLoggedIn && !isAdmin && { href: "/sell", label: "Sell" },
    isLoggedIn && !isAdmin && { href: "/my-listings", label: "My listings" },
    isLoggedIn && !isAdmin && { href: "/my-sales", label: "Orders" },
    isLoggedIn && !isAdmin && { href: "/my-purchases", label: "My purchases" },
  ].filter(Boolean);

  const isActive = (href) => route?.path === href || (href === "/shop" && (route?.path === "/" || route?.path?.startsWith("/listing")));

  return (
    <header className="nav">
      <div className="nav__inner">
        <a href="#/shop" className="brand">
          <span className="brand__sticker">bambi</span>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>secondhand</span>
        </a>

        <nav className="nav__links">
          {links.map(l =>
            <a key={l.href} href={"#" + l.href} className={`nav__link ${isActive(l.href) ? "nav__link--active" : ""}`}>{l.label}</a>
          )}
          {isAdmin && (
            <a href="#/admin" className={`nav__link nav__link--admin ${isActive("/admin") ? "nav__link--active" : ""}`}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <IconShield size={14} /> Admin
              </span>
            </a>
          )}
        </nav>

        {isLoggedIn ? (
          <div className="nav__user">
            <button
              className="nav__avatar"
              title={user.username}
              onClick={() => navigate(`/user/${user.id}`)}
              style={{
                cursor: "pointer",
                background: user.profilePicUrl ? `center / cover url(${JSON.stringify(user.profilePicUrl)}) no-repeat` : undefined,
                backgroundColor: user.profilePicUrl ? undefined : undefined,
                border: "none",
                padding: 0,
                color: user.profilePicUrl ? "transparent" : undefined,
              }}>
              {user.username[0].toUpperCase()}
            </button>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <button onClick={() => navigate(`/user/${user.id}`)} style={{ cursor: "pointer", background: "none", border: "none", padding: 0, fontWeight: 700, fontSize: 13, textAlign: "left", color: "var(--ink)" }}>@{user.username}</button>
              <span className="muted" style={{ fontSize: 11 }}>{user.role}</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={() => { logout(); navigate("/shop"); }}>
              <IconLogout size={14} /> Logout
            </button>
          </div>
        ) : (
          <div className="row" style={{ gap: 8 }}>
            <a href="#/login" className="btn btn--ghost btn--sm">Log in</a>
            <a href="#/register" className="btn btn--pink btn--sm">Sign up</a>
          </div>
        )}
      </div>
    </header>
  );
}
