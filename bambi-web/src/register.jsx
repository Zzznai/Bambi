// register.jsx — RegisterPage
import React from 'react';
import { useToast } from './components.jsx';
import { useAuth } from './auth-context.jsx';
import { navigate } from './router.js';

export function RegisterPage() {
  const auth = useAuth();
  const toast = useToast();
  const [form, setForm] = React.useState({ username: "", email: "", city: "", password: "", confirm: "" });
  const [errors, setErrors] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  React.useEffect(() => {
    if (auth.isLoggedIn) navigate(auth.isAdmin ? "/admin" : "/shop");
  }, [auth.isLoggedIn, auth.isAdmin]);

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = "Min 3 characters.";
    if (!/^[a-z0-9._-]+$/i.test(form.username)) e.username = e.username || "Letters, numbers, . _ - only.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Looks invalid.";
    if (!form.city.trim()) e.city = "Required.";
    if (form.password.length < 4) e.password = "Min 4 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const user = await auth.register({
        username: form.username.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        password: form.password,
      });
      toast.ok(`Account made. Welcome, @${user.username}.`);
      navigate("/shop");
    } catch (e) {
      toast.err(e.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div>
          <span className="sticker sticker--lime sticker--tilt-r">new here?</span>
          <h1 style={{ marginTop: 10 }}>Make an account</h1>
          <p className="muted" style={{ marginTop: 6 }}>Buy, sell, repeat. No fees on your first month.</p>
        </div>

        <form className="col" style={{ gap: 14 }} onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label">Username</label>
            <input className={`input ${errors.username ? "input--err" : ""}`}
                   value={form.username} onChange={set("username")} placeholder="e.g. lia.thrift" />
            {errors.username && <span className="field__error">{errors.username}</span>}
          </div>
          <div className="row-wrap" style={{ gap: 14 }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label className="field__label">Email</label>
              <input className={`input ${errors.email ? "input--err" : ""}`} type="email"
                     value={form.email} onChange={set("email")} placeholder="you@somewhere.com" />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>
            <div className="field" style={{ flex: "1 1 180px" }}>
              <label className="field__label">City</label>
              <input className={`input ${errors.city ? "input--err" : ""}`}
                     value={form.city} onChange={set("city")} placeholder="Berlin" />
              {errors.city && <span className="field__error">{errors.city}</span>}
            </div>
          </div>
          <div className="row-wrap" style={{ gap: 14 }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label className="field__label">Password</label>
              <input className={`input ${errors.password ? "input--err" : ""}`} type="password"
                     value={form.password} onChange={set("password")} />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label className="field__label">Confirm</label>
              <input className={`input ${errors.confirm ? "input--err" : ""}`} type="password"
                     value={form.confirm} onChange={set("confirm")} />
              {errors.confirm && <span className="field__error">{errors.confirm}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn--pink btn--lg btn--block" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <div style={{ borderTop: "2px dashed var(--ink)", paddingTop: 14, textAlign: "center" }}>
          <p className="muted" style={{ fontSize: 14 }}>
            Already have one? <a href="#/login" style={{ fontWeight: 700, textDecoration: "underline" }}>Log in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
