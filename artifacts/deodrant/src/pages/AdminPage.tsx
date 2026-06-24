import { useState, useEffect } from "react";

interface Status {
  address: string | null;
  locked: boolean;
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/token-address")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => setError("Failed to connect to API"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/token-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, address }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setSuccess(`✅ Contract address locked permanently: ${data.address}`);
        setStatus({ address: data.address, locked: true });
        setUsername("");
        setPassword("");
        setAddress("");
      }
    } catch {
      setError("Network error — could not reach API");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d001a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: "#1a0033",
        border: "3px solid #f5c518",
        borderRadius: "8px",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 0 40px rgba(245,197,24,0.15)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔐</div>
          <h1 style={{
            fontFamily: "Bangers, cursive",
            fontSize: "1.8rem",
            color: "#f5c518",
            letterSpacing: "0.1em",
            margin: 0,
          }}>
            DEODRANT ADMIN
          </h1>
          <p style={{ color: "rgba(245,197,24,0.6)", fontSize: "0.85rem", margin: "0.4rem 0 0" }}>
            Token Contract Address — One-Time Setup
          </p>
        </div>

        {loading && (
          <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center" }}>Checking status…</p>
        )}

        {!loading && status?.locked && (
          <div style={{
            background: "rgba(40,144,127,0.15)",
            border: "2px solid #28907f",
            borderRadius: "6px",
            padding: "1.25rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
            <p style={{ color: "#7dd8c8", fontWeight: 600, marginBottom: "0.5rem" }}>
              Contract Address Locked
            </p>
            <p style={{
              color: "#fff",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              wordBreak: "break-all",
              background: "rgba(0,0,0,0.3)",
              padding: "0.5rem",
              borderRadius: "4px",
            }}>
              {status.address}
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
              This address is permanently set and cannot be changed.
            </p>
          </div>
        )}

        {!loading && !status?.locked && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                style={inputStyle}
                placeholder="username"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Solana Contract Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.85rem" }}
                placeholder="e.g. 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
              />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", marginTop: "0.35rem" }}>
                ⚠ This can only be set once. Double-check before submitting.
              </p>
            </div>

            {error && (
              <div style={{
                background: "rgba(200,50,50,0.2)",
                border: "1px solid rgba(200,50,50,0.5)",
                color: "#ff8888",
                padding: "0.75rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: "rgba(40,144,127,0.2)",
                border: "1px solid rgba(40,144,127,0.5)",
                color: "#7dd8c8",
                padding: "0.75rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting ? "#888" : "#f5c518",
                color: "#0d001a",
                border: "none",
                borderRadius: "4px",
                padding: "0.85rem",
                fontFamily: "Bangers, cursive",
                fontSize: "1.1rem",
                letterSpacing: "0.08em",
                cursor: submitting ? "not-allowed" : "pointer",
                borderBottom: "4px solid #a07a00",
              }}
            >
              {submitting ? "SETTING…" : "LOCK CONTRACT ADDRESS 🔒"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(245,197,24,0.85)",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.35rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#2a0044",
  border: "2px solid rgba(245,197,24,0.35)",
  borderRadius: "4px",
  padding: "0.65rem 0.9rem",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};
