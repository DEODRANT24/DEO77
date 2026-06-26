import '../callcentre.css';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  DEODRANT_REQUIRED,
  PRICE_HOLDER,
  PRICE_STANDARD,
  CCUser,
  CCState,
  CCApiKeys,
  CCPhoneConfig,
  CCDialogue,
  getCurrentUser,
  signUp,
  logIn,
  logOut,
  getCCState,
  saveCCState,
  updateCurrentUser,
  verifyDeodrantBalance,
} from '../lib/callcentre';

// ── Constants ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: '+61', name: 'Australia 🇦🇺' },
  { code: '+1', name: 'United States 🇺🇸' },
  { code: '+44', name: 'United Kingdom 🇬🇧' },
  { code: '+64', name: 'New Zealand 🇳🇿' },
  { code: '+27', name: 'South Africa 🇿🇦' },
  { code: '+91', name: 'India 🇮🇳' },
  { code: '+49', name: 'Germany 🇩🇪' },
  { code: '+33', name: 'France 🇫🇷' },
  { code: '+65', name: 'Singapore 🇸🇬' },
  { code: '+971', name: 'UAE 🇦🇪' },
  { code: '+81', name: 'Japan 🇯🇵' },
];

const INDUSTRIES = [
  'Retail', 'Restaurant / Hospitality', 'Healthcare / Medical', 'Legal / Law Firm',
  'Real Estate', 'Financial Services', 'Trades / Home Services', 'Beauty / Wellness',
  'Education', 'Logistics / Transport', 'Technology', 'Other',
];

type CCView = 'intro' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'signup';
type DashTab = 'overview' | 'calls' | 'settings';

// ── Utility ────────────────────────────────────────────────────────────────
function buildSystemPrompt(d: CCDialogue): string {
  return `You are a professional AI receptionist for ${d.businessName || '[Business Name]'}, a ${d.industry || '[Industry]'} business.

Business hours: ${d.businessHours || 'Not specified'}

Services offered:
${d.services || '[Services not yet specified]'}

Common questions & answers:
${d.faqs || '[FAQs not yet specified]'}

Your communication style is ${d.personality || 'professional'}. Always be helpful, accurate, and represent the business well. If you cannot answer a question, politely take the caller's name and number and assure them someone will call back promptly.`;
}

