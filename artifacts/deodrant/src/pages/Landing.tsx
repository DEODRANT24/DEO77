import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Show } from "@clerk/react";
import "../index.css";

// ── X Cleanup feature gate ──────────────────────────────────────────────────
// Set to true once you have an X API key and the backend routes are wired up.
const X_API_CONFIGURED = false;

const X_CLEANUP_ITEMS = [
  { id: "activity",    label: "All Activity" },
  { id: "reposts",     label: "All Reposts" },
  { id: "replies",     label: "All Replies" },
  { id: "posts",       label: "All Posts / Quote Posts" },
  { id: "likes",       label: "All Likes" },
] as const;

type CleanupItemId = typeof X_CLEANUP_ITEMS[number]["id"];

const FIRST_NAMES = [
  "Aarav","Aadhya","Aadi","Aakash","Aanya","Aarohi","Aarush","Aarti","Abhay","Abhinav",
  "Aditya","Aditi","Advait","Advika","Agastya","Aisha","Ajay","Akanksha","Akash","Akhil",
  "Akshay","Alok","Aman","Amaya","Amit","Amrita","Anand","Ananya","Anika","Anil",
  "Anita","Anjali","Ankit","Ankita","Ansh","Anshika","Anuj","Anusha","Aparna","Arjun",
  "Arnav","Arpita","Arya","Aryan","Ashok","Ashwin","Atharv","Avani","Avinash","Ayush",
  "Bala","Bhanu","Bharath","Bhavna","Bhuvan","Charan","Charu","Chetan","Chitra","Daksh",
  "Damini","Darshan","Deepa","Deepak","Dev","Devansh","Devika","Dhruv","Diya","Eesha",
  "Eshan","Gagan","Gauri","Gautam","Gayatri","Gopal","Harini","Harish","Harsha","Hemant",
  "Hema","Himanshu","Isha","Ishaan","Ishita","Jai","Janani","Jatin","Jay","Jeevan",
  "Jhanvi","Jigar","Jitesh","Jyoti","Kabir","Kailash","Kalyani","Kamal","Karan","Karishma",
  "Kartik","Kavita","Kavya","Keerthi","Keshav","Khushi","Kiran","Kirti","Kishore","Kripa",
  "Krishna","Kriti","Kunal","Lakshmi","Lalit","Lavanya","Leela","Lokesh","Madhav","Madhuri",
  "Mahesh","Mala","Manan","Manasa","Manav","Manisha","Manoj","Meera","Megha","Mihir",
  "Milan","Mohan","Mohit","Mukesh","Naina","Nakul","Nandini","Narendra","Naren","Navya",
  "Neel","Neeraj","Neha","Nidhi","Nikhil","Nikita","Nilesh","Nisha","Nitin","Om",
  "Omkar","Padmini","Pallavi","Parth","Parul","Pooja","Pranav","Prashant","Pratik","Prerna",
  "Prisha","Priya","Rachana","Rahul","Raj","Rajat","Rajesh","Rakhi","Ram","Ramesh",
  "Ranjan","Rashi","Ravi","Reema","Rehan","Rhea","Riddhi","Rishi","Ritika","Riya",
  "Rohit","Rohan","Roshni","Ruchi","Rupali","Saanvi","Sachin","Sagar","Sahil","Sai",
  "Sakshi","Sameer","Samiksha","Sana","Sandhya","Sanjay","Sanjana","Sanya","Sarika","Saurabh",
  "Savita","Seema","Shaan","Shalini","Shankar","Sharad","Shikha","Shiv","Shivani","Shreya",
  "Shrikant","Shruti","Siddharth","Simran","Sneha","Soham","Sonal","Sonam","Sourabh","Srihari",
  "Srinivas","Subhash","Sudha","Sudhir","Suhani","Suman","Sunil","Sunita","Suraj","Suresh",
  "Swara","Swati","Tanmay","Tanya","Tara","Tejas","Tina","Trisha","Uday","Uma",
  "Upendra","Urvashi","Vaibhav","Vaidehi","Varsha","Varun","Ved","Veena","Venkatesh","Vibha",
  "Vidya","Vijay","Vikram","Vinay","Vineet","Vinod","Viraj","Vishal","Vishnu","Vivek",
  "Yash","Yashika","Yogesh","Yuvraj","Zara","Zoya","Aadit","Aahan","Abeer","Adarsh",
  "Advik","Ahana","Akriti","Alisha","Ameya","Anirudh","Anvika","Aradhya","Armaan","Bhavya",
  "Darsh","Eshwar","Hansika","Hriday","Inaaya","Jivika","Kiara","Mahika","Myra","Reyansh",
  "Rudra","Samaira","Shanaya","Tanvi","Vedant","Vihaan","Vivaan","Yuvan","Zain",
];

