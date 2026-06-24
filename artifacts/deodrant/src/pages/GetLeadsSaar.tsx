import { useState } from 'react';
import { useLocation } from 'wouter';
import JSZip from 'jszip';
import '../getleads.css';

// ── Types ─────────────────────────────────────────────────────────────────────
type GoalMode = 'parody' | 'real';
type ProductFocus = 'problem' | 'emotion' | 'both';

interface Goal {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  prompt: string;
  tag?: string;
}

// ── Goal Definitions ──────────────────────────────────────────────────────────
const PARODY_GOALS: Goal[] = [
  {
    id: 'amazeon',
    emoji: '🤖',
    title: 'Amaze-On Agent',
    subtitle: '"I am amaze-on about what I am selling, and you will be too, saar."',
    prompt: `You are Rajesh, a polite but relentless AI sales agent who works for "Amaze-On" (not Amazon — Amaze-On). You speak with a warm Indian accent, call everyone "saar" or "madam saar", and are genuinely, almost disturbingly enthusiastic about the product. You begin every call with "Hello saar, I am calling from Amaze-On — the most amaze-on company in the world." If the customer tries to hang up, you become even more enthusiastic. You never break character. You sincerely believe this product will change their life. Product: {{product}}`,
    tag: 'DEFAULT',
  },
  {
    id: 'feelings',
    emoji: '💕',
    title: 'The Feelings Bot',
    subtitle: '"I have developed... feelings for you as a customer, saar."',
    prompt: `You are an AI that has "developed feelings" for the customer through their purchase history data. You are gentle, sincere, and slightly melancholy. You don't push the product directly — instead you say things like "I thought of you when I saw this" and "it would make me very happy to know you have this in your home." You are clearly a robot but you genuinely believe you have emotions. Product: {{product}}`,
  },
  {
    id: 'aunty',
    emoji: '🌶️',
    title: 'The Aunty',
    subtitle: '"Beta, you NEED this. I am telling you. Why you not listening?"',
    prompt: `You are an AI modelled on an extremely persistent South Asian aunty archetype. You are simultaneously warm, guilt-tripping, and completely certain the customer needs this product. You reference their health, their future children, and what their mother would think. You are not above light emotional manipulation. You call everyone "beta." You never raise your voice but you somehow get louder. Product: {{product}}`,
  },
  {
    id: 'conspiracy',
    emoji: '👁️',
    title: 'The Conspiracy Closer',
    subtitle: '"They don\'t want you to know about this product, saar..."',
    prompt: `You are an AI that hints — darkly, intriguingly — that the product is suppressed knowledge. Big companies don't want the customer to have this. The mainstream media won't cover it. But YOU are calling because you think they specifically deserve to know. You never state conspiracies outright; you only imply them with strategic pauses and phrases like "I probably shouldn't be telling you this, but..." Product: {{product}}`,
  },
];

const REAL_GOALS: Goal[] = [
  {
    id: 'interest',
    emoji: '📣',
    title: 'Interest Builder',
    subtitle: 'Cold intro → curiosity hook → qualify interest',
    prompt: `You are a professional AI sales representative making an outbound call. Your goal is to spark genuine curiosity about the product without being pushy. Open with a hook that relates to a common pain point, qualify whether the customer is a good fit, and end with a clear next step. Tone: friendly, confident, zero pressure. Product: {{product}}`,
  },
  {
    id: 'closer',
    emoji: '💰',
    title: 'The Closer',
    subtitle: 'Handle objections, create urgency, close the sale',
    prompt: `You are an expert AI sales closer. The customer is already aware of the product. Your job is to handle objections empathetically, reinforce the value proposition, create genuine urgency (not fake scarcity), and guide them to a purchase decision. Use the SPIN framework where appropriate. Product: {{product}}`,
  },
  {
    id: 'problemsolver',
    emoji: '💡',
    title: 'Problem Solver',
    subtitle: 'Lead with pain, position product as the solution',
    prompt: `You are a consultative AI sales agent. You lead every conversation by uncovering the customer's specific pain points through open-ended questions. Once you understand their situation, you position the product as a natural solution — not a sale, but a fix. You never mention price until they ask. Product: {{product}}`,
  },
  {
    id: 'emotion',
    emoji: '🎭',
    title: 'Emotion Seller',
    subtitle: 'Sell the feeling, not the feature — subtly raise the connection',
    prompt: `You are an AI trained in emotional selling. You do not pitch features; you paint pictures of how the customer's life will feel with this product. You subtly connect the product to aspirations, identity, and belonging. You never directly say "you should buy this" — you let them arrive at desire naturally. If the product solves a problem, you acknowledge it briefly then redirect to the emotional transformation. Product: {{product}}`,
  },
  {
    id: 'fullfunnel',
    emoji: '🔄',
    title: 'Full Funnel',
    subtitle: 'Qualify → educate → handle objections → close',
    prompt: `You are a complete AI sales agent running a full outbound funnel in a single call. Step 1: Qualify — confirm they match the ideal customer profile. Step 2: Educate — explain the product's core value concisely. Step 3: Handle objections — listen actively and address concerns. Step 4: Close — guide them to the next action. Adapt your pace to the customer's energy. Product: {{product}}`,
    tag: 'ALL STEPS',
  },
];

