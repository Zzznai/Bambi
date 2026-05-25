// api.js — Mock REST API for Bambi marketplace.
// Mimics: async fetch + JWT Bearer + role-based access.
// Single api.request() function; replace internals with real fetch to ship.
//
// JWT is base64url of { sub, username, role, exp }. (Not cryptographically signed —
// this is a frontend prototype. Real server would sign with HS256.)

(function () {
  // ---------- JWT helpers ----------
  const b64url = (obj) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const b64urlDecode = (s) => {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return JSON.parse(atob(s));
  };
  const makeJwt = (user) => {
    const header = b64url({ alg: "HS256", typ: "JWT" });
    const payload = b64url({
      sub: user.id, username: user.username, role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24,
    });
    const sig = "bambisig"; // mock
    return `${header}.${payload}.${sig}`;
  };
  const decodeJwt = (token) => {
    try { return b64urlDecode(token.split(".")[1]); } catch { return null; }
  };

  // ---------- Image generation (SVG data URIs) ----------
  // Believable thrift-kit covers: solid bg + giant initials + tiny annotations.
  const palette = [
    ["#ff3d8b", "#fff4d6"], ["#c6f24c", "#1a1410"], ["#4d8dff", "#fff4d6"],
    ["#ff8b3d", "#1a1410"], ["#b572ff", "#fff4d6"], ["#1a1410", "#c6f24c"],
    ["#ffe9b3", "#1a1410"], ["#2fb37a", "#fff4d6"], ["#e0394a", "#fff4d6"],
  ];
  const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const escXml = (s) => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  const svgImg = (title, kind, idx) => {
    const [bg, fg] = palette[(hash(title) + idx) % palette.length];
    const tag = escXml(title.split(" ").slice(0, 2).join(" ").toUpperCase().slice(0, 12));
    const sub = escXml(kind.toUpperCase());
    // small decorative shapes — stickers
    const dots = Array.from({ length: 4 }, (_, i) => {
      const cx = 30 + (i * 71 + hash(title + i) % 40) % 340;
      const cy = 30 + (i * 53 + hash(title + i + "y") % 40) % 460;
      const r = 8 + (i * 3) % 6;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fg}" opacity=".18"/>`;
    }).join("");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
      <rect width='400' height='500' fill='${bg}'/>
      ${dots}
      <g fill='${fg}' font-family='Bricolage Grotesque, Arial Black, sans-serif' font-weight='900' text-anchor='middle'>
        <text x='200' y='240' font-size='56'>${tag}</text>
        <text x='200' y='285' font-size='18' letter-spacing='3' opacity='.85'>${sub}</text>
      </g>
      <g transform='translate(40 420) rotate(-6)'>
        <rect x='-2' y='-2' width='110' height='38' fill='${fg}' stroke='${bg === "#1a1410" ? "#fff4d6" : "#1a1410"}' stroke-width='3' rx='6'/>
        <text x='53' y='24' fill='${bg}' font-family='JetBrains Mono, monospace' font-weight='700' font-size='13' text-anchor='middle'>BAMBI ${idx + 1}/4</text>
      </g>
    </svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };
  const imagesFor = (title, kind, count = 3) =>
    Array.from({ length: count }, (_, i) => svgImg(title, kind, i));

  // ---------- Seed data ----------
  const CATEGORIES = [
    { id: "c1", name: "Jackets & Coats", description: "Denim, leather, puffer, overcoats", gender: "All", sortOrder: 1 },
    { id: "c2", name: "Tops & Tees",     description: "T-shirts, blouses, sweaters",       gender: "All", sortOrder: 2 },
    { id: "c3", name: "Dresses",         description: "Mini, midi, maxi, slip",            gender: "Women", sortOrder: 3 },
    { id: "c4", name: "Jeans & Pants",   description: "Denim, trousers, cargos",           gender: "All", sortOrder: 4 },
    { id: "c5", name: "Skirts",          description: "Mini, midi, pleated",               gender: "Women", sortOrder: 5 },
    { id: "c6", name: "Shoes",           description: "Sneakers, boots, heels, sandals",   gender: "All", sortOrder: 6 },
    { id: "c7", name: "Bags",            description: "Totes, crossbody, backpacks",       gender: "All", sortOrder: 7 },
    { id: "c8", name: "Accessories",     description: "Belts, scarves, jewelry",           gender: "All", sortOrder: 8 },
  ];

  const USERS = [
    { id: "u1", username: "admin",     email: "admin@bambi.shop",    password: "admin",  role: "admin", city: "Berlin" },
    { id: "u2", username: "lia.thrift",email: "lia@bambi.shop",      password: "password", role: "user", city: "Lisbon" },
    { id: "u3", username: "ko.archive",email: "ko@bambi.shop",       password: "password", role: "user", city: "Seoul" },
    { id: "u4", username: "mara.vtg",  email: "mara@bambi.shop",     password: "password", role: "user", city: "Milan" },
    { id: "u5", username: "deni.m",    email: "deni@bambi.shop",     password: "password", role: "user", city: "Brooklyn" },
    { id: "u6", username: "ruta.99",   email: "ruta@bambi.shop",     password: "password", role: "user", city: "Vilnius" },
  ];

  const seedListings = [
    { title: "Levi's 501 Original Fit", category: "c4", size: "W30 L32", price: 38, condition: 4, seller: "u2", desc: "Classic medium-wash 501s. Light fading on thighs, no holes. Some honest wear at hem cuff." },
    { title: "Carhartt Detroit Jacket", category: "c1", size: "M",       price: 95, condition: 4, seller: "u5", desc: "Brown duck canvas. Broken in but still rigid. Inner blanket lining intact." },
    { title: "Vintage Band Tee — Sonic", category: "c2", size: "L",      price: 28, condition: 3, seller: "u3", desc: "Single-stitch, soft from wear. Small pinhole near hem (pictured)." },
    { title: "Doc Martens 1460 Cherry", category: "c6", size: "EU 40",   price: 70, condition: 4, seller: "u4", desc: "Cherry red, smooth leather. Resoled once. Plenty of life left." },
    { title: "Slip Dress, Silk-blend",  category: "c3", size: "S",       price: 42, condition: 5, seller: "u6", desc: "Bias-cut, champagne color. Worn twice. Light, drapes beautifully." },
    { title: "Pleated Tennis Skirt",    category: "c5", size: "M",       price: 22, condition: 4, seller: "u2", desc: "Navy wool blend. Hidden side zip. Mid-rise, mid-thigh length." },
    { title: "Coach Leather Saddle Bag", category: "c7", size: "OS",     price: 110,condition: 4, seller: "u4", desc: "Tan, vintage 90s Coach. Brass hardware patina. Crossbody strap included." },
    { title: "Wide-Leg Cargo Pants",    category: "c4", size: "M",       price: 34, condition: 5, seller: "u3", desc: "Olive ripstop. Functional pockets. Slight relaxed taper at ankle." },
    { title: "Wool Peacoat, Navy",      category: "c1", size: "S",       price: 85, condition: 4, seller: "u6", desc: "Heavy wool, anchor buttons. Warm enough for a real winter. Lining mint." },
    { title: "Adidas Samba OG",         category: "c6", size: "UK 7",    price: 65, condition: 4, seller: "u5", desc: "White & black classic. Sole life 80%. T-toe and gum sole." },
    { title: "Cashmere Cardigan, Cream", category: "c2", size: "S",      price: 58, condition: 5, seller: "u4", desc: "Buttery soft cream cashmere. Tiny snag at back hem, otherwise perfect." },
    { title: "90s Floral Midi Dress",   category: "c3", size: "M",       price: 36, condition: 3, seller: "u2", desc: "Rayon, ditsy print. Mid-calf, short sleeves. Light fade — adds to it imo." },
    { title: "Acne Studios Scarf",      category: "c8", size: "OS",      price: 80, condition: 5, seller: "u6", desc: "Pink/grey check, oversized. Comes with original dust bag." },
    { title: "Black Denim Mini Skirt",  category: "c5", size: "S",       price: 18, condition: 4, seller: "u3", desc: "Mid-rise, raw hem. From a Tokyo vintage shop. Stretch is good." },
    { title: "Champion Reverse Weave",  category: "c2", size: "L",       price: 32, condition: 3, seller: "u5", desc: "Heather grey crewneck. Pilled but thick. Faded printed logo." },
    { title: "Margiela Tabi Mary-Janes",category: "c6", size: "EU 38",   price: 290,condition: 4, seller: "u4", desc: "Black leather, low heel. Insole replaced. Comes with extra strap." },
    { title: "Pink Suede Mini-Bag",     category: "c7", size: "OS",      price: 24, condition: 5, seller: "u2", desc: "Box-shaped, gold clasp. Tiny — phone + cards only." },
    { title: "Striped Rugby Shirt",     category: "c2", size: "M",       price: 19, condition: 3, seller: "u3", desc: "Red/cream rugby stripes, terry collar. Roomy fit, slight fade." },
    { title: "Patagonia Snap-T Fleece", category: "c1", size: "S",       price: 48, condition: 4, seller: "u6", desc: "Forest green, 90s reissue. Half-snap pullover. No pilling." },
    { title: "Vintage Lee Riders",      category: "c4", size: "W28 L30", price: 42, condition: 4, seller: "u5", desc: "USA-made, talon zip. Mid-blue with whiskering. True high rise." },
    { title: "Knit Beanie, Striped",    category: "c8", size: "OS",      price: 12, condition: 5, seller: "u2", desc: "Hand-knit, chunky stripes. Wool blend. Warm." },
    { title: "Black Maxi Slip Dress",   category: "c3", size: "M",       price: 30, condition: 4, seller: "u4", desc: "Spaghetti straps, satin, floor-length. Worn once to a wedding." },
    { title: "JNCO-style Baggy Jeans",  category: "c4", size: "W32 L32", price: 28, condition: 3, seller: "u3", desc: "Extremely wide leg. Light blue. Some hem dragging — character." },
    { title: "Birkenstock Boston Clog", category: "c6", size: "EU 39",   price: 60, condition: 4, seller: "u6", desc: "Taupe suede. Cork bed shaped to feet. Tighter strap, easy to loosen." },
  ];

  // Build listings
  let nextListingId = 1;
  const LISTINGS = seedListings.map((s, i) => {
    const id = "L" + String(nextListingId++).padStart(4, "0");
    const kind = (CATEGORIES.find(c => c.id === s.category) || {}).name || "Item";
    const images = imagesFor(s.title, kind, 3 + (i % 2));
    return {
      id,
      title: s.title,
      description: s.desc,
      price: s.price,
      size: s.size,
      condition: s.condition,
      categoryId: s.category,
      sellerId: s.seller,
      images,
      createdAt: Date.now() - (i * 1000 * 60 * 60 * 13),
      status: "available",
      buyerId: null,
      soldAt: null,
    };
  });

  // Pre-seed a couple of purchases for "lia.thrift" (u2) so MyPurchases shows data after login
  LISTINGS[3].status = "sold"; LISTINGS[3].buyerId = "u2"; LISTINGS[3].soldAt = Date.now() - 86400000 * 5;
  LISTINGS[10].status = "sold"; LISTINGS[10].buyerId = "u2"; LISTINGS[10].soldAt = Date.now() - 86400000 * 12;

  // ---------- Internal helpers ----------
  const sleep = (ms = 180 + Math.random() * 140) => new Promise(r => setTimeout(r, ms));
  let currentToken = null;
  const setToken = (t) => { currentToken = t; };
  const getToken = () => currentToken;
  const decodeCurrent = () => currentToken ? decodeJwt(currentToken) : null;

  // Authorize a route — returns the decoded payload, or throws.
  const requireAuth = () => {
    const p = decodeCurrent();
    if (!p) throw apiError(401, "Login required.");
    if (p.exp && p.exp < Date.now()) throw apiError(401, "Session expired.");
    return p;
  };
  const requireAdmin = () => {
    const p = requireAuth();
    if (p.role !== "admin") throw apiError(403, "Admins only.");
    return p;
  };
  const apiError = (status, message) => {
    const e = new Error(message);
    e.status = status;
    return e;
  };

  const usernameOf = (id) => (USERS.find(u => u.id === id) || {}).username || "unknown";
  const cityOf = (id) => (USERS.find(u => u.id === id) || {}).city || "—";

  const enrichListing = (l) => ({
    ...l,
    sellerUsername: usernameOf(l.sellerId),
    sellerCity: cityOf(l.sellerId),
    category: CATEGORIES.find(c => c.id === l.categoryId) || null,
    buyerUsername: l.buyerId ? usernameOf(l.buyerId) : null,
  });

  // ---------- Public api object ----------
  const api = {
    setToken, getToken, decodeJwt,

    async login({ username, password }) {
      await sleep();
      const u = USERS.find(x => (x.username === username || x.email === username) && x.password === password);
      if (!u) throw apiError(401, "Wrong username or password.");
      const token = makeJwt(u);
      setToken(token);
      return { token, user: { id: u.id, username: u.username, email: u.email, role: u.role, city: u.city } };
    },

    async register({ username, email, password, city }) {
      await sleep();
      if (USERS.some(u => u.username === username)) throw apiError(409, "Username already taken.");
      if (USERS.some(u => u.email === email)) throw apiError(409, "Email already registered.");
      const id = "u" + (USERS.length + 1);
      const u = { id, username, email, password, role: "user", city: city || "—" };
      USERS.push(u);
      const token = makeJwt(u);
      setToken(token);
      return { token, user: { id, username, email, role: u.role, city: u.city } };
    },

    async listCategories() {
      await sleep(120);
      return [...CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
    },

    async listListings(params = {}) {
      await sleep();
      let rows = LISTINGS.map(enrichListing);

      // Filters
      if (params.search) {
        const q = params.search.toLowerCase();
        rows = rows.filter(r =>
          r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) ||
          r.sellerUsername.toLowerCase().includes(q));
      }
      if (params.categoryIds?.length) rows = rows.filter(r => params.categoryIds.includes(r.categoryId));
      if (params.sizes?.length)       rows = rows.filter(r => params.sizes.includes(r.size));
      if (params.priceMin != null)    rows = rows.filter(r => r.price >= params.priceMin);
      if (params.priceMax != null)    rows = rows.filter(r => r.price <= params.priceMax);
      if (params.conditionMin != null) rows = rows.filter(r => r.condition >= params.conditionMin);
      if (params.onlyAvailable)       rows = rows.filter(r => r.status === "available");
      if (params.sellerId)            rows = rows.filter(r => r.sellerId === params.sellerId);
      if (params.buyerId)             rows = rows.filter(r => r.buyerId === params.buyerId);

      // Sort
      const sort = params.sort || "newest";
      const sorters = {
        newest: (a, b) => b.createdAt - a.createdAt,
        oldest: (a, b) => a.createdAt - b.createdAt,
        price_asc: (a, b) => a.price - b.price,
        price_desc: (a, b) => b.price - a.price,
        condition_desc: (a, b) => b.condition - a.condition,
      };
      rows.sort(sorters[sort] || sorters.newest);

      // Paginate
      const page = Math.max(1, params.page || 1);
      const pageSize = params.pageSize || 12;
      const total = rows.length;
      const start = (page - 1) * pageSize;
      const items = rows.slice(start, start + pageSize);
      return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
    },

    async getListing(id) {
      await sleep(160);
      const l = LISTINGS.find(x => x.id === id);
      if (!l) throw apiError(404, "Listing not found.");
      return enrichListing(l);
    },

    async createListing(data) {
      await sleep();
      const me = requireAuth();
      if (me.role === "admin") throw apiError(403, "Admins can't create listings.");
      const id = "L" + String(nextListingId++).padStart(4, "0");
      const l = {
        id,
        title: data.title,
        description: data.description,
        price: Number(data.price),
        size: data.size,
        condition: Number(data.condition),
        categoryId: data.categoryId,
        sellerId: me.sub,
        images: data.images?.length ? data.images : imagesFor(data.title, "Item", 2),
        createdAt: Date.now(),
        status: "available",
        buyerId: null,
        soldAt: null,
      };
      LISTINGS.unshift(l);
      return enrichListing(l);
    },

    async updateListing(id, data) {
      await sleep();
      const me = requireAuth();
      if (me.role === "admin") throw apiError(403, "Admins can't edit listings.");
      const l = LISTINGS.find(x => x.id === id);
      if (!l) throw apiError(404, "Listing not found.");
      if (l.sellerId !== me.sub) throw apiError(403, "You can only edit your own listings.");
      Object.assign(l, {
        title: data.title ?? l.title,
        description: data.description ?? l.description,
        price: data.price != null ? Number(data.price) : l.price,
        size: data.size ?? l.size,
        condition: data.condition != null ? Number(data.condition) : l.condition,
        categoryId: data.categoryId ?? l.categoryId,
        images: data.images?.length ? data.images : l.images,
      });
      return enrichListing(l);
    },

    async deleteListing(id) {
      await sleep();
      const me = requireAuth();
      if (me.role === "admin") throw apiError(403, "Admins can't delete listings.");
      const idx = LISTINGS.findIndex(x => x.id === id);
      if (idx < 0) throw apiError(404, "Listing not found.");
      if (LISTINGS[idx].sellerId !== me.sub) throw apiError(403, "You can only delete your own listings.");
      LISTINGS.splice(idx, 1);
      return { ok: true };
    },

    async buyListing(id) {
      await sleep();
      const me = requireAuth();
      if (me.role === "admin") throw apiError(403, "Admins can't buy listings.");
      const l = LISTINGS.find(x => x.id === id);
      if (!l) throw apiError(404, "Listing not found.");
      if (l.sellerId === me.sub) throw apiError(400, "You can't buy your own listing.");
      if (l.status !== "available") throw apiError(409, "This listing is no longer available.");
      l.status = "sold";
      l.buyerId = me.sub;
      l.soldAt = Date.now();
      return enrichListing(l);
    },

    // ---------- Admin: categories ----------
    async createCategory(data) {
      await sleep();
      requireAdmin();
      const id = "c" + (CATEGORIES.length + 1);
      const cat = { id, name: data.name, description: data.description || "", gender: data.gender || "All", sortOrder: Number(data.sortOrder) || CATEGORIES.length + 1 };
      CATEGORIES.push(cat);
      return cat;
    },
    async updateCategory(id, data) {
      await sleep();
      requireAdmin();
      const c = CATEGORIES.find(c => c.id === id);
      if (!c) throw apiError(404, "Category not found.");
      Object.assign(c, {
        name: data.name ?? c.name,
        description: data.description ?? c.description,
        gender: data.gender ?? c.gender,
        sortOrder: data.sortOrder != null ? Number(data.sortOrder) : c.sortOrder,
      });
      return c;
    },
    async deleteCategory(id) {
      await sleep();
      requireAdmin();
      const idx = CATEGORIES.findIndex(c => c.id === id);
      if (idx < 0) throw apiError(404, "Category not found.");
      const inUse = LISTINGS.some(l => l.categoryId === id);
      if (inUse) throw apiError(409, "Category is in use by existing listings.");
      CATEGORIES.splice(idx, 1);
      return { ok: true };
    },

    // ---------- Admin: users ----------
    async listUsers() {
      await sleep();
      requireAdmin();
      return USERS.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, city: u.city,
        listingCount: LISTINGS.filter(l => l.sellerId === u.id).length,
        purchaseCount: LISTINGS.filter(l => l.buyerId === u.id).length,
      }));
    },
    async updateUserRole(id, role) {
      await sleep();
      const me = requireAdmin();
      const u = USERS.find(u => u.id === id);
      if (!u) throw apiError(404, "User not found.");
      if (u.id === me.sub && role !== "admin") throw apiError(400, "You can't demote yourself.");
      u.role = role;
      return { id: u.id, role: u.role };
    },
    async deleteUser(id) {
      await sleep();
      const me = requireAdmin();
      if (id === me.sub) throw apiError(400, "You can't delete yourself.");
      const idx = USERS.findIndex(u => u.id === id);
      if (idx < 0) throw apiError(404, "User not found.");
      USERS.splice(idx, 1);
      return { ok: true };
    },

    // Useful for collecting unique sizes for filter UI
    async listSizes() {
      await sleep(80);
      return [...new Set(LISTINGS.map(l => l.size))].sort();
    },
  };

  window.BambiAPI = api;
})();