const LAST_NAMES = [
  "Sharma","Verma","Gupta","Singh","Patel","Shah","Mehta","Desai","Joshi","Trivedi",
  "Pandey","Mishra","Tiwari","Dubey","Chaturvedi","Shukla","Srivastava","Saxena","Agrawal","Bansal",
  "Goyal","Mittal","Jain","Kapoor","Khanna","Malhotra","Arora","Anand","Sethi","Kohli",
  "Ahuja","Chawla","Bajaj","Gill","Sandhu","Sidhu","Brar","Dhillon","Mann","Grewal",
  "Bedi","Puri","Chadha","Walia","Reddy","Rao","Naidu","Chowdary","Varma","Raju",
  "Yadav","Reddygaru","Iyer","Iyengar","Nair","Menon","Pillai","Kurup","Panicker","Nambiar",
  "Acharya","Hegde","Shetty","Kamath","Pai","Gowda","Bhat","Kulkarni","Deshpande","Patil",
  "Jadhav","Shinde","Pawar","Chavan","More","Sawant","Bhonsle","Inamdar","Salunkhe","Thorat",
  "Thakur","Chauhan","Rathore","Sisodia","Solanki","Tomar","Parmar","Rawat","Bhati","Shekhawat",
  "Chatterjee","Banerjee","Mukherjee","Bhattacharya","Bose","Das","Dutta","Ghosh","Roy","Sen",
  "Sarkar","Majumdar","Basu","Lahiri","Kundu","Pal","Ali","Khan","Ansari","Sheikh",
  "Qureshi","Syed","Pathan","Mirza","Siddiqui","Farooqui","Hussain","Memon","Choudhury","Dhar",
  "Kar","Biswas","Barua","Deb","Hazarika","Gogoi","Bora","Saikia","Kalita","Mahanta",
  "Pujari","Nayak","Mohanty","Sahu","Pradhan","Dasgupta","Samal","Behera","Panda","Rout",
  "Swain","Jena","Dasari","Ranganathan","Subramanian","Krishnan","Venkataraman","Balakrishnan","Narayanan","Suresh",
  "Chandran","Raman","Vaidyanathan","Rajan","Srinivasan","Kannan","Perumal","Lingayat","Hiremath","Patwardhan",
  "Ranade","Gokhale","Apte","Ketkar","Godbole","Karandikar","Phadke","Tambe","Oak","Vartak",
  "Chitale","Karmarkar","Bhave","Limaye","Rege","Date","Borkar","Mhatre","Khot","Naik",
  "Dalvi","Gaikwad","Bagul","Kadam","Landge","Bhagat","Maurya","Kushwaha","Lodhi","Jat",
  "Gurjar","Tyagi","Saini","Khatri","Lamba","Tandon","Rastogi","Nigam","Bharadwaj","Kaushik",
  "Vashisht","Pande","Upadhyay","Dwivedi","Pathak","Tripathi","Ojha","Bhardwaj","Chhibber","Tikku",
  "Raina","Kaul","Zutshi","Sapru","Mattu","Razdan","Bhasin","Talwar","Juneja","Narula",
  "Sachdeva","Kalra","Ahluwalia","Gambhir","Bindra","Trehan","Oberoi","Tuli","Wadhwa","Poonia",
  "Dahiya","Malik","Sangwan","Hooda","Jakhar","Sehrawat","Dalal","Lather","Punia","Chikara",
  "Tanwar","Kadyan","Ahlawat","Meghwal","Bairwa","Koli","Bhil","Meena","Gurung","Rai",
  "Limbu","Tamang","Lepcha","Bhutia","Chettri","Thapa","Prasad","Teli","Soni","Khandelwal",
  "Somani","Lodha","Bothra","Surana","Dugar","Baid","Bagri","Kasliwal","Taparia","Jhunjhunwala",
  "Ruia","Poddar","Birla","Singhania","Goenka","Jalan","Bangur","Kejriwal","Modi","Adani",
  "Ambani","Piramal","Mistry","Contractor","Daruwalla","Batliwala","Anklesaria","Tata","Vakil","Commissariat",
  "Bharucha","Pavri","Mankad","Zaveri","Merchant",
];

const JEET_TITLES = ["Engineer", "Medical Doctor", "Scientist", "Engineer", "Uber Driver", "Data Scientist", "Porto Potty Dev"];

function generateJeetName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const addTitle = Math.random() < 0.5;
  if (addTitle) {
    const title = JEET_TITLES[Math.floor(Math.random() * JEET_TITLES.length)];
    return `${first} ${last}, ${title}`;
  }
  return `${first} ${last}`;
}

const REJECTION_REASONS = [
  "smells of weak hands",
  "paper hands detected",
  "portfolio: 100% rugs",
  "sold the last dip",
  "asked 'is this a scam?'",
  "used the word 'roadmap'",
  "sold at -2%, bought at ATH",
  "jeet energy too strong",
  "has stop-loss enabled",
  "replied 'wen moon?' in TG",
  "panic sold last Tuesday",
  "follows 47 influencers",
  "diamond hand allergic",
  "checked price every 30s",
  "applied for H1B visa",
  "asked for code review sarr",
  "DM'd 'pliss sarr halp'",
  "empowered by cow poo",
  "submitted 47 job applications today",
  "portfolio smells of curry and regret",
  "asked wen airdrop in 12 group chats",
  "holds zero bags, just vibes",
  "used 'Sarr' 9 times in one message",
  "LinkedIn has 4,000 connections, 0 bags",
  "tried to negotiate the token price",
  "asked dev team to add him as advisor",
  "sold to fund cousin's wedding",
  "works at big tech, earns in USD, bags in dust",
  "sent a 3-paragraph 'kindly revert' email",
  "copy-pasted wallet address 11 times",
  "blamed Shiva for his paper hands",
  "powered by cow dung and FOMO",
  "asked if DEODRANT has an app sarr",
  "replied to every tweet with 'wen listing?'",
  "demanded whitepaper in Hindi",
  "panic sold, then panic bought at +40%",
  "held a scam for 2 years, sold DEODRANT in 2 hours",
  "owns 12 rugs, still optimistic",
  "smell detected from 47 wallets away",
  "tried to airdrop himself",
  "screenshotted chart, posted as analysis",
  "sarr pliss do the needful sarr",
  "sent 'pliss revert' 14 times",
  "yes sarr I will buy yes sarr",
  "kindly do the needful sarr",
  "sarr my cousin needs the whitepaper sarr",
  "pliss sarr just one airdrop sarr",
  "sarr I am very interest sarr",
  "replied 'noted sarr' then immediately sold",
  "DM: 'sarr when lambo sarr pliss'",
  "sarr I have revert the transaction sarr",
  "requested dev support 47 times as 'pliss sarr'",
  "sarr DEODRANT smell too strong sarr cannot approach",
];

function useWallOfPoop() {
  const [entries, setEntries] = useState<{ id: number; name: string; reason: string; time: string }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    function addEntry() {
      const name = generateJeetName();
      const reason = REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)];
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
      counterRef.current += 1;
      setEntries(prev => [{ id: counterRef.current, name, reason, time }, ...prev].slice(0, 8));
    }
    addEntry();
    const interval = setInterval(addEntry, 1200 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return entries;
}

function useJeetometer() {
  const [count, setCount] = useState(4_271_337);
  const [flash, setFlash] = useState(false);
  const [lastDelta, setLastDelta] = useState(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function tick() {
      const delta = Math.floor(Math.random() * 7) + 1;
      setCount((c) => c + delta);
      setLastDelta(delta);
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      timeout = setTimeout(tick, 400 + Math.random() * 1400);
    }
    timeout = setTimeout(tick, 600);
    return () => clearTimeout(timeout);
  }, []);

  return { count, flash, lastDelta };
}

