import { useState } from 'react';
import { useLocation } from 'wouter';
import '../xclean.css';

// ── SVG Comic Panels ───────────────────────────────────────────────────────

function PoliceSVG() {
  return (
    <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="xc-panel-svg">
      {/* Room background */}
      <rect x="0" y="0" width="220" height="280" fill="#0a0a1a"/>
      {/* Halftone dots */}
      {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
        <circle key={`${r}-${c}`} cx={8+c*32} cy={8+r*40} r="3" fill="#1a1a4a" opacity="0.6"/>
      )))}
      {/* Desk */}
      <rect x="20" y="190" width="180" height="12" rx="2" fill="#2a1a0a" stroke="#5a3a1a" strokeWidth="1.5"/>
      {/* Monitor */}
      <rect x="50" y="110" width="120" height="85" rx="4" fill="#111" stroke="#4FC3F7" strokeWidth="2.5"/>
      <rect x="54" y="114" width="112" height="77" rx="2" fill="#0d1b2a"/>
      {/* Monitor stand */}
      <rect x="100" y="195" width="20" height="10" rx="1" fill="#3a2a1a"/>
      <rect x="85" y="203" width="50" height="5" rx="2" fill="#3a2a1a"/>
      {/* Screen content - X logo */}
      <text x="110" y="138" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff" fontFamily="Georgia, serif">𝕏</text>
      {/* Suspicious tweets on screen */}
      <rect x="60" y="145" width="75" height="5" rx="2" fill="#4FC3F7" opacity="0.7"/>
      <rect x="60" y="154" width="55" height="5" rx="2" fill="#f5c518" opacity="0.5"/>
      <rect x="60" y="163" width="65" height="5" rx="2" fill="#ef4444" opacity="0.6"/>
      <rect x="60" y="172" width="45" height="5" rx="2" fill="#4FC3F7" opacity="0.4"/>
      {/* Red circle on suspicious post */}
      <circle cx="144" cy="156" r="12" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2"/>
      {/* Magnifying glass */}
      <circle cx="148" cy="160" r="9" fill="none" stroke="#ef4444" strokeWidth="2.5"/>
      <line x1="154" y1="166" x2="162" y2="174" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      {/* Police officer body */}
      <rect x="68" y="55" width="44" height="55" rx="6" fill="#1a237e"/>
      {/* Police jacket lapels */}
      <polygon points="90,55 82,75 90,70" fill="#283593"/>
      <polygon points="90,55 98,75 90,70" fill="#283593"/>
      {/* Badge */}
      <polygon points="90,62 93,67 88,67" fill="#f5c518"/>
      {/* Police head */}
      <ellipse cx="90" cy="42" rx="20" ry="22" fill="#FFDAB9"/>
      {/* Police hat - UK custodian helmet */}
      <ellipse cx="90" cy="22" rx="22" ry="8" fill="#1a237e"/>
      <rect x="68" y="20" width="44" height="14" rx="3" fill="#1a237e"/>
      {/* Checkered band */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i} x={68+i*4.4} y={28} width="2.2" height="3" fill={i%2===0 ? '#fff':'#000'} opacity="0.9"/>
      ))}
      <rect x="68" y="15" width="44" height="6" rx="2" fill="#283593"/>
      {/* Hat top dome */}
      <ellipse cx="90" cy="15" rx="16" ry="8" fill="#1a237e"/>
      {/* Hat badge */}
      <circle cx="90" cy="20" r="4" fill="#f5c518" stroke="#000" strokeWidth="0.5"/>
      {/* Eyes - squinting suspicious */}
      <ellipse cx="83" cy="40" rx="6" ry="3" fill="white"/>
      <ellipse cx="97" cy="40" rx="6" ry="3" fill="white"/>
      <circle cx="84" cy="40" r="2.5" fill="#2c3e50"/>
      <circle cx="98" cy="40" r="2.5" fill="#2c3e50"/>
      {/* Eyebrows furrowed */}
      <path d="M77 36 Q83 33 89 36" stroke="#4a2c0a" strokeWidth="2" fill="none"/>
      <path d="M91 36 Q97 33 103 36" stroke="#4a2c0a" strokeWidth="2" fill="none"/>
      {/* Mouth - pursed */}
      <path d="M84 50 Q90 48 96 50" stroke="#c0795a" strokeWidth="1.5" fill="none"/>
      {/* Arm pointing at screen */}
      <rect x="112" y="68" width="38" height="10" rx="5" fill="#1a237e" transform="rotate(-20 112 68)"/>
      <circle cx="148" cy="76" r="7" fill="#FFDAB9"/>
      {/* Speech bubble */}
      <rect x="130" y="10" width="82" height="40" rx="8" fill="#fff" stroke="#000" strokeWidth="2"/>
      <polygon points="148,50 155,50 150,62" fill="#fff" stroke="#000" strokeWidth="1.5"/>
      <text x="171" y="26" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#000" fontFamily="Bangers, cursive">UK CYBER</text>
      <text x="171" y="36" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#000" fontFamily="Bangers, cursive">AUTHORITY</text>
      <text x="171" y="46" textAnchor="middle" fontSize="6.5" fill="#1a237e" fontFamily="Bangers, cursive">UNIT 42</text>
      {/* Papers on desk */}
      <rect x="30" y="185" width="30" height="6" rx="1" fill="#fff" opacity="0.8" transform="rotate(-5 30 185)"/>
      <rect x="25" y="186" width="30" height="6" rx="1" fill="#fff" opacity="0.6" transform="rotate(3 25 186)"/>
      {/* Coffee mug */}
      <rect x="160" y="182" width="16" height="14" rx="3" fill="#fff" stroke="#ccc" strokeWidth="1"/>
      <path d="M176 186 Q182 186 182 190 Q182 194 176 194" fill="none" stroke="#ccc" strokeWidth="1.5"/>
      <rect x="162" y="184" width="12" height="3" rx="1" fill="#6f4e37"/>
    </svg>
  );
}