// ── DeodrantLightbox ───────────────────────────────────────────────────────
function DeodrantLightbox({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedStep, setCopiedStep] = useState(false);
  const [contractAddress, setContractAddress] = useState('');

  useEffect(() => {
    fetch('/api/token-address')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.address) setContractAddress(d.address); })
      .catch(() => {});
  }, []);

  function copyAddr() {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyAddrStep() {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress).catch(() => {});
    setCopiedStep(true);
    setTimeout(() => setCopiedStep(false), 2000);
  }

  return (
    <div className="cc-lightbox-overlay" onClick={onClose}>
      <div className="cc-lightbox" onClick={e => e.stopPropagation()}>
        <button className="cc-lightbox-close" onClick={onClose}>✕</button>
        <div className="cc-lightbox-title">🪙 GET $DEODRANT</div>
        <div className="cc-lightbox-sub">
          Hold 420+ $DEODRANT on Solana to unlock <strong style={{ color: '#3D1FA8' }}>$4.20/month pricing</strong> — saving $37.80/month vs standard.
        </div>

        <div className="cc-contract-box">
          <div className="cc-contract-label">
            {contractAddress ? 'Contract address' : 'Contract address — coming soon'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div className="cc-contract-addr">
              {contractAddress || 'TBA — TOKEN LAUNCHING SOON'}
            </div>
            {contractAddress && (
              <button className="cc-copy-btn" onClick={copyAddr}>{copied ? '✓ Copied' : 'Copy'}</button>
            )}
          </div>
          {!contractAddress && (
            <div className="cc-contract-note">⚠ Official contract address coming soon — do not send funds yet.</div>
          )}
        </div>

        <div className="cc-buy-step">
          <div className="cc-buy-step-num">Step 1</div>
          <div className="cc-buy-step-title">Get a Solana wallet</div>
          <div className="cc-buy-step-desc">Download one of these free wallets on your phone or browser:</div>
          <div className="cc-buy-step-links">
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Phantom</a>
            <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Solflare</a>
            <a href="https://jup.ag/" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Jupiter Mobile</a>
          </div>
          <div className="cc-buy-step-desc" style={{ marginTop: '0.4rem' }}>
            Create a new wallet and write down your seed phrase somewhere safe offline. Never share it with anyone.
          </div>
        </div>

        <div className="cc-buy-step">
          <div className="cc-buy-step-num">Step 2</div>
          <div className="cc-buy-step-title">Fund your wallet with SOL</div>
          <div className="cc-buy-step-desc">Buy SOL (Solana's currency) uisng your new wallet, or on any exchange, then transfer it to your wallet. You'll need ~$5–10 USD worth.</div>
          <div className="cc-buy-step-links">
            <a href="https://coinbase.com" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Coinbase</a>
            <a href="https://binance.com" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Binance</a>
            <a href="https://kraken.com" target="_blank" rel="noopener noreferrer" className="cc-buy-link">Kraken</a>
          </div>
        </div>

        <div className="cc-buy-step">
          <div className="cc-buy-step-num">Step 3</div>
          <div className="cc-buy-step-title">Swap SOL for $DEODRANT on Jupiter</div>
          <div className="cc-buy-step-desc">
            Open <a href="https://jup.ag/" target="_blank" rel="noopener noreferrer" className="cc-buy-link" style={{ display: 'inline' }}>jup.ag</a> or the Jupiter mobile app:
          </div>
          <div className="cc-buy-step-desc" style={{ marginTop: '0.4rem' }}>
            1. Paste the contract address in the "You receive" token field&nbsp;
            <button className="cc-copy-btn" onClick={copyAddrStep} style={{ verticalAlign: 'middle' }}>
              {copiedStep ? '✓ Copied' : 'Copy address'}
            </button><br />
            2. Set SOL as what you're paying with<br />
            3. Enter enough SOL to receive 420+ $DEODRANT<br />
            4. Review the swap and confirm
          </div>
        </div>

        <div className="cc-buy-step">
          <div className="cc-buy-step-num">Step 4</div>
          <div className="cc-buy-step-title">Verify your wallet in Settings</div>
          <div className="cc-buy-step-desc">
            Once you hold 420+ $DEODRANT, go to <strong>Settings → Wallet</strong> in your dashboard. Enter your public wallet address and we'll verify your balance on-chain. Your $4.20/month rate activates immediately.
          </div>
        </div>

        <button className="cc-btn cc-btn--outline cc-btn--full" style={{ marginTop: '0.5rem' }} onClick={onClose}>
          Got it — close
        </button>
      </div>
    </div>
  );
}

// ── ApiGenieLightbox ───────────────────────────────────────────────────────
function ApiGenieLightbox({ onClose }: { onClose: () => void }) {
  function openPopup(url: string, name: string) {
    const isMobile = 'ontouchstart' in window || window.innerWidth < 768;
    if (isMobile) {
      window.open(url, '_blank', 'noopener noreferrer');
    } else {
      const w = 1100, h = 720;
      const left = Math.round((window.screen.width - w) / 2);
      const top = Math.round((window.screen.height - h) / 2);
      window.open(
        url, name,
        `width=${w},height=${h},left=${left},top=${top},toolbar=1,scrollbars=1,status=1,resizable=1`
      );
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 1rem 0' }}>
      <div className="cc-api-genie">
        <div className="cc-api-genie-header">
          <span>GET APIS</span>
          <button className="cc-api-genie-close" onClick={onClose}>✕</button>
        </div>
        <div className="cc-api-genie-split">
          <div className="cc-api-genie-col">
            <div className="cc-api-genie-logo">📞</div>
            <div className="cc-api-genie-name">TWILIO</div>
            <div className="cc-api-genie-desc">
              Phone numbers in 60+ countries. Routes inbound calls to your AI. Required to receive calls.
            </div>
            <div className="cc-api-genie-credit">Free $15 credit on signup</div>
            <div className="cc-api-genie-cost">~$1.50/mo per number · ~$0.02/min</div>
            <button
              className="cc-btn cc-btn--primary cc-btn--sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => openPopup('https://www.twilio.com/try-twilio', 'twilio-signup')}
            >
              Sign up for Twilio →
            </button>
          </div>
          <div className="cc-api-genie-divider" />
          <div className="cc-api-genie-col">
            <div className="cc-api-genie-logo">🧠</div>
            <div className="cc-api-genie-name">OpenAI</div>
            <div className="cc-api-genie-desc">
              GPT-4o Realtime API. Processes audio and speaks to your callers live — the AI brain.
            </div>
            <div className="cc-api-genie-credit">Free credits on signup</div>
            <div className="cc-api-genie-cost">~$0.25 per 2-min call</div>
            <button
              className="cc-btn cc-btn--primary cc-btn--sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => openPopup('https://platform.openai.com/signup', 'openai-signup')}
            >
              Sign up for OpenAI →
            </button>
          </div>
        </div>
        <div className="cc-api-genie-footer">
          ✦ Popups open on their site. Come back here with your API keys once signed up.
        </div>
      </div>
    </div>
  );
}

// ── IntroView ──────────────────────────────────────────────────────────────
function IntroView({
  onGetStarted,
  onShowLightbox,
}: {
  onGetStarted: (mode: AuthMode) => void;
  onShowLightbox: () => void;
}) {
  const [, navigate] = useLocation();
  const [showApiGenie, setShowApiGenie] = useState(false);

  return (
    <div className="cc-intro">
      {/* Hero */}
      <div className="cc-hero">
        <div className="cc-hero-badge">✦ NEW — AI CALL CENTRE AS A SERVICE</div>
        <h1 className="cc-hero-title">Your AI receptionist.<br />Your API keys. Our brains.</h1>
        <p className="cc-hero-sub">
          We bundle Twilio + OpenAI Realtime into one dead-simple dashboard.
          You bring your own API keys and pay those providers directly at their rates.
          We make it all work together — seamlessly.
        </p>
        <div className="cc-bundle-note">
          ✦ Just $4.20/month with BYO APIs. No added GPU costs. No markup on GPU/API calls.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cc-btn cc-btn--primary" onClick={() => onGetStarted('signup')}>
            GET STARTED →
          </button>
          <button className="cc-btn cc-btn--ghost" onClick={() => onGetStarted('login')}>
            Sign in
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.6rem' }}>
          <button
            className="cc-btn cc-btn--ghost cc-btn--sm"
            style={{ borderStyle: 'dashed', letterSpacing: '0.1em', fontFamily: 'var(--font-comic)' }}
            onClick={() => setShowApiGenie(v => !v)}
          >
            {showApiGenie ? '✕ CLOSE' : 'GET APIS ✦'}
          </button>
        </div>
        {showApiGenie && <ApiGenieLightbox onClose={() => setShowApiGenie(false)} />}
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: '3rem' }}>
        <div className="cc-section-title">PRICING</div>
        <div className="cc-pricing-grid">
          <div className="cc-pricing-card cc-pricing-card--featured">
            <div className="cc-pricing-featured-badge">🪙 DEODRANT HOLDER</div>
            <div style={{ marginTop: '0.75rem' }}>
              <div className="cc-pricing-price">${PRICE_HOLDER.toFixed(2)}</div>
              <div className="cc-pricing-period">/month per business</div>
              <div className="cc-pricing-label">Requires {DEODRANT_REQUIRED}+ $DEODRANT in your connected wallet</div>
              <ul className="cc-pricing-features">
                <li>Unlimited AI call handling</li>
                <li>Custom dialogue training</li>
                <li>Call transcripts & logs</li>
                <li>24/7 availability</li>
                <li>95+ languages supported</li>
                <li>API key management dashboard</li>
              </ul>
              <button className="cc-btn cc-btn--primary cc-btn--full" onClick={() => onGetStarted('signup')}>
                Get started
              </button>
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                  style={{ background: 'none', border: 'none', color: 'rgba(255,224,51,0.6)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={onShowLightbox}
                >
                  How to get $DEODRANT →
                </button>
              </div>
            </div>
          </div>

          <div className="cc-pricing-card">
            <div className="cc-pricing-price">${PRICE_STANDARD.toFixed(0)}</div>
            <div className="cc-pricing-period">/month per business</div>
            <div className="cc-pricing-label">Standard plan — no $DEODRANT required</div>
            <ul className="cc-pricing-features">
              <li>Unlimited AI call handling</li>
              <li>Custom dialogue training</li>
              <li>Call transcripts & logs</li>
              <li>24/7 availability</li>
              <li>95+ languages supported</li>
              <li>API key management dashboard</li>
            </ul>
            <button className="cc-btn cc-btn--outline cc-btn--full" onClick={() => onGetStarted('signup')}>
              Get started
            </button>
            <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(28,11,85,0.33)' }}>
              Save $37.80/mo by holding $DEODRANT
            </div>
          </div>
        </div>
      </div>

      {/* Cost comparison */}
      <div className="cc-cost-section">
        <div className="cc-section-title">HUMAN vs AI — THE NUMBERS</div>
        <p style={{ fontSize: '1.7rem', color: '#FFFFFF', marginBottom: '1rem', lineHeight: '1.6' }}>
          You use your own Twilio and OpenAI accounts — you pay them directly at their published rates. We don't mark up API costs. Your total cost is their API fees + our $4.20/month bundling fee.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="cc-cost-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Human Receptionist</th>
                <th>DEODRANT CALL CENTRE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly base</td>
                <td className="cc-dim">$3,500 – $6,500</td>
                <td className="cc-highlight">$4.20 (w/ $DEODRANT)</td>
              </tr>
              <tr>
                <td>Per 2-min call received</td>
                <td className="cc-dim">~$4 – $8 (salaried)</td>
                <td className="cc-highlight">~$0.27 (your API cost)</td>
              </tr>
              <tr>
                <td>100 calls / month</td>
                <td className="cc-dim">~$4,200/mo</td>
                <td className="cc-highlight">~$31/mo total</td>
              </tr>
              <tr>
                <td>500 calls / month</td>
                <td className="cc-dim">~$4,200/mo</td>
                <td className="cc-highlight">~$139/mo total</td>
              </tr>
              <tr>
                <td>1,000 calls / month</td>
                <td className="cc-dim">~$4,200/mo</td>
                <td className="cc-highlight">~$274/mo total</td>
              </tr>
              <tr>
                <td>Available hours</td>
                <td className="cc-dim">Business hours only</td>
                <td className="cc-highlight">24 / 7 / 365</td>
              </tr>
              <tr>
                <td>Sick days</td>
                <td className="cc-dim">Yes</td>
                <td className="cc-highlight">Never</td>
              </tr>
              <tr>
                <td>Setup time</td>
                <td className="cc-dim">Weeks</td>
                <td className="cc-highlight">Minutes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="cc-cost-note">
          * API costs are paid directly to Twilio and OpenAI by you. Figures are estimates based on published rates for a 2-minute inbound call. Per-call cost varies by country and call length.
        </div>
      </div>

      {/* Per-call breakdown */}
      <div className="cc-breakdown-section" style={{ marginBottom: '3rem' }}>
        <div className="cc-section-title">PER-CALL COST BREAKDOWN</div>
        <div className="cc-breakdown">
          <div className="cc-breakdown-item">
            <div className="cc-breakdown-label">Twilio — inbound (2 min)</div>
            <div className="cc-breakdown-value">~$0.02</div>
            <div className="cc-breakdown-sub">~$0.01/min, paid to Twilio</div>
          </div>
          <div className="cc-breakdown-item">
            <div className="cc-breakdown-label">OpenAI Realtime (2 min)</div>
            <div className="cc-breakdown-value">~$0.25</div>
            <div className="cc-breakdown-sub">Audio in + out, paid to OpenAI</div>
          </div>
          <div className="cc-breakdown-item" style={{ borderColor: 'rgba(255,224,51,0.35)' }}>
            <div className="cc-breakdown-label">Total per 2-min call</div>
            <div className="cc-breakdown-value">~$0.27</div>
            <div className="cc-breakdown-sub">Your direct API costs</div>
          </div>
          <div className="cc-breakdown-item" style={{ borderColor: 'rgba(255,140,66,0.35)' }}>
            <div className="cc-breakdown-label">DEODRANT fee (1,400 calls)</div>
            <div className="cc-breakdown-value">$0.003</div>
            <div className="cc-breakdown-sub">$4.20/mo flat — per-call share</div>
          </div>
        </div>

        {/* Monthly total boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '0.75rem' }}>
          {[
            { calls: 100, api: 27, fee: 4.20, human: 4200 },
            { calls: 500, api: 135, fee: 4.20, human: 4200 },
            { calls: 1000, api: 270, fee: 4.20, human: 4200 },
          ].map(({ calls, api, fee, human }) => (
            <div key={calls} className="cc-card cc-card--yellow" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(240,237,230,0.88)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {calls} calls / month
              </div>
              <div style={{ fontFamily: 'var(--font-comic)', fontSize: '1.5rem', color: '#FFE033' }}>
                ~${(api + fee).toFixed(0)}/mo
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(240,237,230,0.88)', marginTop: '0.2rem' }}>
                vs ~${human.toLocaleString()}/mo human
              </div>
              <div style={{ fontSize: '0.7rem', color: '#7DD8FF', marginTop: '0.4rem' }}>
                Save ~${(human - api - fee).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="cc-how-section" style={{ marginBottom: '3rem' }}>
        <div className="cc-section-title">HOW IT WORKS</div>
        <div className="cc-steps">
          {[
            { n: '01', title: 'Enter your API keys', desc: "Add your Twilio and OpenAI API keys. They're stored only in your browser — we never see them." },
            { n: '02', title: 'Pick a phone number', desc: 'In your Twilio account, provision a local number in your country (~$1.50/mo). Enter it here.' },
            { n: '03', title: 'Train the AI', desc: "Tell us your business name, hours, services, and FAQs. We build the AI's script from your answers." },
            { n: '04', title: 'Go live instantly', desc: 'Flip the switch. Your AI answers calls 24/7, handles FAQs, books appointments, and takes messages.' },
          ].map(s => (
            <div key={s.n} className="cc-step">
              <div className="cc-step-num">{s.n}</div>
              <div className="cc-step-title">{s.title}</div>
              <div className="cc-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure */}
      <div className="cc-infra-section" style={{ marginBottom: '2rem' }}>
        <div className="cc-section-title">THE INFRASTRUCTURE</div>
        <p style={{ fontSize: '1.02rem', color: 'rgba(240,237,230,0.92)', marginBottom: '1rem', lineHeight: '1.6' }}>
          Sign up to each provider below, get your API keys, and enter them in your dashboard. All links go directly to their signup pages.
        </p>
        <div className="cc-infra-grid">
          <div className="cc-infra-card">
            <div className="cc-infra-name">📞 Twilio</div>
            <div className="cc-infra-cost">Phone numbers: ~$1.50/mo · Calls: ~$0.01/min</div>
            <div style={{ fontSize: '0.90rem', color: 'rgba(240,237,230,0.88)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
              Handles inbound/outbound calling in 60+ countries. Provision a local number for your business.
            </div>
            <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="cc-infra-link">
              Sign up — get $15 free credit →
            </a>
          </div>
          <div className="cc-infra-card">
            <div className="cc-infra-name">🧠 OpenAI</div>
            <div className="cc-infra-cost">Realtime API: ~$0.25 per 2-min call</div>
            <div style={{ fontSize: '0.90rem', color: 'rgba(240,237,230,0.88)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
              Powers the AI voice — GPT-4o Realtime processes audio in real time, no transcription lag. Their GPUs, your key.
            </div>
            <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="cc-infra-link">
              Sign up for OpenAI Platform →
            </a>
          </div>
        </div>
        <div className="cc-referral-note">
          We participate in referral programmes where available. Links above may earn us a small commission at no cost to you — it helps keep the $4.20 fee from going up.
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontFamily: 'var(--font-comic)', fontSize: '1.8rem', color: '#3D1FA8', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
          Ready to replace your receptionist?
        </div>
        <p style={{ fontSize: '0.9rem', color: 'rgba(28,11,85,0.48)', marginBottom: '1.5rem' }}>
          Takes 5 minutes to set up. No contract. Cancel any time.
        </p>
        <button className="cc-btn cc-btn--primary" style={{ fontSize: '1.1rem', padding: '0.85rem 2.5rem' }} onClick={() => onGetStarted('signup')}>
          GET STARTED — FREE TRIAL →
        </button>
      </div>
    </div>
  );
}

// ── AuthView ───────────────────────────────────────────────────────────────
function AuthView({
  defaultMode,
  onBack,
  onSuccess,
}: {
  defaultMode: AuthMode;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = mode === 'signup'
      ? await signUp(email.trim().toLowerCase(), password, name.trim())
      : await logIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error ?? 'Something went wrong.');
    }
  }

  return (
    <div className="cc-auth-wrap">
      <div className="cc-auth-box">
        <div className="cc-auth-title">
          {mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </div>
        <div className="cc-auth-sub">
          {mode === 'signup'
            ? 'Your account is stored locally in your browser — no server sync.'
            : 'Welcome back. Your data stays in this browser.'}
        </div>

        {error && <div className="cc-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="cc-field">
              <label className="cc-label">Your name</label>
              <input className="cc-input" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
          )}
          <div className="cc-field">
            <label className="cc-label">Email</label>
            <input className="cc-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="cc-field">
            <label className="cc-label">Password</label>
            <input className="cc-input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button type="submit" className="cc-btn cc-btn--primary cc-btn--full" disabled={loading}>
            {loading ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="cc-auth-toggle">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}>
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </div>

        <div className="cc-privacy-note">
          🔒 Your API keys and account data are stored only in this browser via localStorage. We have no server-side access to your credentials.
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button className="cc-btn cc-btn--ghost cc-btn--sm" onClick={onBack}>← Back</button>
        </div>
      </div>
    </div>
  );
}

// ── OnboardingWizard ───────────────────────────────────────────────────────
function OnboardingWizard({
  user,
  ccState,
  onUpdate,
  onComplete,
}: {
  user: CCUser;
  ccState: CCState;
  onUpdate: (s: CCState) => void;
  onComplete: () => void;
}) {
  const step = Math.max(1, Math.min(ccState.onboardingStep || 1, 3));

  // Step 1 state
  const [twilioSid, setTwilioSid] = useState(ccState.apiKeys?.twilioSid ?? '');
  const [twilioToken, setTwilioToken] = useState(ccState.apiKeys?.twilioToken ?? '');
  const [openaiKey, setOpenaiKey] = useState(ccState.apiKeys?.openaiKey ?? '');

  // Step 2 state
  const [country, setCountry] = useState(ccState.phone?.countryCode ?? '+61');
  const [phoneNum, setPhoneNum] = useState(ccState.phone?.phoneNumber ?? '');

  // Step 3 state
  const [bizName, setBizName] = useState(ccState.dialogue?.businessName ?? '');
  const [industry, setIndustry] = useState(ccState.dialogue?.industry ?? INDUSTRIES[0]);
  const [bizHours, setBizHours] = useState(ccState.dialogue?.businessHours ?? '');
  const [services, setServices] = useState(ccState.dialogue?.services ?? '');
  const [faqs, setFaqs] = useState(ccState.dialogue?.faqs ?? '');
  const [personality, setPersonality] = useState<CCDialogue['personality']>(ccState.dialogue?.personality ?? 'professional');

  function goTo(n: number) {
    onUpdate({ ...ccState, onboardingStep: n });
  }

  function saveStep1() {
    onUpdate({
      ...ccState,
      apiKeys: { twilioSid: twilioSid.trim(), twilioToken: twilioToken.trim(), openaiKey: openaiKey.trim() },
      onboardingStep: 2,
    });
  }

  function saveStep2() {
    const countryData = COUNTRIES.find(c => c.code === country)!;
    onUpdate({
      ...ccState,
      phone: { countryCode: country, countryName: countryData.name, countryFlag: '', phoneNumber: phoneNum.trim() },
      onboardingStep: 3,
    });
  }

  function saveStep3() {
    const dialogue: CCDialogue = { businessName: bizName, industry, businessHours: bizHours, services, faqs, personality };
    onUpdate({ ...ccState, dialogue, onboardingStep: 4 });
    onComplete();
  }

  const progressDots = [1, 2, 3];

  return (
    <div className="cc-content">
      <div className="cc-wizard">
        {/* Progress */}
        <div className="cc-wizard-progress">
          {progressDots.map((n, i) => (
            <>
              <div
                key={n}
                className={`cc-wizard-step-dot ${step > n ? 'cc-wizard-step-dot--done' : step === n ? 'cc-wizard-step-dot--active' : ''}`}
              >
                {step > n ? '✓' : n}
              </div>
              {i < progressDots.length - 1 && (
                <div key={`line-${n}`} className={`cc-wizard-step-line ${step > n + 1 ? 'cc-wizard-step-line--done' : ''}`} />
              )}
            </>
          ))}
        </div>

        {/* Step 1: API Keys */}
        {step === 1 && (
          <>
            <div className="cc-wizard-title">STEP 1 — API KEYS</div>
            <div className="cc-wizard-sub">
              Enter your Twilio and OpenAI keys. They're saved to your browser only — we never transmit or store them on our servers.
            </div>

            <div className="cc-provider-block">
              <div className="cc-provider-header">
                <span className="cc-provider-name">📞 Twilio</span>
                <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="cc-provider-link">Sign up (free $15 credit) →</a>
              </div>
              <div className="cc-provider-cost">Phone number: ~$1.50/mo · Calls: ~$0.01–0.02/min · Paid directly to Twilio</div>
              <div style={{ marginTop: '0.75rem' }}>
                <div className="cc-field">
                  <label className="cc-label">Account SID</label>
                  <input className="cc-input" type="text" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} />
                </div>
                <div className="cc-field" style={{ marginBottom: 0 }}>
                  <label className="cc-label">Auth Token</label>
                  <input className="cc-input" type="password" placeholder="Your Twilio Auth Token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="cc-provider-block">
              <div className="cc-provider-header">
                <span className="cc-provider-name">🧠 OpenAI</span>
                <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="cc-provider-link">Sign up for Platform →</a>
              </div>
              <div className="cc-provider-cost">Realtime API: ~$0.25 per 2-min call · Paid directly to OpenAI</div>
              <div style={{ marginTop: '0.75rem' }}>
                <div className="cc-field" style={{ marginBottom: 0 }}>
                  <label className="cc-label">API Key</label>
                  <input className="cc-input" type="password" placeholder="sk-proj-..." value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'rgba(28,11,85,0.28)', marginBottom: '1rem', lineHeight: '1.5' }}>
              🔒 Keys are encrypted and stored locally in your browser. They are sent only to Twilio and OpenAI's servers when you receive a call.
            </div>

            <div className="cc-wizard-nav">
              <button
                className="cc-btn cc-btn--primary"
                disabled={!twilioSid.trim() || !twilioToken.trim() || !openaiKey.trim()}
                onClick={saveStep1}
              >
                Save & Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Phone Number */}
        {step === 2 && (
          <>
            <div className="cc-wizard-title">STEP 2 — PHONE NUMBER</div>
            <div className="cc-wizard-sub">
              In your Twilio console, go to <strong>Phone Numbers → Buy a number</strong> and provision a local number in your country (~$1–2/month). Then enter it below.
            </div>

            <div className="cc-card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(28,11,85,0.48)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#3D1FA8' }}>How to get a number in Twilio:</strong><br />
                1. Log into <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="cc-infra-link">console.twilio.com</a><br />
                2. Phone Numbers → Manage → Buy a number<br />
                3. Select your country, choose a local number<br />
                4. Click "Buy" (~$1–2/month)<br />
                5. Copy the number and paste it below
              </div>
            </div>

            <div className="cc-field">
              <label className="cc-label">Country</label>
              <select className="cc-select" value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRIES.map(c => (
                  <option key={c.code + c.name} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label className="cc-label">Your Twilio phone number</label>
              <input className="cc-input" type="tel" placeholder={`${country} e.g. ${country} 2 1234 5678`} value={phoneNum} onChange={e => setPhoneNum(e.target.value)} />
            </div>

            <div className="cc-wizard-nav">
              <button className="cc-btn cc-btn--ghost" onClick={() => goTo(1)}>← Back</button>
              <button className="cc-btn cc-btn--primary" disabled={!phoneNum.trim()} onClick={saveStep2}>
                Save & Continue →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Dialogue Training */}
        {step === 3 && (
          <>
            <div className="cc-wizard-title">STEP 3 — TRAIN YOUR AI</div>
            <div className="cc-wizard-sub">
              Tell us about your business. The AI uses this to answer calls professionally on your behalf.
            </div>

            <div className="cc-field">
              <label className="cc-label">Business name</label>
              <input className="cc-input" placeholder="e.g. Smith Plumbing" value={bizName} onChange={e => setBizName(e.target.value)} />
            </div>
            <div className="cc-field">
              <label className="cc-label">Industry</label>
              <select className="cc-select" value={industry} onChange={e => setIndustry(e.target.value)}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="cc-field">
              <label className="cc-label">Business hours</label>
              <input className="cc-input" placeholder="e.g. Mon–Fri 8am–6pm, Sat 9am–2pm" value={bizHours} onChange={e => setBizHours(e.target.value)} />
            </div>
            <div className="cc-field">
              <label className="cc-label">Services you offer</label>
              <textarea
                className="cc-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="e.g. Emergency plumbing, hot water systems, blocked drains, bathroom renovations…"
                value={services}
                onChange={e => setServices(e.target.value)}
              />
            </div>
            <div className="cc-field">
              <label className="cc-label">Common questions & answers (FAQs)</label>
              <textarea
                className="cc-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                placeholder={"Q: Do you provide free quotes?\nA: Yes, we offer free quotes for all jobs over $200…"}
                value={faqs}
                onChange={e => setFaqs(e.target.value)}
              />
            </div>
            <div className="cc-field">
              <label className="cc-label">AI personality</label>
              <select className="cc-select" value={personality} onChange={e => setPersonality(e.target.value as CCDialogue['personality'])}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly & warm</option>
                <option value="casual">Casual & relaxed</option>
              </select>
            </div>

            {bizName && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(28,11,85,0.38)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System prompt preview</div>
                <div className="cc-prompt-preview">
                  {buildSystemPrompt({ businessName: bizName, industry, businessHours: bizHours, services, faqs, personality })}
                </div>
              </div>
            )}

            <div className="cc-wizard-nav">
              <button className="cc-btn cc-btn--ghost" onClick={() => goTo(2)}>← Back</button>
              <button className="cc-btn cc-btn--primary" disabled={!bizName.trim()} onClick={saveStep3}>
                Go Live →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MainDashboard ──────────────────────────────────────────────────────────
function MainDashboard({
  user,
  ccState,
  onUpdate,
  onLogout,
  onShowLightbox,
}: {
  user: CCUser;
  ccState: CCState;
  onUpdate: (s: CCState) => void;
  onLogout: () => void;
  onShowLightbox: () => void;
}) {
  const [tab, setTab] = useState<DashTab>('overview');
  const [walletInput, setWalletInput] = useState(user.walletAddress ?? '');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const isHolder = (user.deodrantBalance ?? 0) >= DEODRANT_REQUIRED;

  async function verifyWallet() {
    if (!walletInput.trim()) return;
    setVerifying(true);
    setVerifyMsg('');
    const balance = await verifyDeodrantBalance(walletInput.trim());
    updateCurrentUser({ walletAddress: walletInput.trim(), deodrantBalance: balance, deodrantVerifiedAt: Date.now() });
    setVerifying(false);
    setVerifyMsg(balance >= DEODRANT_REQUIRED
      ? `✓ Verified! You hold ${balance} $DEODRANT — $4.20/month plan activated.`
      : `Balance: ${balance} $DEODRANT (need ${DEODRANT_REQUIRED}+ for discounted rate). Standard plan applies.`
    );
  }

  const phone = ccState.phone;
  const dialogue = ccState.dialogue;

  return (
    <>
      {/* Overview */}
      {tab === 'overview' && (
        <div className="cc-content">
          <div className="cc-content-title">OVERVIEW</div>

          <div className="cc-stat-grid">
            <div className="cc-stat-card">
              <div className="cc-stat-label">Active number</div>
              <div className="cc-stat-value" style={{ fontSize: '1rem', paddingTop: '0.4rem' }}>
                {phone ? `${phone.countryCode} ${phone.phoneNumber}` : '—'}
              </div>
              <div className="cc-stat-sub">{phone ? phone.countryName : 'Not configured'}</div>
            </div>
            <div className="cc-stat-card">
              <div className="cc-stat-label">Calls this month</div>
              <div className="cc-stat-value">{ccState.callLogs.length}</div>
              <div className="cc-stat-sub">of any duration</div>
            </div>
            <div className="cc-stat-card">
              <div className="cc-stat-label">Plan</div>
              <div className="cc-stat-value" style={{ fontSize: '1rem', paddingTop: '0.4rem' }}>
                {isHolder ? `$${PRICE_HOLDER}/mo` : `$${PRICE_STANDARD}/mo`}
              </div>
              <div className="cc-stat-sub">{isHolder ? '$DEODRANT holder rate' : 'Standard rate'}</div>
            </div>
            <div className="cc-stat-card">
              <div className="cc-stat-label">AI status</div>
              <div style={{ marginTop: '0.4rem' }}>
                <span className={`cc-status ${phone && dialogue ? 'cc-status--live' : 'cc-status--setup'}`}>
                  <span className="cc-status-dot" />
                  {phone && dialogue ? 'Ready' : 'Setup needed'}
                </span>
              </div>
            </div>
          </div>

          {dialogue && (
            <div className="cc-card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(28,11,85,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Active configuration</div>
              <div style={{ fontSize: '0.9rem', color: '#1C0B55', marginBottom: '0.25rem' }}>{dialogue.businessName}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(28,11,85,0.42)' }}>{dialogue.industry} · {dialogue.businessHours}</div>
            </div>
          )}

          <div className="cc-card" style={{ background: 'rgba(155,40,40,0.06)', borderColor: 'rgba(155,40,40,0.2)' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(28,11,85,0.48)', lineHeight: '1.6' }}>
              <strong style={{ color: '#9B2828' }}>⚠ Integration pending</strong><br />
              Your Twilio webhook hasn't been connected yet. The AI will start answering calls once you point your Twilio phone number's "A CALL COMES IN" webhook to your DEODRANT Call Centre endpoint. This is set up for you when Twilio integration goes live.
            </div>
          </div>
        </div>
      )}

      {/* Calls */}
      {tab === 'calls' && (
        <div className="cc-content">
          <div className="cc-content-title">CALL HISTORY</div>
          {ccState.callLogs.length === 0 ? (
            <div className="cc-empty-state">
              <div className="cc-empty-icon">📵</div>
              <div className="cc-empty-title">No calls yet</div>
              <div className="cc-empty-sub">Your AI is standing by. Calls will appear here with transcripts once the Twilio webhook is live.</div>
            </div>
          ) : (
            <div>
              {ccState.callLogs.map(log => (
                <div key={log.id} className="cc-card" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span>{log.callerNumber}</span>
                    <span style={{ color: 'rgba(28,11,85,0.42)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(28,11,85,0.38)', marginTop: '0.25rem' }}>{log.durationSec}s · {log.transcript.substring(0, 120)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="cc-content">
          <div className="cc-content-title">SETTINGS</div>

          {/* Plan / wallet */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(28,11,85,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Your plan</div>
            <div className={`cc-plan-banner ${isHolder ? 'cc-plan-banner--holder' : 'cc-plan-banner--standard'}`}>
              <div>
                <div className="cc-plan-name">{isHolder ? '🪙 DEODRANT HOLDER' : 'STANDARD PLAN'}</div>
                <div className="cc-plan-desc">{isHolder ? `${user.deodrantBalance} $DEODRANT verified` : `Hold ${DEODRANT_REQUIRED}+ $DEODRANT to unlock $4.20/month`}</div>
              </div>
              <div className="cc-plan-price">${isHolder ? PRICE_HOLDER.toFixed(2) : PRICE_STANDARD.toFixed(0)}/mo</div>
            </div>

            {!isHolder && (
              <button className="cc-btn cc-btn--outline cc-btn--sm" style={{ marginBottom: '0.75rem' }} onClick={onShowLightbox}>
                How to get $DEODRANT →
              </button>
            )}

            <div className="cc-field">
              <label className="cc-label">Solana wallet address (public key)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="cc-input" placeholder="Your public wallet address" value={walletInput} onChange={e => setWalletInput(e.target.value)} />
                <button className="cc-btn cc-btn--outline cc-btn--sm" style={{ flexShrink: 0 }} onClick={verifyWallet} disabled={verifying || !walletInput.trim()}>
                  {verifying ? '…' : 'Verify'}
                </button>
              </div>
              {verifyMsg && <div style={{ fontSize: '0.78rem', color: verifyMsg.startsWith('✓') ? '#28907F' : 'rgba(28,11,85,0.48)', marginTop: '0.4rem' }}>{verifyMsg}</div>}
            </div>
          </div>

          <hr className="cc-divider" />

          {/* API keys */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(28,11,85,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>API keys</div>
            <div className="cc-card">
              <div style={{ fontSize: '0.82rem', color: 'rgba(28,11,85,0.58)', lineHeight: '1.6' }}>
                Twilio SID: <span style={{ color: '#1C0B55', fontFamily: 'monospace' }}>{ccState.apiKeys?.twilioSid ? '●●●●' + ccState.apiKeys.twilioSid.slice(-4) : '—'}</span><br />
                Twilio Token: <span style={{ color: '#1C0B55', fontFamily: 'monospace' }}>{ccState.apiKeys?.twilioToken ? '●●●●' + ccState.apiKeys.twilioToken.slice(-4) : '—'}</span><br />
                OpenAI Key: <span style={{ color: '#1C0B55', fontFamily: 'monospace' }}>{ccState.apiKeys?.openaiKey ? '●●●●' + ccState.apiKeys.openaiKey.slice(-4) : '—'}</span>
              </div>
              <button className="cc-btn cc-btn--ghost cc-btn--sm" style={{ marginTop: '0.75rem' }} onClick={() => onUpdate({ ...ccState, onboardingStep: 1 })}>
                Update API keys
              </button>
            </div>
          </div>

          <hr className="cc-divider" />

          {/* Profile */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(28,11,85,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Account</div>
            <div className="cc-card">
              <div style={{ fontSize: '0.85rem', color: 'rgba(28,11,85,0.65)', lineHeight: '1.8' }}>
                <strong style={{ color: '#1C0B55' }}>{user.name}</strong><br />
                {user.email}<br />
                <span style={{ color: 'rgba(28,11,85,0.38)', fontSize: '0.75rem' }}>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button className="cc-btn cc-btn--ghost cc-btn--sm" style={{ marginTop: '0.75rem' }} onClick={onLogout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar nav rendered externally — handled by DashboardView */}
    </>
  );
}

// ── DashboardView ──────────────────────────────────────────────────────────
function DashboardView({
  user,
  ccState,
  onUpdate,
  onLogout,
  onShowLightbox,
}: {
  user: CCUser;
  ccState: CCState;
  onUpdate: (s: CCState) => void;
  onLogout: () => void;
  onShowLightbox: () => void;
}) {
  const [tab, setTab] = useState<DashTab>('overview');
  const onboarding = (ccState.onboardingStep ?? 0) < 4;

  function setTabAndReset(t: DashTab) {
    setTab(t);
    // If we go back to onboarding reset step 
    if (onboarding && ccState.onboardingStep === 0) {
      onUpdate({ ...ccState, onboardingStep: 1 });
    }
  }

  if (onboarding && (ccState.onboardingStep ?? 0) < 4) {
    // Show onboarding wizard
    return (
      <div className="cc-dashboard" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-comic)', fontSize: '0.85rem', color: 'rgba(255,224,51,0.6)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>ONBOARDING</div>
            <div style={{ fontFamily: 'var(--font-comic)', fontSize: '1.5rem', color: '#3D1FA8', letterSpacing: '0.04em' }}>
              Let's set up your AI call centre
            </div>
            <div style={{ fontSize: '0.83rem', color: 'rgba(28,11,85,0.42)', marginTop: '0.3rem' }}>
              Welcome, {user.name}. Three quick steps and your AI is answering calls.
            </div>
          </div>
          <OnboardingWizard
            user={user}
            ccState={{ ...ccState, onboardingStep: Math.max(1, ccState.onboardingStep ?? 1) }}
            onUpdate={onUpdate}
            onComplete={() => { /* state already set to step 4 */ }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="cc-dashboard">
      <div className="cc-sidebar">
        <div className="cc-sidebar-section">Dashboard</div>
        {(['overview', 'calls', 'settings'] as DashTab[]).map(t => (
          <button
            key={t}
            className={`cc-sidebar-btn ${tab === t ? 'cc-sidebar-btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' && '📊 '}{t === 'calls' && '📞 '}{t === 'settings' && '⚙️ '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <MainDashboard
        user={user}
        ccState={ccState}
        onUpdate={onUpdate}
        onLogout={onLogout}
        onShowLightbox={onShowLightbox}
      />
    </div>
  );
}

// ── CallCentre (main export) ───────────────────────────────────────────────
export default function CallCentre() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<CCView>('intro');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [user, setUser] = useState<CCUser | null>(null);
  const [ccState, setCCState] = useState<CCState>({ callLogs: [], onboardingStep: 0 });
  const [showLightbox, setShowLightbox] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUser(u);
      setCCState(getCCState(u.id));
      setView('dashboard');
    }
  }, []);

  function handleAuthSuccess() {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    const state = getCCState(u.id);
    setCCState(state.onboardingStep === 0 ? { ...state, onboardingStep: 1 } : state);
    setView('dashboard');
  }

  function handleUpdate(newState: CCState) {
    if (!user) return;
    setCCState(newState);
    saveCCState(user.id, newState);
  }

  function handleLogout() {
    logOut();
    setUser(null);
    setCCState({ callLogs: [], onboardingStep: 0 });
    setView('intro');
  }

  function handleGetStarted(mode: AuthMode) {
    setAuthMode(mode);
    setView('auth');
  }

  return (
    <div className="cc-page">
      {/* Top bar */}
      <div className="cc-topbar">
        <a href="/" className="cc-back-link" onClick={e => { e.preventDefault(); navigate('/'); }}>
          ← DEODRANT
        </a>
        <div className="cc-topbar-logo">AI CALL CENTRE</div>
        <div className="cc-topbar-user">
          {user ? (
            <>
              <span>{user.name}</span>
              <button className="cc-logout-btn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <button className="cc-btn cc-btn--outline cc-btn--sm" onClick={() => handleGetStarted('login')}>
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Views */}
      {view === 'intro' && (
        <IntroView onGetStarted={handleGetStarted} onShowLightbox={() => setShowLightbox(true)} />
      )}
      {view === 'auth' && (
        <AuthView defaultMode={authMode} onBack={() => setView('intro')} onSuccess={handleAuthSuccess} />
      )}
      {view === 'dashboard' && user && (
        <DashboardView
          user={user}
          ccState={ccState}
          onUpdate={handleUpdate}
          onLogout={handleLogout}
          onShowLightbox={() => setShowLightbox(true)}
        />
      )}

      {/* Lightbox */}
      {showLightbox && <DeodrantLightbox onClose={() => setShowLightbox(false)} />}
    </div>
  );
}
