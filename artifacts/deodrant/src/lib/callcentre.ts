export const DEODRANT_CONTRACT_PLACEHOLDER = 'DeoD69xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJ';
export const DEODRANT_REQUIRED = 420;
export const PRICE_HOLDER = 4.20;
export const PRICE_STANDARD = 42.00;

export interface CCUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: number;
  walletAddress?: string;
  deodrantBalance?: number;
  deodrantVerifiedAt?: number;
}

export interface CCApiKeys {
  twilioSid: string;
  twilioToken: string;
  openaiKey: string;
}

export interface CCPhoneConfig {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  phoneNumber: string;
}

export interface CCDialogue {
  businessName: string;
  industry: string;
  businessHours: string;
  services: string;
  faqs: string;
  personality: 'professional' | 'friendly' | 'casual';
}

export interface CCCallLog {
  id: string;
  callerNumber: string;
  durationSec: number;
  transcript: string;
  timestamp: number;
}

export interface CCState {
  apiKeys?: CCApiKeys;
  phone?: CCPhoneConfig;
  dialogue?: CCDialogue;
  callLogs: CCCallLog[];
  onboardingStep: number;
}

const KEYS = {
  users: 'cc_users',
  session: 'cc_session',
  state: (id: string) => `cc_state_${id}`,
};

function getUsers(): Record<string, CCUser> {
  try { return JSON.parse(localStorage.getItem(KEYS.users) || '{}'); } catch { return {}; }
}

async function hashPw(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + 'deodrant_cc_v1_salt');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentSession(): string | null {
  return sessionStorage.getItem(KEYS.session);
}

export function getCurrentUser(): CCUser | null {
  const email = getCurrentSession();
  if (!email) return null;
  return getUsers()[email] ?? null;
}

export async function signUp(
  email: string, password: string, name: string
): Promise<{ ok: boolean; error?: string }> {
  const users = getUsers();
  if (users[email]) return { ok: false, error: 'That email is already registered.' };
  const user: CCUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash: await hashPw(password),
    name,
    createdAt: Date.now(),
  };
  localStorage.setItem(KEYS.users, JSON.stringify({ ...users, [email]: user }));
  sessionStorage.setItem(KEYS.session, email);
  return { ok: true };
}

export async function logIn(
  email: string, password: string
): Promise<{ ok: boolean; error?: string }> {
  const users = getUsers();
  const user = users[email];
  if (!user) return { ok: false, error: 'Email not found.' };
  if ((await hashPw(password)) !== user.passwordHash) return { ok: false, error: 'Incorrect password.' };
  sessionStorage.setItem(KEYS.session, email);
  return { ok: true };
}

export function logOut(): void {
  sessionStorage.removeItem(KEYS.session);
}

export function getCCState(userId: string): CCState {
  try {
    return JSON.parse(localStorage.getItem(KEYS.state(userId)) || 'null') ?? emptyState();
  } catch { return emptyState(); }
}

export function saveCCState(userId: string, state: CCState): void {
  localStorage.setItem(KEYS.state(userId), JSON.stringify(state));
}

export function updateCurrentUser(updates: Partial<CCUser>): void {
  const email = getCurrentSession();
  if (!email) return;
  const users = getUsers();
  if (!users[email]) return;
  localStorage.setItem(KEYS.users, JSON.stringify({ ...users, [email]: { ...users[email], ...updates } }));
}

export async function verifyDeodrantBalance(_wallet: string): Promise<number> {
  return 0;
}

function emptyState(): CCState {
  return { callLogs: [], onboardingStep: 0 };
}