function ArrestSVG() {
  return (
    <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="xc-panel-svg">
      {/* Bright alert background */}
      <rect x="0" y="0" width="220" height="280" fill="#1a0000"/>
      {/* Red alert flashes */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={i*44} y="0" width="44" height="280" fill="#ff0000" opacity={i%2===0 ? 0.07 : 0}/>
      ))}
      {/* Halftone */}
      {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5].map(c => (
        <circle key={`${r}-${c}`} cx={18+c*37} cy={18+r*40} r="4" fill="#3a0000" opacity="0.5"/>
      )))}
      {/* Officer body - more dramatic angle */}
      <rect x="72" y="100" width="50" height="65" rx="6" fill="#1a237e" transform="rotate(-5 72 100)"/>
      <polygon points="97,100 87,122 97,116" fill="#283593" transform="rotate(-5 97 100)"/>
      <polygon points="97,100 107,122 97,116" fill="#283593" transform="rotate(-5 97 100)"/>
      {/* Epaulettes */}
      <rect x="68" y="98" width="14" height="8" rx="2" fill="#f5c518" transform="rotate(-5 68 98)"/>
      <rect x="110" y="96" width="14" height="8" rx="2" fill="#f5c518" transform="rotate(-5 110 96)"/>
      {/* Head */}
      <ellipse cx="97" cy="76" rx="22" ry="24" fill="#FFDAB9"/>
      {/* Police hat UK */}
      <ellipse cx="97" cy="54" rx="24" ry="9" fill="#1a237e"/>
      <rect x="73" y="52" width="48" height="15" rx="3" fill="#1a237e"/>
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <rect key={i} x={73+i*4.3} y={61} width="2.2" height="3.5" fill={i%2===0 ? '#fff':'#000'}/>
      ))}
      <ellipse cx="97" cy="52" rx="18" ry="9" fill="#1a237e"/>
      <circle cx="97" cy="56" r="4.5" fill="#f5c518" stroke="#000" strokeWidth="0.5"/>
      {/* Eyes - wide shouting */}
      <ellipse cx="89" cy="74" rx="7" ry="8" fill="white" stroke="#000" strokeWidth="1"/>
      <ellipse cx="105" cy="74" rx="7" ry="8" fill="white" stroke="#000" strokeWidth="1"/>
      <circle cx="90" cy="75" r="4" fill="#1a237e"/>
      <circle cx="106" cy="75" r="4" fill="#1a237e"/>
      <circle cx="91" cy="73" r="1.5" fill="white"/>
      <circle cx="107" cy="73" r="1.5" fill="white"/>
      {/* Mouth - wide open yelling */}
      <ellipse cx="97" cy="90" rx="13" ry="9" fill="#cc1111" stroke="#000" strokeWidth="1.5"/>
      <ellipse cx="97" cy="93" rx="8" ry="5" fill="#000" opacity="0.7"/>
      {/* Teeth */}
      <rect x="89" y="90" width="6" height="4" rx="1" fill="white"/>
      <rect x="97" y="90" width="6" height="4" rx="1" fill="white"/>
      {/* Megaphone arm */}
      <rect x="110" y="110" width="45" height="12" rx="5" fill="#1a237e" transform="rotate(15 110 110)"/>
      {/* Megaphone */}
      <polygon points="148,102 175,88 175,128 148,118" fill="#f5c518" stroke="#000" strokeWidth="2"/>
      <rect x="144" y="103" width="8" height="16" rx="2" fill="#4a3a00" stroke="#000" strokeWidth="1"/>
      {/* Sound waves */}
      <path d="M176 100 Q186 108 176 116" stroke="#f5c518" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M178 95 Q192 108 178 121" stroke="#f5c518" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M180 90 Q198 108 180 126" stroke="#f5c518" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4"/>
      {/* Other arm raised */}
      <rect x="58" y="108" width="16" height="40" rx="7" fill="#1a237e" transform="rotate(30 58 108)"/>
      <circle cx="46" cy="138" r="8" fill="#FFDAB9"/>
      {/* ALERT badge */}
      <rect x="10" y="220" width="200" height="50" rx="4" fill="#ef4444" stroke="#fff" strokeWidth="2"/>
      <text x="110" y="242" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff" fontFamily="Impact, Bangers, cursive" letterSpacing="1">⚠ EVIDENCE DETECTED</text>
      <text x="110" y="260" textAnchor="middle" fontSize="9.5" fill="#fff" fontFamily="Bangers, cursive" letterSpacing="0.5">DISPATCH UNIT SAAR!</text>
    </svg>
  );
}

