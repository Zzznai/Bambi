// icons.jsx — inline SVG icons. Stroke = currentColor.
const Icon = ({ children, size = 18, fill = "none", className = "" }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>;

const IconSearch   = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
const IconHeart    = (p) => <Icon {...p}><path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z"/></Icon>;
const IconPlus     = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconMinus    = (p) => <Icon {...p}><path d="M5 12h14"/></Icon>;
const IconX        = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
const IconCheck    = (p) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>;
const IconChevL    = (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>;
const IconChevR    = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
const IconChevD    = (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>;
const IconCart     = (p) => <Icon {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.7 12.4a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5L22 8H6"/></Icon>;
const IconUser     = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></Icon>;
const IconTag      = (p) => <Icon {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5"/></Icon>;
const IconEdit     = (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></Icon>;
const IconTrash    = (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></Icon>;
const IconImage    = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></Icon>;
const IconShield   = (p) => <Icon {...p}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></Icon>;
const IconLogout   = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Icon>;
const IconFilter   = (p) => <Icon {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Icon>;
const IconSort     = (p) => <Icon {...p}><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 4v16"/></Icon>;
const IconStar     = ({ size = 18, on = false }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" className={on ? "star-on" : "star-off"}>
    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z"/>
  </svg>;
const IconBag      = (p) => <Icon {...p}><path d="M5 7h14l-1 14H6L5 7z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></Icon>;
const IconSparkle  = (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/></Icon>;
const IconWarning  = (p) => <Icon {...p}><path d="M12 3l10 17H2L12 3z"/><path d="M12 10v5M12 18v.5"/></Icon>;

Object.assign(window, {
  Icon, IconSearch, IconHeart, IconPlus, IconMinus, IconX, IconCheck, IconChevL,
  IconChevR, IconChevD, IconCart, IconUser, IconTag, IconEdit, IconTrash, IconImage,
  IconShield, IconLogout, IconFilter, IconSort, IconStar, IconBag, IconSparkle, IconWarning,
});