const services = [
  {
    id: 1,
    icon: "🧹",
    title: "CLEAN UP YOUR X",
    subtitle: "Fresh Scent. Fresh Scam.",
    description:
      "HOLD 420,000+ $DEODRANT or BURN 42,000+ DEODRANT to prove you're no Jeet. $DEODRANT Chads can quickly mass remove posts from their X, for when their authoritarian corrupt government looks to arrest them for expressing themselves. We simply spray their X with DEODRANT.\n\nHOW?\nWe've cloned the practices of Jeets to create an AI that scrubs your X timeline until it sparkles like Garbage straight from the Ganges. 90% CHEAPER for DEODRANT COMPATIBLE HUMANS.",
    badge: "FRESHNESS GUARANTEE",
    color: "#FF6B35",
  },
  {
    id: 2,
    icon: "📞",
    title: "AI AMAZON SPAM CALLER",
    subtitle: "\"Hello, This Is Amazon.\"",
    description:
      "Make Jeets bankrupt! Deploy our AI agent & make up to 420 calls a day, no Jeets needed, on our Person Off Odour Plan (POOP). Scripts include: \"Hello, This is Amazon.\" \"We have sent you too much money dear\", \"OK, please buy DEODRANT on SOL and send to us\" as well as the timeless \"Please click this link I am sending and accept remote access please Sar/Mam\" Completely legal in at least 3 countries.",
    badge: "POOP CERTIFIED",
    color: "#3B82F6",
  },
  {
    id: 3,
    icon: "🏢",
    title: "AI CALL CENTRE",
    subtitle: "Professional Chaos As A Service",
    description:
      "Why hire Jeets when you can irritate customers slightly cheaper with your own AI call centre? Fully staffed with useless bots for your business needs. Put customers on hold for 5-45 mins (for an authentic feel), miscommunicate everything, then disconnect at critical moments. Enterprise tier available.",
    badge: "ISO 9001 UNCERTIFIED",
    color: "#10B981",
  },
  {
    id: 4,
    icon: "📈",
    title: "TRADING BOT",
    subtitle: "0.3% Profit. Always Winning.",
    description:
      "Our revolutionary trading algorithm sells at exactly 0.3% profit every time Saar. You will never lose Saar. You will also never make BIG money Saar. But you must ALWAYS be winning Saar. Multiple times Saar. Our accountant is still calculating how many times you've won Saar. Many. So many wins Saar.",
    badge: "GUARANTEED WINS™",
    color: "#8B5CF6",
  },
];

const halftoneRows = Array.from({ length: 20 });
const halftoneCols = Array.from({ length: 30 });