function TrollSVG() {
  return (
    <svg viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg" className="xc-panel-svg">
      {/* Comic yellow-green background */}
      <rect x="0" y="0" width="220" height="280" fill="#0d1a00"/>
      {/* Halftone - green tint */}
      {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
        <circle key={`${r}-${c}`} cx={8+c*32} cy={8+r*40} r="3.5" fill="#1a3300" opacity="0.7"/>
      )))}
      {/* Troll body - stick figure with chunky look */}
      {/* Body */}
      <line x1="90" y1="155" x2="90" y2="220" stroke="#FFE600" strokeWidth="6" strokeLinecap="round"/>
      {/* Left arm - holding can */}
      <line x1="90" y1="165" x2="50" y2="195" stroke="#FFE600" strokeWidth="6" strokeLinecap="round"/>
      {/* Right arm - holding phone getting sprayed */}
      <line x1="90" y1="165" x2="135" y2="185" stroke="#FFE600" strokeWidth="6" strokeLinecap="round"/>
      {/* Left leg */}
      <line x1="90" y1="220" x2="65" y2="265" stroke="#FFE600" strokeWidth="6" strokeLinecap="round"/>
      {/* Right leg */}
      <line x1="90" y1="220" x2="115" y2="265" stroke="#FFE600" strokeWidth="6" strokeLinecap="round"/>
      {/* Feet */}
      <ellipse cx="60" cy="267" rx="12" ry="5" fill="#FFE600"/>
      <ellipse cx="120" cy="267" rx="12" ry="5" fill="#FFE600"/>
      {/* DEODRANT CAN in left hand */}
      <rect x="22" y="188" width="22" height="38" rx="5" fill="#3D1FA8" stroke="#f5c518" strokeWidth="2"/>
      <rect x="22" y="188" width="22" height="10" rx="3" fill="#f5c518"/>
      <text x="33" y="198" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#3D1FA8" fontFamily="Bangers, cursive">$DEO</text>
      <rect x="26" y="220" width="14" height="4" rx="1" fill="#f5c518" opacity="0.7"/>
      {/* Nozzle */}
      <rect x="38" y="192" width="10" height="4" rx="2" fill="#c0c0c0"/>
      {/* Spray particles going toward phone */}
      {[[52,190,4],[58,184,3],[65,179,4],[70,175,3],[76,172,4],[82,170,3]].map(([x,y,r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#7B2FFF" opacity={0.7 - i*0.08}/>
      ))}
      {/* Purple mist */}
      <ellipse cx="100" cy="175" rx="28" ry="14" fill="#7B2FFF" opacity="0.25"/>
      {/* Phone in right hand */}
      <rect x="132" y="174" width="22" height="38" rx="4" fill="#111" stroke="#555" strokeWidth="2"/>
      <rect x="135" y="178" width="16" height="28" rx="2" fill="#0d1b2a"/>
      {/* X on phone screen */}
      <text x="143" y="196" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="Georgia,serif">𝕏</text>
      {/* Spray hitting phone with effect */}
      <ellipse cx="132" cy="183" rx="10" ry="8" fill="#7B2FFF" opacity="0.5"/>
      <circle cx="128" cy="179" r="3" fill="#f5c518" opacity="0.8"/>
      <circle cx="134" cy="175" r="2" fill="#7B2FFF" opacity="0.9"/>
      {/* TROLL HEAD - large and iconic */}
      {/* Neck */}
      <rect x="82" y="122" width="16" height="10" rx="4" fill="#ffe680"/>
      {/* Head shape */}
      <ellipse cx="90" cy="108" rx="40" ry="36" fill="#ffe680" stroke="#000" strokeWidth="2"/>
      {/* Classic troll eyebrows - thick V shape */}
      <path d="M60 94 L74 102 L88 96" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M120 94 L106 102 L92 96" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Troll eyes - beady and mischievous */}
      <circle cx="74" cy="106" r="10" fill="white" stroke="#000" strokeWidth="2"/>
      <circle cx="106" cy="106" r="10" fill="white" stroke="#000" strokeWidth="2"/>
      <circle cx="76" cy="107" r="5" fill="#000"/>
      <circle cx="108" cy="107" r="5" fill="#000"/>
      <circle cx="77" cy="105" r="2" fill="white"/>
      <circle cx="109" cy="105" r="2" fill="white"/>
      {/* Troll grin - the signature wide smile */}
      <path d="M55 118 Q90 148 125 118" fill="#000" stroke="#000" strokeWidth="2"/>
      <path d="M55 118 Q90 136 125 118" fill="#ffe680"/>
      {/* Teeth - wide and visible */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={60+i*9} y={120} width="7" height="10" rx="1" fill="white" stroke="#ccc" strokeWidth="0.5"/>
      ))}
      {/* Troll hair - wild green */}
      {[-20,-12,-4,4,12,20,28].map((x,i) => (
        <ellipse key={i} cx={70+x} cy={72} rx="5" ry={12+Math.abs(i-3)*2} fill="#00cc44" transform={`rotate(${(i-3)*8} ${70+x} 100)`}/>
      ))}
      {/* KEK label burst */}
      <polygon points="178,20 190,10 195,24 210,20 200,32 210,44 196,40 190,54 182,42 168,46 174,32 160,24" fill="#FFE600" stroke="#000" strokeWidth="1.5"/>
      <text x="188" y="34" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#000" fontFamily="Impact, Bangers, cursive">KEK</text>
    </svg>
  );
}

