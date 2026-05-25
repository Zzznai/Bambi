// login.jsx — LoginPage
function LoginPage() {
  const auth = window.useAuth();
  const toast = window.useToast();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (auth.isLoggedIn) window.navigate("/shop");
  }, [auth.isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!username.trim()) errs.username = "Required.";
    if (!password) errs.password = "Required.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const user = await auth.login({ username: username.trim(), password });
      toast.ok(`Welcome back, @${user.username}.`);
      window.navigate(user.role === "admin" ? "/admin" : "/shop");
    } catch (e) {
      toast.err(e.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div>
          <div className="row" style={{ gap: 10 }}>
            <span className="sticker sticker--pink sticker--tilt-l">welcome back</span>
          </div>
          <h1 style={{ marginTop: 10 }}>Log in</h1>
          <p className="muted" style={{ marginTop: 6 }}>Pick up where you left off in the rack.</p>
        </div>

        <form className="col" style={{ gap: 16 }} onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label">Username or email</label>
            <input className={`input ${errors.username ? "input--err" : ""}`}
                   autoComplete="username"
                   value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <span className="field__error">{errors.username}</span>}
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input className={`input ${errors.password ? "input--err" : ""}`}
                   type="password" autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn--pink btn--lg btn--block" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div style={{ borderTop: "2px dashed var(--ink)", paddingTop: 14, textAlign: "center" }}>
          <p className="muted" style={{ fontSize: 14 }}>
            New to bambi? <a href="#/register" style={{ fontWeight: 700, textDecoration: "underline" }}>Make an account</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
window.LoginPage = LoginPage;
