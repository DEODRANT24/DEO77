import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useRegisterWallet, useVerifyWalletBurn, useGetMyWallets, useWalletLogin } from "@workspace/api-client-react";

const WALLET_TOKEN_KEY = "deodrant_wallet_token";
const WALLET_ADDR_KEY = "deodrant_wallet_address";

interface WalletSession {
  token: string;
  address: string;
  totalBurned: number;
}

function useWalletSession() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const walletLogin = useWalletLogin();

  useEffect(() => {
    const token = localStorage.getItem(WALLET_TOKEN_KEY);
    const address = localStorage.getItem(WALLET_ADDR_KEY);
    if (token && address) {
      walletLogin.mutate(
        { data: { sessionToken: token } },
        {
          onSuccess: (data) => {
            setSession({ token, address: data.walletAddress, totalBurned: data.totalBurned });
          },
          onError: () => {
            localStorage.removeItem(WALLET_TOKEN_KEY);
            localStorage.removeItem(WALLET_ADDR_KEY);
          },
        },
      );
    }
  }, []);

  function saveSession(token: string, address: string, totalBurned: number) {
    localStorage.setItem(WALLET_TOKEN_KEY, token);
    localStorage.setItem(WALLET_ADDR_KEY, address);
    setSession({ token, address, totalBurned });
  }

  function clearSession() {
    localStorage.removeItem(WALLET_TOKEN_KEY);
    localStorage.removeItem(WALLET_ADDR_KEY);
    setSession(null);
  }

  return { session, saveSession, clearSession };
}

type WalletStep = "idle" | "enter" | "challenge" | "submit" | "done" | "error";