// ── Lightning Divider ──────────────────────────────────────────────────────
function XLightning() {
  return (
    <svg viewBox="0 0 50 180" xmlns="http://www.w3.org/2000/svg" className="xc-lightning" preserveAspectRatio="none">
      <polygon points="35,0 12,80 30,80 8,180 50,70 28,70 50,0" fill="#7B2FFF" stroke="#000" strokeWidth="2"/>
    </svg>
  );
}

// ── Types & Constants ──────────────────────────────────────────────────────
type CleanTab = 'all' | 'posts' | 'likes' | 'reposts' | 'search' | 'dates';
type ConnectStep = 'gate' | 'connect' | 'dashboard';

const TIER_BURN = 42_000;
const TIER_HOLD = 420_000;

// ── Main Component ──────────────────────────────────────────────────────────
export default function XCleanSaar() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<ConnectStep>('gate');
  const [activeTab, setActiveTab] = useState<CleanTab>('all');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTier, setSelectedTier] = useState<'burn' | 'hold'>('burn');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [cleanedCount, setCleanedCount] = useState<Record<string, number>>({});
  const [keywordResults, setKeywordResults] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);

  function handleGatePassed() {
    setStep('connect');
  }

  function handleConnect() {
    setStep('dashboard');
  }

  function handleClean(action: string, label: string) {
    if (confirming === action) {
      setCleanedCount(prev => ({ ...prev, [action]: (prev[action] ?? 0) + 1 }));
      setConfirming(null);
    } else {
      setConfirming(action);
      setTimeout(() => setConfirming(c => c === action ? null : c), 4000);
    }
  }

  function handleKeywordSearch() {
    if (!keyword.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setKeywordResults([
        `"${keyword}" mentioned in jeet about weekend market`,
        `Replied to @someone with "${keyword}" in context`,
        `Quote repost referencing "${keyword}" in argument`,
        `Old post from 2022 with "${keyword}" — cringe`,
        `Reply chain: "${keyword}" saar 😭`,
      ]);
      setSearching(false);
    }, 1200);
  }

  function togglePost(p: string) {
    setSelectedPosts(prev => {
      const n = new Set(prev);
      n.has(p) ? n.delete(p) : n.add(p);
      return n;
    });
  }

  return (
    <div className="xc-page">

      {/* Nav */}
      <nav className="xc-nav">
        <button className="xc-nav-back" onClick={() => navigate('/')} title="Back to DEODRANT">
          <img src="/deodrant-can.png" alt="DEODRANT" className="xc-nav-can" />
        </button>
        <div className="xc-nav-title">X CLEAN, SAAR!</div>
        <div className="xc-nav-badge">🧹 DIGITAL HYGIENE</div>
      </nav>

      {/* ── Hero Comic Strip ───────────────────────────────────── */}
      <section className="xc-hero-img">
        <img src="/xclean-comic.png" alt="X Clean Saar comic strip" className="xc-hero-img__img" />
      </section>

      {/* Title Band */}
      <div className="xc-title-band">
        <h1 className="xc-title">X CLEAN, SAAR!</h1>
        <p className="xc-subtitle">SCRUB YOUR TIMELINE · VANISH THE EVIDENCE · SPRAY AWAY THE JEET POSTS</p>
        <div className="xc-words">
          <span>ZAP!</span><span>DELETE!</span><span>CLEAN!</span><span>KEK!</span>
        </div>
      </div>

      <div className="xc-content">

        {/* ── Cost Breakdown ─────────────────────────────────── */}
        <section className="xc-section">
          <div className="xc-section-header">
            <div className="xc-step-num">💰</div>
            <div>
              <div className="xc-section-title">PRICING, SAAR</div>
              <div className="xc-section-sub">No subscriptions. No fees. Just token gates.</div>
            </div>
          </div>

          <div className="xc-pricing-grid">
            <div className="xc-price-card xc-price-card--free">
              <div className="xc-price-tag">FREE</div>
              <div className="xc-price-label">After Token Gate</div>
              <div className="xc-price-desc">Unlimited cleans. No monthly fees. No per-action charges. You pay each API provider directly (X API is free tier for personal use).</div>
            </div>

            <div className="xc-price-vs">VS</div>

            <div className="xc-price-others">
              <div className="xc-price-competitor">
                <div className="xc-comp-name">Semiphemeral</div>
                <div className="xc-comp-price">$6/month</div>
              </div>
              <div className="xc-price-competitor">
                <div className="xc-comp-name">TweetDelete</div>
                <div className="xc-comp-price">$7.99/month</div>
              </div>
              <div className="xc-price-competitor">
                <div className="xc-comp-name">RedactApp</div>
                <div className="xc-comp-price">$6.99/month</div>
              </div>
              <div className="xc-comp-note">We save you ~$84/year, saar.</div>
            </div>
          </div>

          {/* Features included */}
          <div className="xc-features-list">
            <div className="xc-feature-item">✓ Delete all posts (bulk)</div>
            <div className="xc-feature-item">✓ Remove all likes</div>
            <div className="xc-feature-item">✓ Undo all reposts</div>
            <div className="xc-feature-item">✓ Keyword search &amp; delete</div>
            <div className="xc-feature-item">✓ Date range filter</div>
            <div className="xc-feature-item">✓ Individual post selection</div>
            <div className="xc-feature-item">✓ Your X API — your data stays yours</div>
          </div>
        </section>

        {/* ── Token Gate ─────────────────────────────────────── */}
        {step === 'gate' && (
          <section className="xc-section xc-section--gate">
            <div className="xc-section-header">
              <div className="xc-step-num">01</div>
              <div>
                <div className="xc-section-title">PASS THE GATE, SAAR</div>
                <div className="xc-section-sub">One-time check. Hold or burn $DEODRANT to unlock forever.</div>
              </div>
            </div>

            <div className="xc-gate-grid">
              <button
                className={`xc-gate-card${selectedTier === 'burn' ? ' xc-gate-card--selected' : ''}`}
                onClick={() => setSelectedTier('burn')}
              >
                <div className="xc-gate-icon">🔥</div>
                <div className="xc-gate-tier">BURN</div>
                <div className="xc-gate-amount">{TIER_BURN.toLocaleString()}</div>
                <div className="xc-gate-token">$DEODRANT</div>
                <div className="xc-gate-note">One-time burn. Gone but clean.</div>
              </button>

              <div className="xc-gate-or">OR</div>

              <button
                className={`xc-gate-card${selectedTier === 'hold' ? ' xc-gate-card--selected' : ''}`}
                onClick={() => setSelectedTier('hold')}
              >
                <div className="xc-gate-icon">💎</div>
                <div className="xc-gate-tier">HOLD</div>
                <div className="xc-gate-amount">{TIER_HOLD.toLocaleString()}</div>
                <div className="xc-gate-token">$DEODRANT</div>
                <div className="xc-gate-note">Keep holding, keep access.</div>
              </button>
            </div>

            <div className="xc-gate-crosswalk">
              <span>🔄</span>
              <span>Already verified for the AI Call Centre or another DEODRANT service at equal or higher tier? <strong>You're automatically approved</strong> — cross-checks across all services.</span>
            </div>

            <button className="xc-verify-btn" onClick={handleGatePassed}>
              ✓ VERIFY MY {selectedTier === 'burn' ? 'BURN' : 'HOLDINGS'}, SAAR
            </button>
            <div className="xc-verify-note">We check your wallet on-chain. Nothing stored on our end.</div>
          </section>
        )}

        {/* ── Connect X Account ───────────────────────────────── */}
        {step === 'connect' && (
          <section className="xc-section xc-section--connect">
            <div className="xc-gate-badge">✓ TOKEN GATE PASSED, SAAR</div>

            <div className="xc-section-header">
              <div className="xc-step-num">02</div>
              <div>
                <div className="xc-section-title">CONNECT YOUR 𝕏 ACCOUNT</div>
                <div className="xc-section-sub">We use your own X API credentials. Your data never touches our servers.</div>
              </div>
            </div>

            <div className="xc-connect-card">
              <div className="xc-connect-x-logo">𝕏</div>
              <div className="xc-connect-title">Login with X</div>
              <div className="xc-connect-desc">
                Click below to authenticate with your X account via OAuth. We request only the minimum permissions needed: read your posts, delete your posts, manage your likes and reposts.
              </div>
              <div className="xc-connect-perms">
                <div className="xc-perm">📖 Read posts &amp; timeline</div>
                <div className="xc-perm">🗑️ Delete your own posts</div>
                <div className="xc-perm">❤️ Manage likes</div>
                <div className="xc-perm">🔁 Manage reposts</div>
              </div>
              <div className="xc-connect-privacy">
                🔒 Zero-access to DMs. Zero data stored. OAuth token lives in your browser only.
              </div>
              <button className="xc-connect-btn" onClick={handleConnect}>
                <span className="xc-connect-btn-x">𝕏</span>
                CONNECT WITH X, SAAR
              </button>
            </div>
          </section>
        )}

        {/* ── Dashboard ──────────────────────────────────────── */}
        {step === 'dashboard' && (
          <section className="xc-section xc-section--dashboard">
            <div className="xc-gate-badge">✓ CONNECTED AS @your_x_handle</div>

            <div className="xc-dash-tabs">
              {([
                ['all',     '💥 NUKE ALL'],
                ['posts',   '📝 Posts'],
                ['likes',   '❤️ Likes'],
                ['reposts', '🔁 Reposts'],
                ['search',  '🔍 Keyword'],
                ['dates',   '📅 Dates'],
              ] as [CleanTab, string][]).map(([tab, label]) => (
                <button
                  key={tab}
                  className={`xc-tab${activeTab === tab ? ' xc-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* NUKE ALL */}
            {activeTab === 'all' && (
              <div className="xc-tab-content">
                <div className="xc-nuke-warning">
                  ☢️ <strong>NUKE MODE.</strong> This erases everything. Likes, posts, and reposts gone permanently. No undo, saar.
                </div>
                <div className="xc-action-grid">
                  {[
                    { id: 'nuke-posts',   icon: '📝', label: 'DELETE ALL POSTS',   count: '2,847' },
                    { id: 'nuke-likes',   icon: '❤️', label: 'REMOVE ALL LIKES',   count: '14,203' },
                    { id: 'nuke-reposts', icon: '🔁', label: 'UNDO ALL REPOSTS',   count: '891' },
                  ].map(item => (
                    <div key={item.id} className="xc-action-card">
                      <div className="xc-action-icon">{item.icon}</div>
                      <div className="xc-action-label">{item.label}</div>
                      <div className="xc-action-count">{item.count} detected</div>
                      {cleanedCount[item.id] ? (
                        <div className="xc-action-done">✓ CLEANED, SAAR</div>
                      ) : (
                        <button
                          className={`xc-action-btn${confirming === item.id ? ' xc-action-btn--confirm' : ''}`}
                          onClick={() => handleClean(item.id, item.label)}
                        >
                          {confirming === item.id ? '⚠ TAP AGAIN TO CONFIRM' : `CLEAN ${item.icon}`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
              <div className="xc-tab-content">
                <div className="xc-tab-desc">Delete individual posts or all at once.</div>
                {cleanedCount['all-posts'] ? (
                  <div className="xc-done-banner">✓ ALL POSTS DELETED, SAAR</div>
                ) : (
                  <button
                    className={`xc-big-btn${confirming === 'all-posts' ? ' xc-big-btn--confirm' : ''}`}
                    onClick={() => handleClean('all-posts', 'all posts')}
                  >
                    {confirming === 'all-posts' ? '⚠ TAP AGAIN TO NUKE ALL POSTS' : '🗑️ DELETE ALL POSTS (2,847)'}
                  </button>
                )}
              </div>
            )}

            {/* Likes */}
            {activeTab === 'likes' && (
              <div className="xc-tab-content">
                <div className="xc-tab-desc">Remove all likes from your account history.</div>
                {cleanedCount['all-likes'] ? (
                  <div className="xc-done-banner">✓ ALL LIKES REMOVED, SAAR</div>
                ) : (
                  <button
                    className={`xc-big-btn${confirming === 'all-likes' ? ' xc-big-btn--confirm' : ''}`}
                    onClick={() => handleClean('all-likes', 'all likes')}
                  >
                    {confirming === 'all-likes' ? '⚠ TAP AGAIN TO UNLIKE EVERYTHING' : '❤️ REMOVE ALL LIKES (14,203)'}
                  </button>
                )}
              </div>
            )}

            {/* Reposts */}
            {activeTab === 'reposts' && (
              <div className="xc-tab-content">
                <div className="xc-tab-desc">Undo all reposts (retweets) from your account.</div>
                {cleanedCount['all-reposts'] ? (
                  <div className="xc-done-banner">✓ ALL REPOSTS UNDONE, SAAR</div>
                ) : (
                  <button
                    className={`xc-big-btn${confirming === 'all-reposts' ? ' xc-big-btn--confirm' : ''}`}
                    onClick={() => handleClean('all-reposts', 'all reposts')}
                  >
                    {confirming === 'all-reposts' ? '⚠ TAP AGAIN TO UNDO ALL REPOSTS' : '🔁 UNDO ALL REPOSTS (891)'}
                  </button>
                )}
              </div>
            )}

            {/* Keyword Search */}
            {activeTab === 'search' && (
              <div className="xc-tab-content">
                <div className="xc-tab-desc">⌘F for your timeline — find posts containing a word and delete them all or pick individually.</div>
                <div className="xc-search-row">
                  <input
                    className="xc-search-input"
                    placeholder="Search your posts... e.g. 'jeet' or 'wen moon'"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleKeywordSearch()}
                  />
                  <button className="xc-search-btn" onClick={handleKeywordSearch} disabled={searching}>
                    {searching ? '⏳' : '🔍 FIND'}
                  </button>
                </div>
                {keywordResults.length > 0 && (
                  <div className="xc-results">
                    <div className="xc-results-header">
                      <span>{keywordResults.length} posts found</span>
                      <button className="xc-results-delete-all" onClick={() => { setKeywordResults([]); setSelectedPosts(new Set()); }}>
                        🗑️ Delete All Found
                      </button>
                    </div>
                    {keywordResults.map((post, i) => (
                      <div key={i} className={`xc-result-row${selectedPosts.has(post) ? ' xc-result-row--selected' : ''}`} onClick={() => togglePost(post)}>
                        <div className="xc-result-check">{selectedPosts.has(post) ? '☑' : '☐'}</div>
                        <div className="xc-result-text">{post}</div>
                      </div>
                    ))}
                    {selectedPosts.size > 0 && (
                      <button className="xc-delete-selected" onClick={() => { setSelectedPosts(new Set()); setKeywordResults(r => r.filter(p => !selectedPosts.has(p))); }}>
                        🗑️ DELETE {selectedPosts.size} SELECTED
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Date Range */}
            {activeTab === 'dates' && (
              <div className="xc-tab-content">
                <div className="xc-tab-desc">Delete all posts and actions within a date range. Great for cleaning up old cringe eras.</div>
                <div className="xc-date-grid">
                  <div className="xc-date-field">
                    <label className="xc-date-label">FROM</label>
                    <input type="date" className="xc-date-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
                  </div>
                  <div className="xc-date-arrow">→</div>
                  <div className="xc-date-field">
                    <label className="xc-date-label">TO</label>
                    <input type="date" className="xc-date-input" value={dateTo} onChange={e => setDateTo(e.target.value)}/>
                  </div>
                </div>
                <div className="xc-date-types">
                  <div className="xc-date-type-label">DELETE WITHIN RANGE:</div>
                  {[
                    { id: 'date-posts',   label: 'Posts in range' },
                    { id: 'date-likes',   label: 'Likes in range' },
                    { id: 'date-reposts', label: 'Reposts in range' },
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`xc-date-btn${confirming === item.id ? ' xc-date-btn--confirm' : ''}`}
                      disabled={!dateFrom || !dateTo}
                      onClick={() => handleClean(item.id, item.label)}
                    >
                      {confirming === item.id ? '⚠ CONFIRM DELETE' : `🗑️ ${item.label}`}
                    </button>
                  ))}
                </div>
                {dateFrom && dateTo && (
                  <div className="xc-date-range-display">
                    Targeting: <strong>{dateFrom}</strong> → <strong>{dateTo}</strong>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </div>

      {/* Footer */}
      <div className="xc-footer">
        <span>POWERED BY DEODRANT AI · YOUR TIMELINE. YOUR CHOICE. · KEK SAAR.</span>
      </div>

    </div>
  );
}