export default function Landing() {
  const [, navigate] = useLocation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { count, flash, lastDelta } = useJeetometer();
  const poopEntries = useWallOfPoop();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [botStep, setBotStep] = useState(0);
  const [botWallet, setBotWallet] = useState('');
  const [botPayOption, setBotPayOption] = useState<'burn' | 'lp' | null>(null);
  const [botVerifying, setBotVerifying] = useState(false);
  const [botVerified, setBotVerified] = useState(false);
  const [botVerifyError, setBotVerifyError] = useState<React.ReactNode>('');
  const [botPaymentWindowTs, setBotPaymentWindowTs] = useState<number>(0);
  const [xCleanupOpen, setXCleanupOpen] = useState(false);
  const [xLoggedIn, setXLoggedIn] = useState(false);
  const [xCleaning, setXCleaning] = useState(false);
  const [xDone, setXDone] = useState(false);
  const [xSelected, setXSelected] = useState<Set<CleanupItemId>>(new Set(X_CLEANUP_ITEMS.map(i => i.id)));
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sprayMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sprayMenuRef.current && !sprayMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  function closeMobileMenu() { setMobileMenuOpen(false); }

  const PUMP_FUN_URL = "https://pump.fun"; // Replace with real link when token launches
  const CONTRACT_ADDRESS = ""; // Replace with CA when token launches

  function copyCA() {
    if (!CONTRACT_ADDRESS) return;
    navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, [videoLoaded]);

  return (
    <div className="deodrant-root">
      {/* HERO SECTION */}
      <section className="hero-section">
        {/* Video Background */}
        <div className="video-bg-wrap">
          <video
            ref={videoRef}
            className="video-bg"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => {
              setVideoLoaded(true);
              if (videoRef.current) videoRef.current.playbackRate = 0.7;
            }}
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay" />
        </div>

        {/* Comic halftone dots */}
        <div className="halftone-bg" aria-hidden="true">
          {halftoneRows.map((_, r) =>
            halftoneCols.map((_, c) => (
              <span key={`${r}-${c}`} className="halftone-dot" />
            ))
          )}
        </div>

        {/* Speed lines */}
        <div className="speed-lines" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="speed-line"
              style={{ transform: `rotate(${i * 20}deg)` }}
            />
          ))}
        </div>

        {/* NAV */}
        <nav className="comic-nav">
          <span className="nav-logo">$DEODRANT</span>

          {/* Desktop links */}
          <div className="nav-links nav-links--desktop">
            <div className="nav-dropdown">
              <button className="nav-dropdown-trigger">GAMES ▾</button>
              <div className="nav-dropdown-menu">
                <a href="https://jeetwor.xyz" target="_blank" rel="noopener noreferrer">JEET WOR</a>
                <a href="https://grandjeetauto.com" target="_blank" rel="noopener noreferrer">GJA VI (coming soon 💩)</a>
              </div>
            </div>
            <a href="#services">SERVICES</a>
            <a href="#token">TOKEN</a>
            <a href="https://x.com/DEODRANTSPRAY" target="_blank" rel="noopener noreferrer" className="nav-social" aria-label="Twitter/X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.054 2.25H8.08l4.26 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://t.me/DEODRANTSPRAY" target="_blank" rel="noopener noreferrer" className="nav-social" aria-label="Telegram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <Show when="signed-in">
              <button className="nav-login-btn" onClick={() => navigate("/profile")}>PROFILE</button>
            </Show>
            <Show when="signed-out">
              <button className="nav-login-btn" onClick={() => navigate("/sign-in")}>LOGIN</button>
            </Show>
            <button className="nav-cta" onClick={() => setBuyModalOpen(true)}>BUY NOW</button>
          </div>

          {/* Mobile spray can menu */}
          <div className="spray-can-wrap" ref={sprayMenuRef}>
            <button
              className={`spray-can-btn${mobileMenuOpen ? " spray-can-btn--open" : ""}`}
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Open menu"
            >
              {/* Spray particles when open */}
              {mobileMenuOpen && (
                <div className="spray-particles" aria-hidden="true">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="spray-particle" style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </div>
              )}
              {/* Can image */}
              <img src="/deodrant-can.png?v=2" alt="DEODRANT spray can" className="spray-can-img" />
            </button>

            {/* Dropdown menu */}
            {mobileMenuOpen && (
              <div className="spray-menu">
                <div className="spray-menu-nozzle" />
                <a href="https://jeetwor.xyz" target="_blank" rel="noopener noreferrer" className="spray-menu-item" style={{ "--delay": "0.02s" } as React.CSSProperties} onClick={closeMobileMenu}>🎮 JEET WOR</a>
                <a href="https://grandjeetauto.com" target="_blank" rel="noopener noreferrer" className="spray-menu-item" style={{ "--delay": "0.07s" } as React.CSSProperties} onClick={closeMobileMenu}>🎮 GJA VI (coming soon 💩)</a>
                <a href="#services" className="spray-menu-item" style={{ "--delay": "0.12s" } as React.CSSProperties} onClick={closeMobileMenu}>SERVICES</a>
                <a href="#token" className="spray-menu-item" style={{ "--delay": "0.17s" } as React.CSSProperties} onClick={closeMobileMenu}>TOKEN</a>
                <a href="https://x.com/DEODRANTSPRAY" target="_blank" rel="noopener noreferrer" className="spray-menu-item spray-menu-item--social" style={{ "--delay": "0.22s" } as React.CSSProperties} onClick={closeMobileMenu}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.054 2.25H8.08l4.26 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  TWITTER
                </a>
                <a href="https://t.me/DEODRANTSPRAY" target="_blank" rel="noopener noreferrer" className="spray-menu-item spray-menu-item--social" style={{ "--delay": "0.27s" } as React.CSSProperties} onClick={closeMobileMenu}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  TELEGRAM
                </a>
                <Show when="signed-in">
                  <button className="spray-menu-item" style={{ "--delay": "0.30s" } as React.CSSProperties} onClick={() => { closeMobileMenu(); navigate("/profile"); }}>
                    👤 PROFILE
                  </button>
                </Show>
                <Show when="signed-out">
                  <button className="spray-menu-item" style={{ "--delay": "0.30s" } as React.CSSProperties} onClick={() => { closeMobileMenu(); navigate("/sign-in"); }}>
                    🔑 LOGIN
                  </button>
                </Show>
                <button className="spray-menu-item spray-menu-item--cta" style={{ "--delay": "0.35s" } as React.CSSProperties} onClick={() => { closeMobileMenu(); setBuyModalOpen(true); }}>
                  🚀 BUY NOW
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div className="hero-content">
          <div className="hero-text-side">
            <p className="hero-remigration-text">REMIGRATION BEGINS WHEN YOU BUY</p>
            <div className="issue-badge">ISSUE #1 • LIMITED EDITION • WHAT OUR WORLD NEEDS</div>
            <h1 className="hero-title">
              <span className="title-deodrant">DEODRANT</span>
              <span className="title-sub">The Token That Repels Pajeets</span>
            </h1>

            {/* Mobile-only Shiva — between title and slogan */}
            <div className="shiva-mobile-wrap" aria-hidden="true">
              <div className="shiva-frame">
                <div className="shiva-burst" />
                <div className="shiva-crossfade">
                  <img src="/shiva-clean.png" alt="Shiva holding DEODRANT" className="shiva-img shiva-img-a" />
                  <img src="/shiva-crazy.png" alt="Shiva holding DEODRANT" className="shiva-img shiva-img-b" />
                  <div className="shiva-spray" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} className={`spray-p spray-p--${i + 1}`} />
                    ))}
                  </div>
                </div>
                <div className="shiva-caption">LORD SHIVA<br />CHIEF DEODORANT TEST RAT</div>
              </div>
            </div>

            <div className="slogan-box">
              <p className="slogan-text">
                "If Jeets Can't buy,<br />
                <span className="slogan-accent">Jeets can't sell."</span>
              </p>
            </div>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => setBuyModalOpen(true)}>
                BUY $DEODRANT
              </button>
              <a href="#services" className="btn-secondary">
                VIEW SERVICES
              </a>
            </div>
            {/* JEETOMETER */}
            <div className="jeetometer-panel">
              <div className="jeetometer-header">
                <span className="jeetometer-live">● LIVE</span>
                <span className="jeetometer-title">JEETOMETER™</span>
              </div>
              <div className={`jeetometer-count ${flash ? "jeetometer-flash" : ""}`}>
                {count.toLocaleString()}
              </div>
              <div className="jeetometer-label">JEETS REPELLED FROM BUYING</div>
              <div className="jeetometer-footer">
                <span className="jeetometer-delta">+{lastDelta} just now</span>
                <span className="jeetometer-status">🛡️ SHIELD ACTIVE</span>
              </div>
            </div>

            <div className="ticker-row">
              <span className="ticker-item">$DEODRANT</span>
              <span className="ticker-sep">★</span>
              <span className="ticker-item">ANTI-JEET TECHNOLOGY</span>
              <span className="ticker-sep">★</span>
              <span className="ticker-item">FEARED BY SHIVA</span>
              <span className="ticker-sep">★</span>
              <span className="ticker-item">0.3% PROFIT GUARANTEED</span>
              <span className="ticker-sep">★</span>
            </div>

            {/* CONTRACT ADDRESS */}
            <div className="ca-bar">
              <span className="ca-label">CA:</span>
              <span className="ca-address">
                {CONTRACT_ADDRESS || "TBA — TOKEN LAUNCHING SOON"}
              </span>
              <button
                className={`ca-copy-btn ${copied ? "ca-copy-btn--copied" : ""} ${!CONTRACT_ADDRESS ? "ca-copy-btn--disabled" : ""}`}
                onClick={copyCA}
                disabled={!CONTRACT_ADDRESS}
              >
                {copied ? "✓ COPIED" : "COPY"}
              </button>
            </div>
          </div>

          <div className="hero-image-side">
            <div className="shiva-frame">
              <div className="shiva-burst" />
              <div className="shiva-crossfade">
                <img
                  src="/shiva-clean.png"
                  alt="Shiva holding DEODRANT"
                  className="shiva-img shiva-img-a"
                />
                <img
                  src="/shiva-crazy.png"
                  alt="Shiva holding DEODRANT"
                  className="shiva-img shiva-img-b"
                />
                <div className="shiva-spray" aria-hidden="true">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className={`spray-p spray-p--${i + 1}`} />
                  ))}
                </div>
              </div>
              <div className="shiva-caption">LORD SHIVA<br />CHIEF DEODORANT TEST RAT</div>
              <div className="speech-bubble">
                "YOUR PORTFOLIO<br />NEEDS THIS MORE<br />THAN YOU KNOW."
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLING BANNER */}
        <div className="scroll-banner">
          <div className="scroll-track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="scroll-text">
                BUY $DEODRANT TODAY • IF YOU SMELL, YOU CAN'T SELL •
                ANTI-JEET • ANTI-RUG • ANTI-COW PISS • BUILT ON SOL • SHIVA REPRESSED • BUY $DEODRANT TODAY • IF YOU SMELL, YOU CAN'T SELL •
                ANTI-JEET • ANTI-RUG • ANTI-SMELL • BUILT ON SOL • SHIVA FEARED • BUY $DEODRANT TODAY • REMIGRATION NOW •
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROTECT YOUR NATION */}
      <section className="protect-section">
        <div className="protect-inner">
          <div className="protect-badge">⚠ PUBLIC SERVICE ANNOUNCEMENT ⚠</div>
          <h2 className="protect-title">Protect your nation</h2>
          <div className="protect-body">
            <p>Holding <strong>$DEODRANT</strong> is the first step to drive remigration.</p>
            <p>Jeets &amp; Jihadists alike cannot buy, hold or be anywhere near a strong holder of DEODRANT.</p>
            <p>Protect your family and nation, stack a large amount of DEODRANT in your digital wallet. Carry it at all times.</p>
            <p>DEODRANT will also protect your entire portfolio from Jeets. They will sense the presence of DEODRANT and run away. If they&apos;re drunk on/empowered by cow poo, you can spray them and they will melt.</p>
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="howto-section">
        <div className="section-header">
          <div className="section-badge">CHAPTER 2</div>
          <h2 className="section-title">HOW TO USE</h2>
          <p className="section-subtitle">Field-tested instructions for maximum jeet repulsion.</p>
        </div>
        <div className="howto-steps">
          <div className="howto-step">
            <div className="howto-num">01</div>
            <div className="howto-content">
              <h3 className="howto-title">BUY &amp; HOLD</h3>
              <p className="howto-desc">Acquire a large stack of $DEODRANT and keep it in your wallet at all times. Do not sell. Jeets can smell weakness.</p>
            </div>
          </div>
          <div className="howto-step">
            <div className="howto-num">02</div>
            <div className="howto-content">
              <h3 className="howto-title">DETECT THE JEET</h3>
              <p className="howto-desc">Watch for signs: unsolicited DMs, "wen moon sarr?", promises of 10,000x returns, or the faint odour of cow dung on your timeline.</p>
            </div>
          </div>
          <div className="howto-step">
            <div className="howto-num">03</div>
            <div className="howto-content">
              <h3 className="howto-title">AIM &amp; SPRAY</h3>
              <p className="howto-desc">Point your digital wallet directly at the offending jeet or jihadist. The presence of DEODRANT alone will cause them to flee. For cow-poo empowered targets, a direct spray will result in complete dissolution.</p>
            </div>
          </div>
          <div className="howto-step">
            <div className="howto-num">04</div>
            <div className="howto-content">
              <h3 className="howto-title">ENJOY CLEAN PORTFOLIO</h3>
              <p className="howto-desc">Breathe easy. Your bags are now jeet-free, fresh-scented, and protected by the divine fury of Lord Shiva (the test rat).</p>
            </div>
          </div>
        </div>
      </section>

      {/* WALL OF POOP */}
      <section className="poop-section">
        <div className="section-header">
          <div className="section-badge" style={{ background: "#8B4513" }}>LIVE FEED</div>
          <h2 className="section-title" style={{ textShadow: "4px 4px 0 #8B4513" }}>
            💩 WALL OF POOP 💩
          </h2>
          <p className="section-subtitle">Jeets attempting to buy $DEODRANT — rejected in real time.</p>
        </div>

        <div className="poop-feed">
          {poopEntries.map((entry, idx) => (
            <div key={entry.id} className={`poop-entry ${idx === 0 ? "poop-entry--new" : ""}`}>
              <div className="poop-icon">💩</div>
              <div className="poop-body">
                <span className="poop-name">{entry.name}</span>
                <span className="poop-tried"> tried to buy $DEODRANT —</span>
                <span className="poop-reason"> {entry.reason}</span>
              </div>
              <div className="poop-right">
                <span className="poop-rejected">🛡️ REJECTED</span>
                <span className="poop-time">{entry.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="services-section">
        <div className="section-header">
          <div className="section-badge">CHAPTER 3</div>
          <h2 className="section-title">OUR SACRED SERVICES</h2>
          <p className="section-subtitle">
            Powered by blockchain magic and questionable life choices.
          </p>
        </div>

        <div className="services-grid">
          {services.map((svc, idx) => (
            <div key={svc.id} className={`service-card-wrapper${svc.id === 1 ? " service-card-wrapper--labeled" : ""}`}>
              {svc.id === 1 && (
                <div className="card-above-label">CHEAP WITH $DEODRANT</div>
              )}
            <div
              className="service-card"
              style={{ "--card-accent": svc.color } as React.CSSProperties}
            >
              <div className="card-number">0{idx + 1}</div>
              <div className="card-badge">{svc.badge}</div>
              <div className="card-icon">{svc.icon}</div>
              <h3 className="card-title">{svc.title}</h3>
              <div className="card-subtitle">{svc.subtitle}</div>
              <div className="card-desc">
                {svc.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {svc.id === 1 && (
                <div className="card-inline-img-wrap card-inline-img-wrap--contain card-inline-img-wrap--clickable" onClick={() => setLightboxSrc("/ganges-man.png")}>
                  <img src="/ganges-man.png" alt="" className="card-inline-img" />
                </div>
              )}
              {svc.id === 2 && (
                <div className="card-inline-img-wrap card-inline-img-wrap--clickable" onClick={() => setLightboxSrc("/robots-callcentre.png")}>
                  <img src="/robots-callcentre.png" alt="" className="card-inline-img" />
                </div>
              )}
              {svc.id === 3 && (
                <div className="card-inline-img-wrap card-inline-img-wrap--clickable" onClick={() => setLightboxSrc("/ai-callcentre.png")}>
                  <img src="/ai-callcentre.png" alt="" className="card-inline-img" />
                </div>
              )}
              {svc.id === 4 && (
                <div className="card-inline-img-wrap card-inline-img-wrap--clickable" onClick={() => setLightboxSrc("/trading-bot.png")}>
                  <img src="/trading-bot.png" alt="" className="card-inline-img" />
                </div>
              )}
              <button
                className="card-btn"
                onClick={
                  svc.id === 1 ? () => navigate('/x-clean') :
                  svc.id === 2 ? () => navigate('/Get-Leads-Saar') :
                  svc.id === 3 ? () => navigate('/call-centre') :
                  svc.id === 4 ? () => setBotStep(1) :
                  undefined
                }
              >ACTIVATE NOW</button>
              <div className="card-corner-fold" />
            </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOKEN SECTION */}
      <section id="token" className="token-section">
        {/* Comic panel background elements */}
        <div className="token-bg-shapes" aria-hidden="true">
          <div className="bg-circle bg-circle-1" />
          <div className="bg-circle bg-circle-2" />
          <div className="bg-circle bg-circle-3" />
        </div>

        <div className="token-inner">
          <div className="token-left">
            <div className="token-badge-top">THE TOKEN ★ $DEODRANT ★ SOL NETWORK</div>
            <h2 className="token-title">
              OUR TOKEN<br />
              <span className="token-title-accent">REPELS JEETS</span><br />
              BEFORE THEY BUY.
            </h2>
            <div className="token-desc-box">
              <p className="token-desc">
                Ancient Sanskrit scrolls foretold of a token so pure, so fragrant,
                so threatening, that the mere sight of its chart would cause Jeets to
                recoil in disgust, burn up and even leave your country.
                That token is <strong>$DEODRANT</strong>.
              </p>
              <p className="token-desc">
                Our proprietary <strong>Anti-Jeet Molecular Shield™</strong> creates
                an invisible barrier around whoever holds it in their wallet. Jeets approach.
                They 'sense' it. They flee. <em>The diamond hands/chads/native populace remain.</em>
              </p>
              <p className="token-desc">
                Scientists call it impossible. Shiva calls it <strong>"Ah fuck, me too?"</strong>.
                We call it <strong>genius tokenomics.</strong> Jeets call it <em>"Sarr, please no sarr"</em>.
              </p>
            </div>
            <div className="token-stats">
              <div className="stat-item">
                <span className="stat-num">∞</span>
                <span className="stat-label">Jeets Repelled</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">0.3%</span>
                <span className="stat-label">Guaranteed Profit</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">1B</span>
                <span className="stat-label">Token Supply</span>
              </div>
            </div>
            <a href="#buy" className="token-cta-btn">BUY $DEODRANT ON SOL</a>
          </div>

          <div className="token-right">
            <div className="token-coin-wrap">
              <div className="token-coin-glow" />
              <div className="token-coin">
                <div className="token-coin-crossfade">
                  <img src="/shiva-clean.png" alt="DEODRANT Token" className="token-coin-img token-coin-img-a" />
                  <img src="/shiva-crazy.png" alt="DEODRANT Token" className="token-coin-img token-coin-img-b" />
                </div>
                <div className="token-coin-ring" />
                <div className="token-coin-text">$DEODRANT</div>
              </div>
              <div className="token-pow">
                <span>POW!</span>
              </div>
              <div className="token-zap token-zap-1">⚡</div>
              <div className="token-zap token-zap-2">💫</div>
              <div className="token-zap token-zap-3">✨</div>
              <div className="jeet-warning">
                ⚠️ WARNING: JEET REPELLENT ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>DISCLAIMER:</strong> Not financial advice. Shiva is not actually a GOD.
          Poop Eaters worship him because, like them, he has blue balls. Please do not use
          our AI caller to scam people. We are not responsible for any jeet-related incidents.
          Please go outside. Unless you have Jeets dropping garbage everywhere. Then buy DEODRANT first.
        </div>
      </section>

      {/* BUY MODAL */}
      {buyModalOpen && (
        <div className="modal-backdrop" onClick={() => setBuyModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBuyModalOpen(false)}>✕</button>
            <div className="modal-shiva-wrap">
              <img src="/shiva-clean.png" alt="Shiva" className="modal-shiva" />
            </div>
            <div className="modal-bubble">"ANON, THE TIME IS NOW."</div>
            <h2 className="modal-title">BUY $DEODRANT</h2>
            <p className="modal-subtitle">On Solana. On pump.fun. Under the watchful eye of Shiva.</p>
            <div className="modal-ca">
              <span className="ca-label">CA:</span>
              <span className="ca-address">{CONTRACT_ADDRESS || "TBA — LAUNCHING SOON"}</span>
            </div>
            <a
              href={PUMP_FUN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-buy-btn"
            >
              🚀 BUY ON PUMP.FUN
            </a>
            <p className="modal-disclaimer">Not financial advice. Shiva is not a licensed broker.</p>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxSrc && (
        <div className="lightbox-backdrop" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>✕</button>
          <img src={lightboxSrc} alt="" className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* BOT UNLOCK MODAL */}
      {botStep > 0 && (
        <div className="modal-backdrop" onClick={() => { setBotStep(0); setBotWallet(''); setBotPayOption(null); setBotVerified(false); setBotVerifyError(''); }}>
          <div className="modal-box bot-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setBotStep(0); setBotWallet(''); setBotPayOption(null); setBotVerified(false); setBotVerifyError(''); }}>✕</button>

            {/* STEP 1: WALLET + PAYMENT OPTION */}
            {botStep === 1 && (
              <>
                <h2 className="modal-title bot-modal-title">🤖 UNLOCK THE BOT</h2>
                <p className="modal-subtitle">Now everyone can have a bot that Jeets for retarded low IQ profit.</p>
                <div className="bot-step-label">STEP 1 OF 2 — Your Wallet Address</div>
                <input
                  className="bot-wallet-input"
                  placeholder="Your Solana wallet address (the one you're paying from)..."
                  value={botWallet}
                  onChange={e => setBotWallet(e.target.value.trim())}
                />
                <div className="bot-step-label" style={{ marginTop: '1.25rem' }}>CHOOSE PAYMENT METHOD</div>
                <div className="bot-options">
                  <button
                    className={`bot-option${botPayOption === 'burn' ? ' bot-option--selected' : ''}`}
                    onClick={() => setBotPayOption('burn')}
                  >
                    <div className="bot-option-title">🔥 BURN ROUTE</div>
                    <div className="bot-option-desc">Send <strong>42,000 $DEODRANT</strong> to the incinerator address.<br />Tokens are burned forever. Gone. Pure commitment. Shiva fears this. As the fire rises.</div>
                  </button>
                  <button
                    className={`bot-option${botPayOption === 'lp' ? ' bot-option--selected' : ''}`}
                    onClick={() => setBotPayOption('lp')}
                  >
                    <div className="bot-option-title">💧 LP ROUTE</div>
                    <div className="bot-option-desc">Send <strong>21,000 $DEODRANT + the same value in SOL</strong> to our treasury wallet.<br />Both are locked into the pump.fun LP, deepening liquidity for all holders.</div>
                  </button>
                </div>
                <button
                  className="xclean-go-btn"
                  style={{ marginTop: '1.25rem', width: '100%' }}
                  disabled={!botWallet || botWallet.length < 32 || !botPayOption}
                  onClick={() => { setBotPaymentWindowTs(Date.now()); setBotStep(2); }}
                >
                  NEXT →
                </button>
              </>
            )}

            {/* STEP 2: PAYMENT INSTRUCTIONS + VERIFY */}
            {botStep === 2 && (
              <>
                <h2 className="modal-title bot-modal-title">💸 SEND PAYMENT</h2>

                {botPayOption === 'burn' ? (
                  <>
                    <p className="modal-subtitle">Send exactly <strong>42,000 $DEODRANT</strong> from your wallet to the incinerator address below. Historical transactions won't work. One download per transaction.</p>
                    <div className="bot-payment-box">
                      <div className="bot-payment-label">BURN ADDRESS — SEND 42,000 $DEODRANT TO:</div>
                      <div className="bot-payment-addr" onClick={() => navigator.clipboard.writeText('1nc1nerator11111111111111111111111111111111')}>
                        1nc1nerator11111111111111111111111111111111
                        <span className="bot-copy-hint">📋 click to copy</span>
                      </div>
                      <div className="bot-payment-note">These tokens are burned permanently. We've told the chain to eat them.</div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="modal-subtitle">Send <strong>21,000 $DEODRANT + equivalent value in SOL</strong> (at time of sending) to our treasury wallet. Historical transactions won't work. One download per transaction.</p>
                    <div className="bot-payment-box">
                      <div className="bot-payment-label">TREASURY — SEND BOTH TOKENS TO:</div>
                      <div className="bot-payment-addr" onClick={() => navigator.clipboard.writeText('Eb4hWanN3c7WQGviwdTqLqd1G5bDupGKu9RwG4Rv4zhH')}>
                        Eb4hWanN3c7WQGviwdTqLqd1G5bDupGKu9RwG4Rv4zhH
                        <span className="bot-copy-hint">📋 click to copy</span>
                      </div>
                      <div className="bot-payment-note">Your DEODRANT + SOL is locked into the pump.fun liquidity pool — permanently deepening LP depth for every holder.</div>
                    </div>
                  </>
                )}

                <div className="bot-step-label">SENDING FROM THIS WALLET:</div>
                <div className="bot-wallet-display">{botWallet}</div>

                <div className="bot-verify-row">
                  <button className="bot-back-btn" onClick={() => setBotStep(1)}>← Back</button>
                  <button
                    className="xclean-go-btn"
                    style={{ flex: 1 }}
                    disabled={botVerifying}
                    onClick={async () => {
                      setBotVerifying(true);
                      setBotVerifyError('');
                      const dest = botPayOption === 'burn'
                        ? '1nc1nerator11111111111111111111111111111111'
                        : 'Eb4hWanN3c7WQGviwdTqLqd1G5bDupGKu9RwG4Rv4zhH';
                      try {
                        const rpc = 'https://api.mainnet-beta.solana.com';
                        const sigResp = await fetch(rpc, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [dest, { limit: 50 }] })
                        });
                        const sigData = await sigResp.json();
                        const sigs: Array<{ signature: string }> = sigData.result || [];
                        let found = false;
                        for (const s of sigs.slice(0, 20)) {
                          const txResp = await fetch(rpc, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTransaction', params: [s.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }] })
                          });
                          const txData = await txResp.json();
                          const blockTime: number | null = txData.result?.blockTime ?? null;
                          if (blockTime !== null && blockTime < botPaymentWindowTs / 1000) continue;
                          const keys: Array<{ pubkey?: string } | string> = txData.result?.transaction?.message?.accountKeys || [];
                          if (keys.some((k: any) => (k.pubkey || k) === botWallet)) { found = true; break; }
                        }
                        if (found) { setBotVerified(true); setBotStep(3); }
                        else { setBotVerifyError(<>Payment not found yet. Wait a moment for the transaction to confirm and try again. Still stuck? Reach us on <a href="https://t.me/DEODRANTSPRAY" target="_blank" rel="noopener noreferrer">Telegram</a>.</>); }
                      } catch {
                        setBotVerifyError("Couldn't reach Solana network. Check your connection and try again.");
                      } finally { setBotVerifying(false); }
                    }}
                  >
                    {botVerifying ? 'CHECKING ON-CHAIN…' : "I'VE SENT IT — VERIFY NOW"}
                  </button>
                </div>

                {botVerifyError && <p className="bot-verify-error">{botVerifyError}</p>}
              </>
            )}

            {/* STEP 3: VERIFIED + DOWNLOAD */}
            {botStep === 3 && botVerified && (
              <>
                <div className="xclean-done">
                  <div className="xclean-done-icon">✅</div>
                  <p className="xclean-done-text">PAYMENT VERIFIED, SAAR!</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--comic-cream)', marginTop: '0.25rem' }}>The sacred can of DEODRANT is open. Spray responsibly.</p>
                </div>

                <a href="/deodrant_bot.py" download="deodrant_bot.py" className="bot-download-btn">
                  ⬇ DOWNLOAD DEODRANT BOT v1.0
                </a>

                <div className="bot-instructions">
                  <div className="bot-instr-title">HOW TO RUN YOUR BOT</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--comic-yellow)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ color: 'var(--comic-yellow)', fontWeight: 700, marginBottom: '0.4rem' }}>🔐 TWO WALLETS — TWO ROLES</div>
                    <div style={{ color: 'var(--comic-cream)', marginBottom: '0.3rem' }}>
                      <strong style={{ color: 'var(--comic-yellow)' }}>PAYING WALLET</strong> — the wallet you just paid with. Its <em>address</em> goes in <code>licensed_wallet</code> for licence verification. Its private key is <strong>never needed</strong>.
                    </div>
                    <div style={{ color: 'var(--comic-cream)', padding: '0.3rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.3rem' }}>
                      Your paying wallet: <code style={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>{botWallet}</code>
                    </div>
                    <div style={{ color: 'var(--comic-cream)', marginTop: '0.4rem' }}>
                      <strong style={{ color: '#ff8c42' }}>BURNER WALLET</strong> — a brand-new wallet you create just for trading. Its <em>private key</em> goes in <code>private_key_base58</code>. Only load it with SOL you can afford to lose.
                    </div>
                  </div>
                  <ol className="bot-instr-list">
                    <li>Install Python 3.10+&nbsp;&nbsp;→&nbsp;&nbsp;<strong>python.org</strong></li>
                    <li>Open a terminal and run: <code>pip install solana solders httpx</code></li>
                    <li>Create a <strong>brand-new burner wallet</strong> — <em>not</em> the wallet you paid with</li>
                    <li>Run the bot once: <code>python deodrant_bot.py</code> — it creates <code>config.example.json</code></li>
                    <li>Copy it to <code>config.json</code> and set:
                      <ul style={{ marginTop: '0.3rem', paddingLeft: '1rem' }}>
                        <li><code>private_key_base58</code> → your <strong>burner</strong> wallet private key</li>
                        <li><code>licensed_wallet</code> → your <strong>paying</strong> wallet address (shown above)</li>
                        <li><code>target_token_mint</code> → $DEODRANT contract address</li>
                      </ul>
                    </li>
                    <li>Leave <code>dry_run: true</code> — watch the output, understand it, then go live</li>
                    <li>Stop at any time with <strong>Ctrl+C</strong> — your funds stay in your wallet</li>
                  </ol>
                  <div className="bot-instr-warn">
                    ⚠ Your private key is stored only in <code>config.json</code> on your machine. It never leaves your computer. Treat it like cash — never share it, never commit it to git, never paste it anywhere.<br /><br />
                    ⚠ Only ever use a fresh burner wallet loaded with what you can afford to lose entirely. Bots can malfunction like an Indian trying to fight a train. The DEODRANT team accepts no liability for losses.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* X CLEANUP MODAL */}
      {xCleanupOpen && (
        <div className="modal-backdrop" onClick={() => { setXCleanupOpen(false); setXDone(false); setXCleaning(false); setXLoggedIn(false); }}>
          <div className="modal-box xclean-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setXCleanupOpen(false); setXDone(false); setXCleaning(false); setXLoggedIn(false); }}>✕</button>

            {!X_API_CONFIGURED && <div className="xclean-coming-soon">COMING SOON</div>}

            <h2 className="modal-title xclean-title">🧹 CLEAN UP YOUR X</h2>
            <p className="modal-subtitle">Hold 420,000+ $DEODRANT or Burn 42,000+. Start fresh. Start clean.</p>

            {/* ── API Cost Breakdown ── */}
            <div className="xclean-cost-section">
              <div className="xclean-cost-header">
                <span className="xclean-cost-badge">💸 WHY TOKEN-GATING EXISTS</span>
              </div>
              <p className="xclean-cost-intro">
                X's API charges <strong>1,000× what any human should pay</strong> for bulk post management. We eat the API cost. You just hold tokens. Here's what they charge:
              </p>
              <div className="xclean-table-wrap">
                <table className="xclean-table">
                  <thead>
                    <tr>
                      <th>WHAT YOU WANT</th>
                      <th className="xclean-col-x">X API COST</th>
                      <th className="xclean-col-deo">DEODRANT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ['Delete 100 posts', '$100/mo Basic — all read+write quota consumed', 'FREE ✓'],
                      ['Delete 5,000 posts', '$100/mo × 5 months quota — or bump to Pro', 'FREE ✓'],
                      ['Delete 50,000 posts', '$5,000/mo Pro tier required', 'FREE ✓'],
                      ['Nuke 100k+ posts (full timeline)', '$42,000+/mo Enterprise + lawyers', 'FREE ✓'],
                      ['Your dignity', 'Priceless (not API-accessible)', 'Included ✓'],
                    ] as [string, string, string][]).map(([action, xcost, dcost]) => (
                      <tr key={action}>
                        <td>{action}</td>
                        <td className="xclean-col-x">{xcost}</td>
                        <td className="xclean-col-deo">{dcost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="xclean-table-note">* Source: developer.x.com — Free $0 (write-only, 1,500 posts/mo), Basic $100/mo, Pro $5,000/mo, Enterprise from $42,000/mo. Each delete requires 1 read + 1 write from your quota.</p>
              </div>
            </div>

            {/* ── Cross-Wallet Verification ── */}
            <div className="xclean-wallet-section">
              <div className="xclean-wallet-title">🔄 ALREADY VERIFIED FOR ANOTHER SERVICE?</div>
              <p className="xclean-wallet-desc">
                Wallet verification is shared across all DEODRANT services. We check your on-chain balance — not your account. Already connected your wallet elsewhere? It carries over automatically.
              </p>
              <div className="xclean-tier-rows">
                {([
                  ['Call Centre verified (420,000 hold)', 'approved', '✓ X CLEANUP: APPROVED'],
                  ['Leads Generator verified (50,000 hold)', 'partial', '→ HOLD 370,000 MORE — or BURN 37,000'],
                  ['No previous verification', 'none', '→ HOLD 420,000 or BURN 42,000'],
                ] as [string, string, string][]).map(([label, status, tag]) => (
                  <div key={label} className="xclean-tier-row">
                    <span className="xclean-tier-label">{label}</span>
                    <span className={`xclean-tier-tag xclean-tier-tag--${status}`}>{tag}</span>
                  </div>
                ))}
              </div>
              <p className="xclean-wallet-footnote">If your existing tier has lower value, the system calculates the difference and tells you exactly how much to hold or burn to unlock access. No full re-verification needed.</p>
            </div>

            {!xLoggedIn ? (
              <>
                <p className="xclean-hint">Connect your X account to get started.</p>
                <button
                  className="xclean-login-btn"
                  disabled={!X_API_CONFIGURED}
                  onClick={() => X_API_CONFIGURED && setXLoggedIn(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.054 2.25H8.08l4.26 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  {X_API_CONFIGURED ? "SIGN IN WITH X" : "SIGN IN WITH X (COMING SOON)"}
                </button>
              </>
            ) : xDone ? (
              <div className="xclean-done">
                <div className="xclean-done-icon">✅</div>
                <p className="xclean-done-text">YOUR X IS SPOTLESS, SAAR.</p>
                <p className="modal-subtitle">Shiva is impressed. Jeets are confused.</p>
              </div>
            ) : (
              <>
                <p className="xclean-hint">Select what to obliterate:</p>
                <div className="xclean-options">
                  {X_CLEANUP_ITEMS.map(item => (
                    <label key={item.id} className="xclean-option">
                      <input
                        type="checkbox"
                        checked={xSelected.has(item.id)}
                        onChange={() => {
                          const next = new Set(xSelected);
                          next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                          setXSelected(next);
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  className="xclean-go-btn"
                  disabled={xCleaning || xSelected.size === 0}
                  onClick={() => {
                    setXCleaning(true);
                    // TODO: call X API here with Array.from(xSelected)
                    setTimeout(() => { setXCleaning(false); setXDone(true); }, 2500);
                  }}
                >
                  {xCleaning ? "SCRUBBING… 🧹" : "START CLEANUP"}
                </button>
              </>
            )}

            <p className="modal-disclaimer">Requires 42,000+ $DEODRANT. Jeets pay 100× more.</p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="comic-footer">
        <div className="footer-inner">
          <div className="footer-logo">$DEODRANT</div>
          <p className="footer-slogan">"If Jeets Can't buy, Jeets can't sell."</p>
          <p className="footer-copy">
            © 2026 DEODRANT Inc. — All Rights Reserved (to laugh at JEETS) but the situation in 🇦🇺🇺🇸🇬🇧🇨🇦 is no laughing matter. Buy DEODRANT and hold it in your phone as a matter of safety. Built on Solana. Feared by Shiva. Audited by Nobody.
          </p>
          <div className="footer-badges">
            <span className="fbadge">NOT AUDITED</span>
            <span className="fbadge">100% MEME</span>
            <span className="fbadge">SHIVA FEARED</span>
            <span className="fbadge">JEET FREE ZONE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
