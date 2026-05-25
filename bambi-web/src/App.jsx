// App.jsx — Root: hash routing + AuthProvider + ToastProvider + Tweaks
import React from 'react';
import { AuthProvider } from './auth-context.jsx';
import { ToastProvider, PageWrap, Empty } from './components.jsx';
import { Navbar } from './nav.jsx';
import { useHashRoute } from './router.js';
import { TweaksPanel, TweakSection, TweakSelect, useTweaks } from './tweaks-panel.jsx';
import { ShopPage } from './shop.jsx';
import { ListingPage } from './listing.jsx';
import { CreateListingPage, EditListingPage } from './create-edit.jsx';
import { MyListingsPage } from './my-listings.jsx';
import { MyPurchasesPage } from './my-purchases.jsx';
import { MySalesPage } from './my-sales.jsx';
import { UserProfilePage } from './user-profile.jsx';
import { LoginPage } from './login.jsx';
import { RegisterPage } from './register.jsx';
import { AdminPanel } from './admin.jsx';

// ====================== Font pairings (Tweaks) ======================
const FONT_PAIRS = /*EDITMODE-BEGIN*/{
  "pair": "bricolage"
}/*EDITMODE-END*/;

const PAIR_OPTIONS = {
  bricolage: {
    label: "Bricolage × Space Grotesk",
    display: "'Bricolage Grotesque', 'Arial Black', sans-serif",
    body: "'Space Grotesk', system-ui, sans-serif",
    google: ["Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800", "Space+Grotesk:wght@400;500;600;700"],
  },
  rubik: {
    label: "Rubik Mono × DM Sans",
    display: "'Rubik Mono One', 'Arial Black', sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    google: ["Rubik+Mono+One", "DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700"],
  },
  archivo: {
    label: "Archivo Black × Manrope",
    display: "'Archivo Black', 'Arial Black', sans-serif",
    body: "'Manrope', system-ui, sans-serif",
    google: ["Archivo+Black", "Manrope:wght@400;500;600;700"],
  },
  climate: {
    label: "Climate Crisis × Inter Tight",
    display: "'Climate Crisis', 'Arial Black', sans-serif",
    body: "'Inter Tight', system-ui, sans-serif",
    google: ["Climate+Crisis", "Inter+Tight:wght@400;500;600;700"],
  },
  zilla: {
    label: "Zilla Slab × Outfit",
    display: "'Zilla Slab', 'Times New Roman', serif",
    body: "'Outfit', system-ui, sans-serif",
    google: ["Zilla+Slab:wght@700;900", "Outfit:wght@400;500;600;700"],
  },
};

function ensureGoogleFonts(pairKey) {
  const pair = PAIR_OPTIONS[pairKey];
  if (!pair) return;
  const id = "gfont-" + pairKey;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?" + pair.google.map(g => "family=" + g).join("&") + "&display=swap";
  document.head.appendChild(link);
}

function applyFontPair(pairKey) {
  const pair = PAIR_OPTIONS[pairKey] || PAIR_OPTIONS.bricolage;
  ensureGoogleFonts(pairKey);
  document.documentElement.style.setProperty("--font-display", pair.display);
  document.documentElement.style.setProperty("--font-body", pair.body);
}

// ====================== Tweaks panel ======================
function BambiTweaks() {
  const [t, setTweak] = useTweaks(FONT_PAIRS);
  React.useEffect(() => { applyFontPair(t.pair); }, [t.pair]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Font pairing">
        <TweakSelect label="Type system"
                     value={t.pair}
                     onChange={(v) => setTweak("pair", v)}
                     options={Object.entries(PAIR_OPTIONS).map(([k, v]) => ({ value: k, label: v.label }))} />
        <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: 0 }}>
          Display × body. Both load from Google Fonts on the fly.
        </p>
      </TweakSection>
    </TweaksPanel>
  );
}

// Preload the default pair on first mount so titles render correctly.
applyFontPair(FONT_PAIRS.pair);

// ====================== Router shell ======================
function Router() {
  const route = useHashRoute();
  const path = route.path;

  if (path === "/" || path === "/shop") return <ShopPage />;
  if (path === "/login") return <LoginPage />;
  if (path === "/register") return <RegisterPage />;
  if (path === "/sell" || path === "/create") return <CreateListingPage />;
  if (path === "/my-listings") return <MyListingsPage />;
  if (path === "/my-purchases") return <MyPurchasesPage />;
  if (path === "/my-sales" || path === "/orders") return <MySalesPage />;
  if (path === "/admin") return <AdminPanel />;

  const userMatch = path.match(/^\/user\/(.+)$/);
  if (userMatch) return <UserProfilePage id={userMatch[1]} />;

  const editMatch = path.match(/^\/edit\/(.+)$/);
  if (editMatch) return <EditListingPage id={editMatch[1]} />;

  const listingMatch = path.match(/^\/listing\/(.+)$/);
  if (listingMatch) return <ListingPage id={listingMatch[1]} />;

  return (
    <PageWrap>
      <Empty title="Page not found" hint={"No route for: " + path}
             action={<a href="#/shop" className="btn btn--pink">Back to the shop</a>} />
    </PageWrap>
  );
}

// ====================== App ======================
function Footer() {
  return (
    <footer style={{ marginTop: "auto", borderTop: "2.5px solid var(--ink)", background: "var(--cream-2)" }}>
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="brand__sticker" style={{ fontSize: 16 }}>bambi</span>
          <span className="muted" style={{ fontSize: 13 }}>secondhand done loud, since '24</span>
        </div>
        <div className="mono muted" style={{ fontSize: 12 }}>prototype build · /shop · /admin · /sell</div>
      </div>
    </footer>
  );
}

export default function App() {
  const route = useHashRoute();
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app">
          <Navbar route={route} />
          <Router />
          <Footer />
        </div>
        <BambiTweaks />
      </ToastProvider>
    </AuthProvider>
  );
}
