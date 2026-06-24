import { motion } from "framer-motion";
import heroImg from "@assets/ref1.png";
import callCenterImg from "@assets/ref7.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className={`max-w-5xl mx-auto px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      variants={fadeUp}
      className="font-black italic uppercase text-4xl md:text-5xl tracking-tight text-foreground mb-10"
    >
      {children}
    </motion.h2>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-black italic tracking-tight uppercase text-foreground">
          🌐 DEODRANT
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="nav-sign-in"
            className="hidden sm:block px-5 py-2.5 text-sm font-bold italic uppercase tracking-wider border-2 border-foreground/30 rounded-xl text-foreground hover:border-foreground/60 transition-colors"
          >
            SIGN IN
          </button>
          <button
            data-testid="nav-get-apis"
            className="hidden sm:block px-5 py-2.5 text-sm font-bold italic uppercase tracking-wider border-2 border-dashed border-primary/60 rounded-xl text-primary hover:bg-primary/5 transition-colors"
          >
            GET APIS ✦
          </button>
          <button
            data-testid="nav-get-started"
            className="px-6 py-2.5 text-sm font-bold italic uppercase tracking-wider bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            GET STARTED →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="max-w-6xl mx-auto px-8 pt-10 pb-28 grid lg:grid-cols-2 gap-14 items-center"
      >
        <div className="space-y-8">
          <motion.h1
            variants={fadeUp}
            className="text-6xl sm:text-7xl font-black italic uppercase tracking-tight leading-[0.92] text-foreground"
          >
            YOUR 24/7 AI RECEPTIONIST
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-foreground/70 font-medium max-w-md leading-relaxed">
            You pay{" "}
            <span className="font-black text-foreground bg-secondary/90 px-1.5 rounded">$4.20/mo</span>
            . Your AI answers every call. Never misses one.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <button
              data-testid="hero-get-started"
              className="px-8 py-4 font-bold italic uppercase tracking-wider bg-primary text-white rounded-xl text-lg hover:bg-primary/90 transition-colors"
            >
              GET STARTED →
            </button>
            <button
              data-testid="hero-how-it-works"
              className="px-8 py-4 font-bold italic uppercase tracking-wider border-2 border-foreground/25 rounded-xl text-lg text-foreground hover:border-foreground/50 transition-colors"
            >
              SEE HOW IT WORKS
            </button>
          </motion.div>
        </div>
        <motion.div variants={fadeUp}>
          <img
            src={heroImg}
            alt="AI Call Center"
            className="w-full h-auto rounded-3xl object-cover shadow-xl"
          />
        </motion.div>
      </motion.section>

      {/* ── HUMAN VS AI ── */}
      <Section className="py-20">
        <motion.div variants={fadeUp} className="mb-4">
          <SectionHeading>Human vs AI — The Numbers</SectionHeading>
          <motion.p variants={fadeUp} className="text-base text-foreground/60 mb-10 max-w-3xl">
            You use your own Twilio and OpenAI accounts — you pay them directly at their published rates.
            We don't mark up API costs. Your total cost is their API fees + our $4.20/month bundling fee.
          </motion.p>
        </motion.div>

        <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-foreground/10 bg-white/60 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-primary/5">
                <th className="text-left px-6 py-4 font-bold italic uppercase text-foreground/70 tracking-wider">METRIC</th>
                <th className="text-left px-6 py-4 font-bold italic uppercase text-foreground/70 tracking-wider">HUMAN RECEPTIONIST</th>
                <th className="text-left px-6 py-4 font-bold italic uppercase text-primary tracking-wider">AI CALL CENTRE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/8">
              {[
                ["Monthly base", "$3,500 – $6,500", "$4.20 (w/ $DEODRANT)", true],
                ["Per 2-min call received", "~$4 – $8 (salaried)", "~$0.27 (your API cost)", false],
                ["100 calls / month", "~$4,200/mo", "~$31/mo total", false],
                ["500 calls / month", "~$4,200/mo", "~$139/mo total", false],
                ["1,000 calls / month", "~$4,200/mo", "~$274/mo total", false],
                ["Available hours", "Business hours only", "24 / 7 / 365", false],
                ["Sick days", "Yes", "Never", false],
                ["Setup time", "Weeks", "Minutes", false],
              ].map(([metric, human, ai, highlight], i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-foreground/[0.02]" : ""}>
                  <td className="px-6 py-4 text-foreground/70">{metric}</td>
                  <td className="px-6 py-4 text-foreground/60">{human}</td>
                  <td className={`px-6 py-4 font-bold ${highlight ? "text-foreground" : "text-primary"}`}>
                    {highlight ? (
                      <><span className="bg-secondary text-foreground px-1.5 py-0.5 rounded font-black">$4.20</span>{" "}(w/ $DEODRANT)</>
                    ) : ai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-6 py-3 text-xs text-foreground/40 border-t border-foreground/8">
            * API costs are paid directly to Twilio and OpenAI by you. Figures are estimates based on published rates for a 2-minute inbound call.
          </p>
        </motion.div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section className="py-20">
        <SectionHeading>How It Works</SectionHeading>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { num: "01", title: "Enter your API keys", desc: "Add your Twilio and OpenAI API keys. They're stored only in your browser — we never see them." },
            { num: "02", title: "Pick a phone number", desc: "In your Twilio account, provision a local number in your country (~$1.50/mo). Enter it here." },
            { num: "03", title: "Train the AI", desc: "Tell us your business name, hours, services, and FAQs. We build the AI's script from your answers." },
            { num: "04", title: "Go live instantly", desc: "Flip the switch. Your AI answers calls 24/7, handles FAQs, books appointments, and takes messages." },
          ].map((step, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-white/60 rounded-2xl p-7 h-full border border-foreground/8 hover:border-primary/20 transition-colors relative overflow-hidden">
                <div className="text-7xl font-black italic text-foreground/8 absolute -right-2 -top-2 select-none leading-none">
                  {step.num}
                </div>
                <div className="relative">
                  <h3 className="font-bold text-foreground mb-3 text-base leading-snug">{step.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── THE INFRASTRUCTURE ── */}
      <Section className="py-20">
        <SectionHeading>The Infrastructure</SectionHeading>
        <motion.p variants={fadeUp} className="text-base text-foreground/60 mb-10 max-w-3xl">
          Sign up to each provider below, get your API keys, and enter them in your dashboard. All links go directly to their signup pages.
        </motion.p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: "📞",
              name: "Twilio",
              price: "Phone numbers: ~$1.50/mo · Calls: ~$0.01/min",
              desc: "Handles inbound/outbound calling in 60+ countries. Provision a local number for your business.",
              cta: "Sign up — get $15 free credit →",
              testId: "link-twilio",
            },
            {
              icon: "🧠",
              name: "OpenAI",
              price: "Realtime API: ~$0.25 per 2-min call",
              desc: "Powers the AI voice — GPT-4o Realtime processes audio in real time, no transcription lag. Their GPUs, your key.",
              cta: "Sign up for OpenAI Platform →",
              testId: "link-openai",
            },
          ].map((provider, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-white/60 rounded-2xl p-8 border border-foreground/8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <h3 className="font-black italic uppercase text-xl text-foreground">{provider.name}</h3>
                </div>
                <p className="text-sm text-foreground/50 mb-1">{provider.price}</p>
                <p className="text-sm text-foreground/70 mb-6 flex-1 leading-relaxed">{provider.desc}</p>
                <a
                  href="#"
                  data-testid={provider.testId}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {provider.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PER-CALL COST BREAKDOWN ── */}
      <Section className="py-20">
        <SectionHeading>Per-Call Cost Breakdown</SectionHeading>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { price: "~$0.02", label: "Twilio — inbound (2 min)", sub: "~$0.01/min, paid to Twilio" },
            { price: "~$0.25", label: "OpenAI Realtime (2 min)", sub: "Audio in + out, paid to OpenAI" },
            { price: "~$0.27", label: "Total per 2-min call", sub: "Your direct API costs" },
            { price: "$0.003", label: "DEODRANT fee (1,400 calls)", sub: "$4.20/mo flat — per-call share" },
          ].map((card, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-white/60 rounded-2xl p-6 border border-foreground/8">
                <div className="text-3xl font-black italic text-foreground mb-1">{card.price}</div>
                <div className="text-xs font-bold uppercase text-primary mb-1 tracking-wide">{card.label}</div>
                <div className="text-xs text-foreground/50">{card.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { calls: "100 CALLS / MONTH", price: "~$31/MO", human: "~$4,200/mo human", save: "Save ~$4,169/mo" },
            { calls: "500 CALLS / MONTH", price: "~$139/MO", human: "~$4,200/mo human", save: "Save ~$4,061/mo" },
            { calls: "1000 CALLS / MONTH", price: "~$274/MO", human: "~$4,200/mo human", save: "Save ~$3,926/mo" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-white/60 rounded-2xl p-8 border border-foreground/8 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">{item.calls}</div>
                <div className="text-4xl font-black italic text-secondary mb-2">{item.price}</div>
                <div className="text-sm text-foreground/40 mb-2">vs {item.human}</div>
                <div className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {item.save}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section className="py-20">
        <motion.h2
          variants={fadeUp}
          className="font-black italic uppercase text-4xl md:text-5xl tracking-tight text-foreground mb-10"
        >
          Pricing
        </motion.h2>

        <motion.div variants={fadeUp} className="max-w-md mx-auto">
          <div className="relative bg-[#2a2450] rounded-3xl p-10 text-white">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full">
                🌐 DEODRANT HOLDER
              </div>
            </div>

            <div className="mt-6 mb-6">
              <div className="text-7xl font-black italic text-secondary leading-none">$4.20</div>
              <div className="text-sm font-medium text-white/50 mt-1">/month per business</div>
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-sm text-white/70 font-medium">
                Requires 420+ $DEODRANT in your connected wallet
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Unlimited AI call handling",
                "Custom dialogue training",
                "Call transcripts & logs",
                "24/7 availability",
                "95+ languages supported",
                "API key management dashboard",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <span className="text-emerald-400 font-black">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              data-testid="pricing-get-started"
              className="w-full py-4 bg-primary text-white font-black italic uppercase tracking-widest text-base rounded-xl hover:bg-primary/90 transition-colors"
            >
              GET STARTED
            </button>

            <div className="text-center mt-5">
              <a
                href="#"
                data-testid="pricing-how-to-get"
                className="text-secondary text-sm font-bold underline hover:text-secondary/80 transition-colors"
              >
                How to get $DEODRANT →
              </a>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── FUN IMAGE ── */}
      <Section className="py-10 pb-24">
        <motion.div variants={fadeUp}>
          <img
            src={callCenterImg}
            alt="AI Call Center"
            className="w-full h-auto rounded-3xl object-cover shadow-lg"
          />
        </motion.div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-white py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xl font-black italic uppercase mb-1">🌐 DEODRANT</div>
            <div className="text-sm text-white/50">The AI receptionist that actually works.</div>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/40">
            <a href="#" data-testid="footer-privacy" className="hover:text-white/80 transition-colors">Privacy Policy</a>
            <a href="#" data-testid="footer-terms" className="hover:text-white/80 transition-colors">Terms</a>
            <span>© {new Date().getFullYear()} DEODRANT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