function WalletRegistrationPanel({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<WalletStep>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [challenge, setChallenge] = useState<{ id: number; challengeAmount: number; expiresAt: string } | null>(null);
  const [txSig, setTxSig] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [burnedTotal, setBurnedTotal] = useState(0);

  const registerWallet = useRegisterWallet();
  const verifyBurn = useVerifyWalletBurn();
  const { session, saveSession } = useWalletSession();

  async function handleRegister() {
    if (!walletAddress.trim() || walletAddress.trim().length < 32) {
      setErrorMsg("Enter a valid Solana wallet address (32+ characters)");
      return;
    }
    setErrorMsg("");
    registerWallet.mutate(
      { data: { walletAddress: walletAddress.trim() } },
      {
        onSuccess: (data) => {
          setChallenge(data);
          setStep("challenge");
        },
        onError: (e: any) => {
          setErrorMsg(e?.data?.error ?? "Failed to register wallet. Try again.");
          setStep("error");
        },
      },
    );
  }

  async function handleVerify() {
    if (!txSig.trim() || txSig.trim().length < 32) {
      setErrorMsg("Enter a valid Solana transaction signature");
      return;
    }
    setErrorMsg("");
    verifyBurn.mutate(
      { data: { walletAddress: walletAddress.trim(), txSignature: txSig.trim() } },
      {
        onSuccess: (data) => {
          setBurnedTotal(data.totalBurned);
          saveSession(data.sessionToken, data.walletAddress, data.totalBurned);
          setStep("done");
          setTimeout(onSuccess, 1800);
        },
        onError: (e: any) => {
          setErrorMsg(e?.data?.error ?? "Burn verification failed. Check your transaction and try again.");
          setStep("error");
        },
      },
    );
  }

  const expiresIn = challenge
    ? Math.max(0, Math.floor((new Date(challenge.expiresAt).getTime() - Date.now()) / 60000))
    : 0;

  if (step === "idle") {
    return (
      <div className="wallet-reg-panel">
        <div className="wallet-reg-title">🔥 REGISTER WALLET</div>
        <p className="wallet-reg-sub">
          Connect your Solana wallet by burning DEODRANT tokens.<br/>
          Our system issues a random challenge to prove it's yours.
        </p>
        <button className="wallet-reg-btn" onClick={() => setStep("enter")}>
          START WALLET REGISTRATION
        </button>
      </div>
    );
  }

  if (step === "enter") {
    return (
      <div className="wallet-reg-panel">
        <div className="wallet-reg-title">📍 STEP 1: YOUR WALLET</div>
        <p className="wallet-reg-sub">Enter your Solana wallet address (not a seed phrase!)</p>
        <input
          className="wallet-reg-input"
          placeholder="Enter Solana wallet address..."
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          spellCheck={false}
        />
        {errorMsg && <p className="wallet-reg-error">{errorMsg}</p>}
        <div className="wallet-reg-btns">
          <button className="wallet-reg-btn-sec" onClick={() => setStep("idle")}>← BACK</button>
          <button
            className="wallet-reg-btn"
            onClick={handleRegister}
            disabled={registerWallet.isPending}
          >
            {registerWallet.isPending ? "ISSUING CHALLENGE..." : "GET BURN CHALLENGE →"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "challenge" && challenge) {
    return (
      <div className="wallet-reg-panel">
        <div className="wallet-reg-title">🎲 STEP 2: BURN CHALLENGE</div>
        <div className="wallet-burn-amount">
          <span className="wallet-burn-number">{challenge.challengeAmount}</span>
          <span className="wallet-burn-label">$DEODRANT</span>
        </div>
        <p className="wallet-reg-sub">
          Burn exactly <strong>{challenge.challengeAmount} $DEODRANT</strong> from wallet:<br/>
          <code className="wallet-addr-code">{walletAddress}</code>
        </p>
        <p className="wallet-reg-hint">
          Send to the burn address: <code>1nc1nerator11111111111111111111111111111111</code><br/>
          Challenge expires in <strong>{expiresIn} min</strong>
        </p>
        <button className="wallet-reg-btn" onClick={() => setStep("submit")}>
          I'VE BURNED IT → SUBMIT TX
        </button>
        <button className="wallet-reg-btn-sec" onClick={() => setStep("enter")}>← CHANGE WALLET</button>
      </div>
    );
  }

  if (step === "submit") {
    return (
      <div className="wallet-reg-panel">
        <div className="wallet-reg-title">📋 STEP 3: PASTE TX SIGNATURE</div>
        <p className="wallet-reg-sub">
          Paste the Solana transaction signature from your burn of{" "}
          <strong>{challenge?.challengeAmount} $DEODRANT</strong>
        </p>
        <input
          className="wallet-reg-input"
          placeholder="Paste transaction signature..."
          value={txSig}
          onChange={e => setTxSig(e.target.value)}
          spellCheck={false}
        />
        {errorMsg && <p className="wallet-reg-error">{errorMsg}</p>}
        <div className="wallet-reg-btns">
          <button className="wallet-reg-btn-sec" onClick={() => { setStep("challenge"); setErrorMsg(""); }}>← BACK</button>
          <button
            className="wallet-reg-btn"
            onClick={handleVerify}
            disabled={verifyBurn.isPending}
          >
            {verifyBurn.isPending ? "VERIFYING ON-CHAIN..." : "VERIFY BURN →"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="wallet-reg-panel wallet-reg-panel--success">
        <div className="wallet-reg-title">✅ WALLET VERIFIED!</div>
        <div className="wallet-burn-amount">
          <span className="wallet-burn-number">{burnedTotal}</span>
          <span className="wallet-burn-label">TOTAL $DEODRANT BURNED</span>
        </div>
        <p className="wallet-reg-sub">Your wallet has been registered. Session saved. Redirecting...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="wallet-reg-panel wallet-reg-panel--error">
        <div className="wallet-reg-title">❌ VERIFICATION FAILED</div>
        <p className="wallet-reg-error">{errorMsg}</p>
        <div className="wallet-reg-btns">
          <button className="wallet-reg-btn-sec" onClick={() => { setStep("enter"); setErrorMsg(""); }}>
            ← TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function WalletCard({ wallet }: { wallet: any }) {
  return (
    <div className="wallet-card">
      <div className="wallet-card-addr">
        {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-6)}
      </div>
      <div className="wallet-card-meta">
        <span className={`wallet-card-badge ${wallet.verified ? "wallet-card-badge--ok" : "wallet-card-badge--pending"}`}>
          {wallet.verified ? "✅ VERIFIED" : "⏳ UNVERIFIED"}
        </span>
        <span className="wallet-card-burned">🔥 {wallet.totalBurned} burned</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session, clearSession } = useWalletSession();
  const [showWalletReg, setShowWalletReg] = useState(false);

  const { data: clerkWallets, refetch: refetchWallets } = useGetMyWallets();

  const isLoggedIn = !!user || !!session;

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      navigate("/sign-in");
    }
  }, [isLoaded, isLoggedIn]);

  if (!isLoaded) {
    return (
      <div className="profile-loading">
        <p>LOADING...</p>
      </div>
    );
  }

  function handleSignOut() {
    if (user) {
      signOut({ redirectUrl: "/" });
    } else {
      clearSession();
      navigate("/");
    }
  }

  const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress
    ?? (session ? `${session.address.slice(0, 8)}...${session.address.slice(-4)}` : "ANON");

  const avatarUrl = user?.imageUrl;

  return (
    <div className="profile-root">
      {/* NAV */}
      <nav className="comic-nav" style={{ position: "relative" }}>
        <button className="nav-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", background: "none", border: "none" }}>
          $DEODRANT
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="nav-cta" onClick={handleSignOut}>LOG OUT</button>
        </div>
      </nav>

      <div className="profile-container">
        {/* Profile header */}
        <div className="profile-header">
          {avatarUrl && (
            <img src={avatarUrl} alt="avatar" className="profile-avatar" />
          )}
          <div>
            <div className="profile-name">{displayName}</div>
            {user?.primaryEmailAddress && (
              <div className="profile-email">{user.primaryEmailAddress.emailAddress}</div>
            )}
            {session && !user && (
              <div className="profile-wallet-badge">WALLET USER</div>
            )}
          </div>
        </div>

        {/* Wallet section */}
        <div className="profile-section">
          <div className="profile-section-title">🔐 REGISTERED WALLETS</div>

          {session && !user && (
            <WalletCard wallet={{ walletAddress: session.address, verified: true, totalBurned: session.totalBurned }} />
          )}

          {clerkWallets && clerkWallets.length > 0 && clerkWallets.map((w: any) => (
            <WalletCard key={w.id} wallet={w} />
          ))}

          {!showWalletReg && (
            <button className="wallet-add-btn" onClick={() => setShowWalletReg(true)}>
              + ADD WALLET
            </button>
          )}

          {showWalletReg && (
            <WalletRegistrationPanel
              onSuccess={() => {
                setShowWalletReg(false);
                refetchWallets();
              }}
            />
          )}
        </div>

        {/* Services */}
        <div className="profile-section">
          <div className="profile-section-title">⚡ YOUR SERVICES</div>
          <div className="profile-services-grid">
            <div className="service-access-card service-access-card--locked">
              <div className="service-access-icon">🧹</div>
              <div className="service-access-name">CLEAN UP YOUR X</div>
              <div className="service-access-req">HOLD 420,000+ $DEODRANT OR BURN 42,000+</div>
              <button className="service-access-btn" onClick={() => navigate("/")}>CHECK ACCESS</button>
            </div>
            <div className="service-access-card service-access-card--locked">
              <div className="service-access-icon">📞</div>
              <div className="service-access-name">AI CALL CENTRE</div>
              <div className="service-access-req">AVAILABLE ON CALLCENTRE PLAN</div>
              <button className="service-access-btn" onClick={() => navigate("/callcentre")}>VIEW PLANS</button>
            </div>
            <div className="service-access-card service-access-card--locked">
              <div className="service-access-icon">📈</div>
              <div className="service-access-name">TRADING BOT</div>
              <div className="service-access-req">BURN 42,000+ $DEODRANT</div>
              <button className="service-access-btn" onClick={() => navigate("/")}>CHECK ACCESS</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