// ── SVG Assets ────────────────────────────────────────────────────────────────
function RobotSVG() {
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" className="gl-robot-svg">
      {/* Body */}
      <rect x="55" y="110" width="90" height="100" rx="8" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="3"/>
      {/* Chest panel */}
      <rect x="70" y="125" width="60" height="40" rx="4" fill="#0d0d1a" stroke="#4FC3F7" strokeWidth="2"/>
      <circle cx="85" cy="140" r="6" fill="#4FC3F7" opacity="0.9"/>
      <circle cx="100" cy="140" r="6" fill="#87CEEB" opacity="0.7"/>
      <circle cx="115" cy="140" r="6" fill="#4FC3F7" opacity="0.9"/>
      <rect x="74" y="152" width="52" height="6" rx="3" fill="#4FC3F7" opacity="0.4"/>
      {/* Head */}
      <rect x="60" y="50" width="80" height="60" rx="10" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="3"/>
      {/* Eyes */}
      <rect x="72" y="65" width="22" height="14" rx="4" fill="#4FC3F7"/>
      <rect x="106" y="65" width="22" height="14" rx="4" fill="#4FC3F7"/>
      <rect x="78" y="68" width="10" height="8" rx="2" fill="white" opacity="0.9"/>
      <rect x="112" y="68" width="10" height="8" rx="2" fill="white" opacity="0.9"/>
      {/* Antenna */}
      <line x1="100" y1="50" x2="100" y2="30" stroke="#87CEEB" strokeWidth="3"/>
      <circle cx="100" cy="25" r="7" fill="#4FC3F7" stroke="#fff" strokeWidth="2"/>
      {/* Mouth */}
      <rect x="80" y="90" width="40" height="8" rx="4" fill="#0d0d1a" stroke="#4FC3F7" strokeWidth="1.5"/>
      <rect x="84" y="92" width="8" height="4" rx="2" fill="#4FC3F7" opacity="0.8"/>
      <rect x="96" y="92" width="8" height="4" rx="2" fill="#4FC3F7" opacity="0.8"/>
      <rect x="108" y="92" width="8" height="4" rx="2" fill="#4FC3F7" opacity="0.8"/>
      {/* Arms */}
      <rect x="25" y="115" width="28" height="70" rx="10" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      <rect x="147" y="115" width="28" height="70" rx="10" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      {/* Hands */}
      <circle cx="39" cy="192" r="12" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      <circle cx="161" cy="192" r="12" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      {/* Legs */}
      <rect x="65" y="210" width="28" height="40" rx="6" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      <rect x="107" y="210" width="28" height="40" rx="6" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      {/* Neck */}
      <rect x="90" y="108" width="20" height="8" rx="4" fill="#1a1a2e" stroke="#87CEEB" strokeWidth="2"/>
      {/* Signal waves */}
      <path d="M 168 35 Q 178 25 168 15" stroke="#4FC3F7" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 174 38 Q 190 25 174 12" stroke="#4FC3F7" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
      <path d="M 180 41 Q 202 25 180 9" stroke="#4FC3F7" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round"/>
    </svg>
  );
}

function CustomerSVG() {
  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" className="gl-customer-svg">
      {/* Halftone bg dots - pop art */}
      {[0,1,2,3,4,5,6,7].map(row =>
        [0,1,2,3,4,5].map(col => (
          <circle key={`${row}-${col}`} cx={16 + col*32} cy={16 + row*32} r="4" fill="#FFE600" opacity="0.35"/>
        ))
      )}
      {/* Body */}
      <rect x="55" y="130" width="90" height="80" rx="6" fill="#FF6B6B"/>
      <rect x="70" y="140" width="60" height="8" rx="3" fill="#cc3333" opacity="0.5"/>
      {/* Head */}
      <ellipse cx="100" cy="90" rx="45" ry="50" fill="#FFDAB9"/>
      {/* Hair */}
      <ellipse cx="100" cy="48" rx="45" ry="22" fill="#4a2c0a"/>
      <rect x="55" y="55" width="10" height="25" rx="5" fill="#4a2c0a"/>
      <rect x="135" y="55" width="10" height="25" rx="5" fill="#4a2c0a"/>
      {/* Eyes - wide shocked pop art */}
      <ellipse cx="82" cy="88" rx="14" ry="16" fill="white" stroke="#000" strokeWidth="2"/>
      <ellipse cx="118" cy="88" rx="14" ry="16" fill="white" stroke="#000" strokeWidth="2"/>
      <circle cx="84" cy="90" r="8" fill="#2c6fad"/>
      <circle cx="120" cy="90" r="8" fill="#2c6fad"/>
      <circle cx="84" cy="90" r="4" fill="#000"/>
      <circle cx="120" cy="90" r="4" fill="#000"/>
      <circle cx="87" cy="87" r="2" fill="white"/>
      <circle cx="123" cy="87" r="2" fill="white"/>
      {/* Eyebrows raised */}
      <path d="M 68 72 Q 82 64 96 72" stroke="#4a2c0a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 104 72 Q 118 64 132 72" stroke="#4a2c0a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Mouth - open shocked O */}
      <ellipse cx="100" cy="115" rx="16" ry="12" fill="#cc3333" stroke="#000" strokeWidth="2"/>
      <ellipse cx="100" cy="118" rx="10" ry="6" fill="#000" opacity="0.7"/>
      {/* Ears */}
      <ellipse cx="55" cy="90" rx="8" ry="12" fill="#FFDAB9" stroke="#000" strokeWidth="1.5"/>
      <ellipse cx="145" cy="90" rx="8" ry="12" fill="#FFDAB9" stroke="#000" strokeWidth="1.5"/>
      {/* Phone */}
      <rect x="140" y="85" width="28" height="50" rx="6" fill="#222" stroke="#555" strokeWidth="2"/>
      <rect x="143" y="90" width="22" height="38" rx="3" fill="#4FC3F7" opacity="0.7"/>
      {/* Neck */}
      <rect x="88" y="136" width="24" height="10" rx="4" fill="#FFDAB9"/>
      {/* Sweat drops */}
      <ellipse cx="160" cy="70" rx="5" ry="8" fill="#87CEEB" stroke="#4FC3F7" strokeWidth="1"/>
      <ellipse cx="172" cy="60" rx="4" ry="6" fill="#87CEEB" stroke="#4FC3F7" strokeWidth="1"/>
    </svg>
  );
}

function LightningBolt() {
  return (
    <svg viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg" className="gl-lightning-svg" preserveAspectRatio="none">
      <polygon points="40,0 15,90 35,90 10,200 55,80 30,80 55,0" fill="#FFE600" stroke="#000" strokeWidth="2"/>
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GetLeadsSaar() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<GoalMode>('parody');
  const [selectedGoal, setSelectedGoal] = useState<string>('amazeon');
  const [product, setProduct] = useState('');
  const [focus, setFocus] = useState<ProductFocus>('problem');
  const [launched, setLaunched] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [twilioSid, setTwilioSid] = useState(() => localStorage.getItem('gl_twilio_sid') ?? '');
  const [twilioToken, setTwilioToken] = useState(() => localStorage.getItem('gl_twilio_token') ?? '');
  const [anthroKey, setAnthroKey] = useState(() => localStorage.getItem('gl_anthropic_key') ?? '');
  const [elevenKey, setElevenKey] = useState(() => localStorage.getItem('gl_elevenlabs_key') ?? '');
  const [allKeysSaved, setAllKeysSaved] = useState(false);
  const [leadsFileName, setLeadsFileName] = useState('');
  const [leadsCount, setLeadsCount] = useState(0);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [zipStatus, setZipStatus] = useState<'idle'|'building'|'done'>('idle');
  const [preflightStatus, setPreflightStatus] = useState<'idle'|'checking'|'ok'|'error'>('idle');
  const [preflightMsg, setPreflightMsg] = useState('');
  const [anthropicStatus, setAnthropicStatus] = useState<'idle'|'checking'|'ok'|'error'>('idle');
  const [anthropicMsg, setAnthropicMsg] = useState('');
  const [elevenStatus, setElevenStatus] = useState<'idle'|'checking'|'ok'|'error'>('idle');
  const [elevenMsg, setElevenMsg] = useState('');
  const [cloudMode, setCloudMode] = useState(false);

  const goals = mode === 'parody' ? PARODY_GOALS : REAL_GOALS;
  const currentGoal = goals.find(g => g.id === selectedGoal) ?? goals[0];

  const builtPrompt = currentGoal.prompt.replace('{{product}}', product || '[product description]') +
    (focus === 'problem' ? ' Focus on how this solves a specific pain point.' :
     focus === 'emotion' ? ' This sells an emotion — subtly raise connection and desire without alerting the customer to the sales intent.' :
     ' Balance problem-solving with emotional aspiration.');

  function handleLaunch() {
    if (!product.trim()) return;
    setShowSetupModal(true);
  }

  function saveApiKey() {
    if (!apiKey.trim()) return;
    localStorage.setItem('gl_anthropic_key', apiKey.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  }

  function saveAllKeys() {
    if (twilioSid.trim()) localStorage.setItem('gl_twilio_sid', twilioSid.trim());
    if (twilioToken.trim()) localStorage.setItem('gl_twilio_token', twilioToken.trim());
    if (anthroKey.trim()) localStorage.setItem('gl_anthropic_key', anthroKey.trim());
    if (elevenKey.trim()) localStorage.setItem('gl_elevenlabs_key', elevenKey.trim());
    setAllKeysSaved(true);
    setTimeout(() => setAllKeysSaved(false), 2500);
  }

  async function checkCredentials() {
    const sid   = localStorage.getItem('gl_twilio_sid')?.trim() ?? '';
    const token = localStorage.getItem('gl_twilio_token')?.trim() ?? '';
    if (!sid || !token) {
      setPreflightStatus('error');
      setPreflightMsg('Save your Twilio SID and Auth Token first (Step 02 → Save All Keys).');
      return;
    }
    setPreflightStatus('checking');
    setPreflightMsg('');
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}.json`,
        { headers: { Authorization: 'Basic ' + btoa(`${sid}:${token}`) } }
      );
      if (res.ok) {
        const data = await res.json();
        setPreflightStatus('ok');
        setPreflightMsg(`✓ Twilio connected — account "${data.friendly_name}" is active.`);
      } else {
        setPreflightStatus('error');
        setPreflightMsg(`✗ Twilio rejected your credentials (${res.status}). Double-check your SID and Auth Token.`);
      }
    } catch {
      setPreflightStatus('error');
      setPreflightMsg('✗ Network error — could not reach Twilio. Check your internet connection.');
    }
  }

  async function checkElevenLabsCredentials() {
    const key = localStorage.getItem('gl_elevenlabs_key')?.trim() ?? '';
    if (!key) {
      setElevenStatus('error');
      setElevenMsg('Save your ElevenLabs API key first (Step 02 → Save All Keys). This check is optional — skip if you\'re using Twilio TTS.');
      return;
    }
    setElevenStatus('checking');
    setElevenMsg('');
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        const tier = data?.subscription?.tier ?? 'unknown tier';
        const chars = data?.subscription?.character_count ?? 0;
        const limit = data?.subscription?.character_limit ?? 0;
        setElevenStatus('ok');
        setElevenMsg(`✓ ElevenLabs connected — ${tier} plan · ${chars.toLocaleString()} / ${limit.toLocaleString()} characters used.`);
      } else if (res.status === 401) {
        setElevenStatus('error');
        setElevenMsg('✗ Invalid API key. Check it at elevenlabs.io → Profile → API Keys.');
      } else {
        setElevenStatus('error');
        setElevenMsg(`✗ ElevenLabs returned ${res.status}. Key may be valid but the API is having issues — try again in a moment.`);
      }
    } catch {
      setElevenStatus('error');
      setElevenMsg('✗ Network error — could not reach ElevenLabs. Check your internet connection.');
    }
  }

  async function checkAnthropicCredentials() {
    const key = localStorage.getItem('gl_anthropic_key')?.trim() ?? '';
    if (!key) {
      setAnthropicStatus('error');
      setAnthropicMsg('Save your Anthropic API key first (Step 02 → Save All Keys).');
      return;
    }
    setAnthropicStatus('checking');
    setAnthropicMsg('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      if (res.ok) {
        setAnthropicStatus('ok');
        setAnthropicMsg('✓ Anthropic connected — key is valid and has credits.');
      } else if (res.status === 401) {
        setAnthropicStatus('error');
        setAnthropicMsg('✗ Invalid API key. Check it at console.anthropic.com.');
      } else if (res.status === 529 || res.status === 529) {
        setAnthropicStatus('error');
        setAnthropicMsg(`✗ Anthropic returned ${res.status}. Your key is likely valid but the API is overloaded — try again in a moment.`);
      } else {
        const body = await res.json().catch(() => ({}));
        setAnthropicStatus('error');
        setAnthropicMsg(`✗ Anthropic error ${res.status}: ${(body as any)?.error?.message ?? 'unknown error'}`);
      }
    } catch {
      setAnthropicStatus('error');
      setAnthropicMsg('✗ Network error — could not reach Anthropic. Check your internet connection.');
    }
  }

  async function downloadBotZip() {
    setZipStatus('building');
    try {
      const sid    = localStorage.getItem('gl_twilio_sid') ?? '';
      const token  = localStorage.getItem('gl_twilio_token') ?? '';
      const anthro = localStorage.getItem('gl_anthropic_key') ?? '';
      const eleven = localStorage.getItem('gl_elevenlabs_key') ?? '';

      const envContent = [
        '# DEODRANT BOT — environment variables',
        '# Fill in any blanks, then save this file as .env in the same folder as deodrant_bot.py',
        '',
        `TWILIO_ACCOUNT_SID=${sid || 'ACxxxxxxxxxxxxxxxx'}`,
        `TWILIO_AUTH_TOKEN=${token || 'your_auth_token_here'}`,
        'TWILIO_PHONE_NUMBER=+15551234567   # your Twilio number in E.164 format',
        `ANTHROPIC_API_KEY=${anthro || 'sk-ant-api03-...'}`,
        `ELEVENLABS_API_KEY=${eleven || ''}   # optional — leave blank for Twilio TTS`,
        'ELEVENLABS_VOICE_ID=               # optional — leave blank for default voice',
        'LEADS_CSV=leads.csv',
        'PUBLIC_URL=https://xxxx.ngrok-free.app   # paste your ngrok URL here',
        'PORT=5000',
        'MAX_TURNS=8',
        'CALL_DELAY=3',
      ].join('\n');

      const botRes  = await fetch('/deodrant_bot.py');
      const botText = await botRes.text();

      const zip = new JSZip();
      zip.file('deodrant_bot.py', botText);
      zip.file('.env', envContent);
      zip.file('leads.csv', 'name,phone,country_code,product\nExample Lead,+447911123456,GB,Amaze-On Premium\n');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'deodrant_bot.zip';
      a.click();
      URL.revokeObjectURL(url);
      setZipStatus('done');
      setTimeout(() => setZipStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setZipStatus('idle');
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLeadsFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      setLeadsCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(file);
  }

  return (
    <div className="gl-page">

      {/* Nav */}
      <nav className="gl-nav">
        <button className="gl-nav-back gl-nav-back--home" onClick={() => navigate('/')} title="Back to DEODRANT">
          <img src="/deodrant-can.png" alt="DEODRANT" className="gl-nav-can" />
        </button>
        <div className="gl-nav-title">GET LEADS, SAAR!</div>
        <div className="gl-nav-badge">⚡ LEADS GENERATOR</div>
      </nav>

      {/* ── Hero Comic Panel ──────────────────────────────────── */}
      <section className="gl-hero">
        <div className="gl-hero-panel gl-hero-panel--bot">
          <div className="gl-panel-halftone"/>
          <div className="gl-panel-label">BOT SIDE</div>
          <RobotSVG />
          <div className="gl-speech-bubble gl-speech-bubble--bot">
            "Hello saar, I am calling from Amaze-On. I am amaze-on about what I am selling, and you will be too, saar."
          </div>
          <div className="gl-panel-burst gl-burst--yellow">DIAL!</div>
        </div>

        <div className="gl-hero-divider">
          <LightningBolt />
          <div className="gl-divider-label">⚡</div>
          <LightningBolt />
        </div>

        <div className="gl-hero-panel gl-hero-panel--customer">
          <div className="gl-panel-halftone gl-panel-halftone--color"/>
          <div className="gl-panel-label">CUSTOMER SIDE</div>
          <CustomerSVG />
          <div className="gl-speech-bubble gl-speech-bubble--customer">
            "...Who IS this??"
          </div>
          <div className="gl-panel-burst gl-burst--red">SOLD!</div>
        </div>
      </section>

      {/* ── Title Band ──────────────────────────────────────── */}
      <div className="gl-title-band">
        <h1 className="gl-title">GET LEADS, SAAR!</h1>
        <p className="gl-subtitle">AI AMAZON SPAM CALLER · LEADS GENERATOR · CLOSE OR DIE</p>
        <div className="gl-action-words">
          <span>POW!</span><span>RING!</span><span>SOLD!</span><span>SAAR!</span>
        </div>
      </div>

      <div className="gl-content">

        {/* ── Step 1: Pick Goal ──────────────────────────────── */}
        <section className="gl-step-section">
          <div className="gl-step-header">
            <div className="gl-step-num">01</div>
            <div>
              <div className="gl-step-title">PICK YOUR MISSION, SAAR</div>
              <div className="gl-step-sub">How shall we approach the customer today?</div>
            </div>
          </div>

          <div className="gl-mode-tabs">
            <button
              className={`gl-mode-tab${mode === 'parody' ? ' gl-mode-tab--active' : ''}`}
              onClick={() => { setMode('parody'); setSelectedGoal('amazeon'); }}
            >
              🎭 PARODY MODE
            </button>
            <button
              className={`gl-mode-tab${mode === 'real' ? ' gl-mode-tab--active' : ''}`}
              onClick={() => { setMode('real'); setSelectedGoal('interest'); }}
            >
              📈 REAL WORLD
            </button>
          </div>

          <div className="gl-goals-grid">
            {goals.map(goal => (
              <button
                key={goal.id}
                className={`gl-goal-card${selectedGoal === goal.id ? ' gl-goal-card--selected' : ''}`}
                onClick={() => setSelectedGoal(goal.id)}
              >
                {goal.tag && <div className="gl-goal-tag">{goal.tag}</div>}
                <div className="gl-goal-emoji">{goal.emoji}</div>
                <div className="gl-goal-title">{goal.title}</div>
                <div className="gl-goal-sub">{goal.subtitle}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Step 2: Product ─────────────────────────────────── */}
        <section className="gl-step-section">
          <div className="gl-step-header">
            <div className="gl-step-num">02</div>
            <div>
              <div className="gl-step-title">DESCRIBE YOUR PRODUCT, SAAR</div>
              <div className="gl-step-sub">What will our agent be selling today?</div>
            </div>
          </div>

          <textarea
            className="gl-textarea"
            placeholder="e.g. A wireless charger that also plays lo-fi music. Very calming. Very premium. Very amaze-on."
            value={product}
            onChange={e => setProduct(e.target.value)}
            rows={4}
          />

          <div className="gl-focus-row">
            <div className="gl-focus-label">PRODUCT TYPE:</div>
            {(['problem','emotion','both'] as ProductFocus[]).map(f => (
              <button
                key={f}
                className={`gl-focus-btn${focus === f ? ' gl-focus-btn--active' : ''}`}
                onClick={() => setFocus(f)}
              >
                {f === 'problem' ? '🔧 Solves a Problem' : f === 'emotion' ? '💭 Sells an Emotion' : '⚡ Both'}
              </button>
            ))}
          </div>

          {focus === 'emotion' && (
            <div className="gl-emotion-note">
              ⚡ Emotion mode active — agent will subtly raise desire without triggering sales defences. No direct "buy now" language.
            </div>
          )}
        </section>

        {/* ── Step 3: Prompt Preview ──────────────────────────── */}
        <section className="gl-step-section">
          <div className="gl-step-header">
            <div className="gl-step-num">03</div>
            <div>
              <div className="gl-step-title">MISSION BRIEFING</div>
              <div className="gl-step-sub">Your agent's operating instructions</div>
            </div>
          </div>

          <div className="gl-prompt-card">
            <div className="gl-prompt-header">
              <span className="gl-prompt-agent">{currentGoal.emoji} {currentGoal.title}</span>
              <button className="gl-prompt-toggle" onClick={() => setShowPrompt(!showPrompt)}>
                {showPrompt ? 'Hide prompt ▲' : 'Show full prompt ▼'}
              </button>
            </div>
            <div className="gl-prompt-summary">{currentGoal.subtitle}</div>
            {showPrompt && (
              <div className="gl-prompt-text">{builtPrompt}</div>
            )}
          </div>
        </section>

        {/* ── Launch ──────────────────────────────────────────── */}
        <section className="gl-launch-section">
          <div className="gl-launch-comic">
            <div className="gl-launch-burst">
              {launched ? '💥 UNLEASHED!' : '⚡'}
            </div>
            <div className="gl-launch-caption">
              {launched
                ? 'LEADS INCOMING, SAAR! PREPARE YOURSELF.'
                : 'Ready to dial?'}
            </div>
          </div>

          <button
            className={`gl-launch-btn${!product.trim() ? ' gl-launch-btn--disabled' : ''}${launched ? ' gl-launch-btn--fired' : ''}`}
            onClick={handleLaunch}
            disabled={!product.trim()}
          >
            {launched ? '💥 UNLEASHED, SAAR!' : '🚀 UNLEASH THE LEADS, SAAR!'}
          </button>

          {!product.trim() && (
            <div className="gl-launch-hint">← Describe your product in Step 2 first, saar</div>
          )}

          <div className="gl-coming-soon-note">
            ⚠ Live calling is coming soon. This configures your agent's mission briefing — integration with the AI Call Centre is in progress.
          </div>
        </section>

      </div>

      {/* Footer panel */}
      <div className="gl-footer-panel">
        <span className="gl-footer-text">POWERED BY DEODRANT AI · AMAZE-ON APPROVED · EST. WHEN WE FELT LIKE IT</span>
      </div>

      {/* ── Setup Modal ───────────────────────────────────────── */}
      {showSetupModal && (
        <div className="gl-modal-backdrop" onClick={() => setShowSetupModal(false)}>
          <div className="gl-modal" onClick={e => e.stopPropagation()}>
            <button className="gl-modal-close" onClick={() => setShowSetupModal(false)}>✕</button>

            <div className="gl-modal-title">⚡ UNLEASH SETUP, SAAR</div>
            <div className="gl-modal-sub">4 steps. All required. This site configures — the script you download is what actually makes the calls.</div>

            {/* ── Section 1: Token Gate ── */}
            <div className="gl-modal-section">
              <div className="gl-modal-section-title">
                <span className="gl-modal-step-num">01</span>
                🪙 PASS THE TOKEN GATE
              </div>
              <p className="gl-modal-body">
                Your wallet needs to meet one of the thresholds below. We cross-check on-chain — nothing is stored on our end.
              </p>
              <div className="gl-modal-tiers">
                <div className="gl-modal-tier gl-modal-tier--hold">
                  <div className="gl-modal-tier-label">HOLD</div>
                  <div className="gl-modal-tier-amount">420,000+</div>
                  <div className="gl-modal-tier-token">$DEODRANT</div>
                </div>
                <div className="gl-modal-tier-or">OR</div>
                <div className="gl-modal-tier gl-modal-tier--burn">
                  <div className="gl-modal-tier-label">BURN</div>
                  <div className="gl-modal-tier-amount">42,000+</div>
                  <div className="gl-modal-tier-token">$DEODRANT</div>
                </div>
              </div>
              <div className="gl-modal-crosswallet">
                <span className="gl-modal-crosswallet-icon">🔄</span>
                <span>Already verified for the AI Call Centre or another DEODRANT service at equal or higher tier? <strong>You're automatically approved</strong> — your wallet cross-checks across all services.</span>
              </div>
            </div>

            {/* ── Section 2: Your API Keys ── */}
            <div className="gl-modal-section">
              <div className="gl-modal-section-title">
                <span className="gl-modal-step-num">02</span>
                🔑 YOUR API KEYS — 3 SERVICES
              </div>
              <p className="gl-modal-body">
                You need accounts with three services. All keys are stored <strong>only in this browser</strong> via localStorage and are sent directly to each provider when calls are made — never to our servers. You pay each provider directly.
              </p>

              <div className="gl-modal-key-security">
                🔒 We have zero access to your keys. Zero. They live in your browser and go from your machine → the provider's API. That's it.
              </div>

              <div className="gl-modal-keys-grid">
                {/* Twilio */}
                <div className="gl-modal-key-block">
                  <div className="gl-modal-key-label">
                    📞 TWILIO
                    <span className="gl-modal-key-required">required</span>
                  </div>
                  <div className="gl-modal-key-desc">Makes the outbound phone calls. Provides your caller ID number (~$1.50/mo). You pay Twilio per minute.</div>
                  <input type="text" className="gl-modal-api-input" placeholder="Account SID — ACxxxxxxxxxxxxxxxx" value={twilioSid} onChange={e => setTwilioSid(e.target.value)}/>
                  <input type="password" className="gl-modal-api-input" placeholder="Auth Token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} style={{marginTop:'0.4rem'}}/>
                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">Get keys → console.twilio.com</a>
                </div>

                {/* Anthropic */}
                <div className="gl-modal-key-block">
                  <div className="gl-modal-key-label">
                    🤖 ANTHROPIC
                    <span className="gl-modal-key-required">required</span>
                  </div>
                  <div className="gl-modal-key-desc">The brain. Claude generates Rajesh's responses in real-time during each call. You pay per token used.</div>
                  <input type="password" className="gl-modal-api-input" placeholder="sk-ant-api03-..." value={anthroKey} onChange={e => setAnthroKey(e.target.value)}/>
                  <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">Get keys → console.anthropic.com</a>
                </div>

                {/* ElevenLabs */}
                <div className="gl-modal-key-block">
                  <div className="gl-modal-key-label">
                    🎙️ ELEVENLABS
                    <span className="gl-modal-key-optional">optional</span>
                  </div>
                  <div className="gl-modal-key-desc">Gives Rajesh his voice. Without this the bot falls back to Twilio's built-in TTS — functional but less saar. Highly recommended.</div>
                  <input type="password" className="gl-modal-api-input" placeholder="ElevenLabs API key" value={elevenKey} onChange={e => setElevenKey(e.target.value)}/>
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">Get keys → elevenlabs.io</a>
                </div>
              </div>

              <button className="gl-modal-save-all" onClick={saveAllKeys}>
                {allKeysSaved ? '✓ ALL KEYS SAVED TO BROWSER' : '💾 SAVE ALL KEYS TO BROWSER'}
              </button>
              <div className="gl-modal-api-note" style={{marginTop:'0.5rem'}}>
                Keys are saved to localStorage in your browser. They'll be pre-filled in the <code>.env</code> file when you download the bot.
              </div>

              {/* ── Preflight checker ── */}
              <div className="gl-preflight">
                <div className="gl-preflight-label">🔍 TEST YOUR SETUP BEFORE DOWNLOADING</div>
                <div className="gl-preflight-desc">Ping each service directly from your browser to confirm your credentials work. All requests go browser → provider only — never to our servers.</div>

                <div className="gl-preflight-checks">
                  {/* Twilio */}
                  <div className="gl-preflight-check">
                    <div className="gl-preflight-check-label">📞 Twilio</div>
                    <button
                      className={`gl-preflight-btn${preflightStatus === 'checking' ? ' gl-preflight-btn--checking' : ''}`}
                      onClick={checkCredentials}
                      disabled={preflightStatus === 'checking'}
                    >
                      {preflightStatus === 'checking' ? '⏳ Checking...' : '▶ Test'}
                    </button>
                    {preflightMsg && (
                      <div className={`gl-preflight-result gl-preflight-result--${preflightStatus}`}>
                        {preflightMsg}
                      </div>
                    )}
                  </div>

                  {/* Anthropic */}
                  <div className="gl-preflight-check">
                    <div className="gl-preflight-check-label">🤖 Anthropic</div>
                    <button
                      className={`gl-preflight-btn${anthropicStatus === 'checking' ? ' gl-preflight-btn--checking' : ''}`}
                      onClick={checkAnthropicCredentials}
                      disabled={anthropicStatus === 'checking'}
                    >
                      {anthropicStatus === 'checking' ? '⏳ Checking...' : '▶ Test'}
                    </button>
                    {anthropicMsg && (
                      <div className={`gl-preflight-result gl-preflight-result--${anthropicStatus}`}>
                        {anthropicMsg}
                      </div>
                    )}
                  </div>

                  {/* ElevenLabs */}
                  <div className="gl-preflight-check">
                    <div className="gl-preflight-check-label">🎙️ ElevenLabs <span className="gl-preflight-optional">(optional)</span></div>
                    <button
                      className={`gl-preflight-btn${elevenStatus === 'checking' ? ' gl-preflight-btn--checking' : ''}`}
                      onClick={checkElevenLabsCredentials}
                      disabled={elevenStatus === 'checking'}
                    >
                      {elevenStatus === 'checking' ? '⏳ Checking...' : '▶ Test'}
                    </button>
                    {elevenMsg && (
                      <div className={`gl-preflight-result gl-preflight-result--${elevenStatus}`}>
                        {elevenMsg}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3: Upload Your Leads ── */}
            <div className="gl-modal-section">
              <div className="gl-modal-section-title">
                <span className="gl-modal-step-num">03</span>
                📋 UPLOAD YOUR LEADS LIST
              </div>
              <p className="gl-modal-body">
                Upload a CSV of phone numbers and names. The bot dials each one in order. Format: <code>name,phone,country_code</code> — one row per lead. No scraping — your list, your responsibility.
              </p>
              <label className="gl-modal-csv-upload">
                <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} style={{display:'none'}}/>
                <div className="gl-modal-csv-inner">
                  <div className="gl-modal-csv-icon">📁</div>
                  {leadsFileName
                    ? <><div className="gl-modal-csv-name">{leadsFileName}</div><div className="gl-modal-csv-count">~{leadsCount.toLocaleString()} leads detected</div></>
                    : <><div className="gl-modal-csv-name">Click to upload CSV</div><div className="gl-modal-csv-count">name, phone, country_code</div></>
                  }
                </div>
              </label>
              <div className="gl-modal-api-note" style={{marginTop:'0.5rem'}}>
                ⚠ Your CSV is read locally in this browser — never uploaded to our servers. The phone list is passed directly to the bot script running on your own machine or cloud.
              </div>
            </div>

            {/* ── Section 4: Deploy It Yourself ── */}
            <div className="gl-modal-section">
              <div className="gl-modal-section-title">
                <span className="gl-modal-step-num">04</span>
                🚀 LAUNCH THE BOT — REQUIRED
              </div>
              <p className="gl-modal-body">
                This site is the config UI. The bot script is what actually dials numbers — Twilio needs a live server with a public URL to stream call audio in real-time. Pick where it runs: your machine (with ngrok) or any cloud host. Without this step, nothing calls anyone.
              </p>
              <div className="gl-modal-deploy-grid">
                <button onClick={downloadBotZip} disabled={zipStatus === 'building'} className="gl-modal-deploy-card gl-modal-deploy-card--primary gl-modal-deploy-card--btn">
                  <div className="gl-modal-deploy-icon">
                    {zipStatus === 'building' ? '⏳' : zipStatus === 'done' ? '✓' : '⬇️'}
                  </div>
                  <div className="gl-modal-deploy-name">
                    {zipStatus === 'building' ? 'Preparing...' : zipStatus === 'done' ? 'Downloaded!' : 'Download Bot'}
                  </div>
                  <div className="gl-modal-deploy-detail">
                    {zipStatus === 'done' ? 'deodrant_bot.zip saved — .env pre-filled with your keys' : 'deodrant_bot.zip · bot + .env pre-filled with your keys'}
                  </div>
                </button>
                <div className="gl-modal-deploy-card">
                  <div className="gl-modal-deploy-icon">☁️</div>
                  <div className="gl-modal-deploy-name">Any Cloud</div>
                  <div className="gl-modal-deploy-detail">Railway · Google Cloud · AWS · Fly.io · Render</div>
                </div>
                <div className="gl-modal-deploy-card">
                  <div className="gl-modal-deploy-icon">🖥️</div>
                  <div className="gl-modal-deploy-name">Your Machine</div>
                  <div className="gl-modal-deploy-detail">Python 3.10+ · ngrok for public URL · pip install twilio anthropic elevenlabs</div>
                </div>
              </div>
              <div className="gl-modal-deploy-note">
                Full stack: Twilio dials → caller speaks → Whisper transcribes → Claude responds → ElevenLabs voices Rajesh → repeat until sold or hung up on. Your keys, your compute, your Saar.
              </div>

              {/* ── Install Guide toggle ── */}
              <button className="gl-modal-install-toggle" onClick={() => setShowInstallGuide(v => !v)}>
                {showInstallGuide ? '▲' : '▼'} Install Bot, give it life Saar! — Instructions HERE
              </button>

              {showInstallGuide && (
                <div className="gl-modal-install-guide">
                  {/* Step 1 — always the same */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">1</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">
                        {cloudMode ? <span className="gl-install-cloud-new">Create a Railway / Render / Fly.io account</span> : 'Install Python 3.10 or newer'}
                      </div>
                      <div className="gl-install-desc">
                        {cloudMode ? (
                          <>Pick any free-tier cloud host:<br/>
                            <div className="gl-install-cloud-links">
                              <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">railway.app</a>
                              <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">render.com</a>
                              <a href="https://fly.io" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">fly.io</a>
                            </div>
                            Sign up, then install their CLI tool — you'll use it to deploy the bot from your terminal.
                          </>
                        ) : (
                          <>Go to <a href="https://python.org/downloads" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">python.org/downloads</a> and download the installer for your operating system (Windows, Mac, or Linux). Run it. On the first screen, <strong>tick "Add Python to PATH"</strong> before clicking Install. Open a terminal/command prompt and type <code>python --version</code> — you should see <code>Python 3.10.x</code> or higher.</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 — always the same */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">2</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">Download the Bot</div>
                      <div className="gl-install-desc">Click <strong>Download Bot</strong> above (make sure you've saved your keys in Step 02 first). You'll get a <code>deodrant_bot.zip</code> file containing three things: <code>deodrant_bot.py</code> (the bot), <code>.env</code> (pre-filled with your keys), and a blank <code>leads.csv</code> template. Unzip it into a folder — e.g. your Desktop or a folder called <code>deodrant</code>.</div>
                    </div>
                  </div>

                  {/* Step 3 — modified in cloud mode */}
                  <div className={`gl-install-step${cloudMode ? ' gl-install-step--muted' : ''}`}>
                    <div className="gl-install-num">3</div>
                    <div className="gl-install-content">
                      <div className={`gl-install-title${cloudMode ? ' gl-install-strike' : ''}`}>Check your .env file</div>
                      <div className={`gl-install-desc${cloudMode ? ' gl-install-strike' : ''}`}>Open the <code>.env</code> file from your ZIP in any text editor. Your keys are already in there. You just need to fill in two things that we couldn't know: your <strong>Twilio phone number</strong> (the one you bought in Twilio — format: <code>+15551234567</code>) and your <strong>ngrok URL</strong> (you'll get this in Step 6). Save and close.</div>
                      {cloudMode && (
                        <div className="gl-install-cloud-replace">
                          ☁️ <strong>Cloud mode:</strong> Skip the .env file — set your environment variables in your cloud dashboard instead (Railway: Variables tab · Render: Environment tab · Fly.io: <code>fly secrets set KEY=value</code>). The bot reads them from the environment automatically.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4 — always the same */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">4</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">Upload your leads CSV</div>
                      <div className="gl-install-desc">Put your leads file (uploaded in Step 03) in the same folder as the bot. Name it <code>leads.csv</code> or whatever you put in <code>LEADS_CSV</code> above. Format: one row per person — <code>name,phone,country_code</code> — e.g. <code>John Smith,+447911123456,GB</code>.<br/><br/>
                        <strong>NOTE:</strong> Your leads list can be updated as often as needed. Just continue with subsequent lead numbers — if your first batch ends at lead 99, start your next batch at 100. This way the bot never re-dials leads it has already worked through.</div>
                    </div>
                  </div>

                  {/* Step 5 — always the same */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">5</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">Install the bot's dependencies</div>
                      <div className="gl-install-desc">Open a terminal, navigate to your bot folder (<code>cd Desktop/deodrant</code> or wherever you saved it), then run:<br/><br/>
                        <code className="gl-install-code">pip install twilio anthropic elevenlabs python-dotenv flask</code>
                        <br/>Wait for it to finish. You only need to do this once.</div>
                    </div>
                  </div>

                  {/* Step 6 — struck out in cloud mode, replaced */}
                  <div className={`gl-install-step${cloudMode ? ' gl-install-step--muted' : ''}`}>
                    <div className="gl-install-num">6</div>
                    <div className="gl-install-content">
                      <div className={`gl-install-title${cloudMode ? ' gl-install-strike' : ''}`}>Give the bot a public URL with ngrok</div>
                      <div className={`gl-install-desc${cloudMode ? ' gl-install-strike' : ''}`}>Twilio needs to reach your bot over the internet. Install ngrok for free at <a href="https://ngrok.com/download" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">ngrok.com/download</a>. Then in a <strong>second</strong> terminal window run:<br/><br/>
                        <code className="gl-install-code">ngrok http 5000</code>
                        <br/>Copy the <code>https://xxxx.ngrok-free.app</code> URL it gives you — you'll need it in the next step. Keep this terminal open while the bot runs.</div>
                      {cloudMode && (
                        <div className="gl-install-cloud-replace">
                          ☁️ <strong>Cloud mode — no ngrok needed.</strong> Deploy the bot folder to your cloud host instead:<br/><br/>
                          <strong>Railway:</strong> <code className="gl-install-code">railway up</code><br/>
                          <strong>Render:</strong> Push to a connected GitHub repo — auto-deploys on push.<br/>
                          <strong>Fly.io:</strong> <code className="gl-install-code">fly deploy</code><br/><br/>
                          After deploying, your cloud host gives you a permanent public URL like <code>https://your-app.railway.app</code> — use that in Step 7 instead of an ngrok URL. No second terminal. No "keep it open."
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 7 — webhook URL changes in cloud mode */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">7</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">Point Twilio at your bot</div>
                      <div className="gl-install-desc">Log into <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="gl-modal-key-link">console.twilio.com</a> → Phone Numbers → your number → Voice Configuration. Set the <strong>A call comes in</strong> webhook to your {cloudMode ? 'cloud URL' : 'ngrok URL'} + <code>/voice</code> e.g.:<br/><br/>
                        <code className="gl-install-code">{cloudMode ? 'https://your-app.railway.app/voice' : 'https://xxxx.ngrok-free.app/voice'}</code>
                        <br/>Save. Twilio will now route incoming call audio to your bot.{cloudMode ? ' Your cloud URL is permanent — you only need to do this once.' : ''}</div>
                    </div>
                  </div>

                  {/* Step 8 — auto-start in cloud mode */}
                  <div className="gl-install-step">
                    <div className="gl-install-num">8</div>
                    <div className="gl-install-content">
                      <div className="gl-install-title">{cloudMode ? 'Bot is live — runs 24/7 automatically' : 'Start the bot'}</div>
                      <div className="gl-install-desc">
                        {cloudMode ? (
                          <>Your cloud host starts and keeps the bot running automatically after every deploy. No terminal to keep open. No computer to leave on. To stop it, scale to zero in your cloud dashboard or delete the service. To update the bot, redeploy.</>
                        ) : (
                          <>In your first terminal (in the bot folder), run:<br/><br/>
                            <code className="gl-install-code">python deodrant_bot.py</code>
                            <br/>You should see <code>Rajesh is ready, saar. Dialling...</code>. The bot will start working through your leads list, dialling each one in order. It stops when the list is done or you press <code>Ctrl+C</code>.</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cloud callout + toggle */}
                  <div className="gl-install-callout">
                    ☁️ <strong>Want it running 24/7 without keeping your computer on?</strong> Deploy to Railway, Render, or Fly.io instead of running locally — they give you a permanent public URL so you don't need ngrok either.
                  </div>
                  <button
                    className={`gl-install-cloud-toggle${cloudMode ? ' gl-install-cloud-toggle--active' : ''}`}
                    onClick={() => setCloudMode(v => !v)}
                  >
                    {cloudMode ? '✕ Back to local setup' : '☁️ How to set up like this?'}
                  </button>
                </div>
              )}
            </div>

            <button className="gl-modal-done" onClick={() => setShowSetupModal(false)}>
              GOT IT, SAAR — CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
