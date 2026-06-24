#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║          DEODRANT BOT — AI Outbound Spam Caller             ║
║          github.com/DEODRANT24/DEO                          ║
╚══════════════════════════════════════════════════════════════╝

Full call stack:
  Twilio dials lead → lead answers → Twilio transcribes speech →
  Claude (as Rajesh) generates response → ElevenLabs voices it →
  Twilio plays audio back → repeat until sold or hung up on.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETUP (one time)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.  pip install twilio anthropic elevenlabs python-dotenv flask

2.  Create a .env file in the same folder as this script:

        TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
        TWILIO_AUTH_TOKEN=your_auth_token_here
        TWILIO_PHONE_NUMBER=+15551234567
        ANTHROPIC_API_KEY=sk-ant-api03-...
        ELEVENLABS_API_KEY=your_elevenlabs_key   # optional but recommended
        ELEVENLABS_VOICE_ID=                     # optional, leave blank for default
        LEADS_CSV=leads.csv
        PUBLIC_URL=https://xxxx.ngrok-free.app   # your ngrok URL (no trailing slash)
        PORT=5000
        MAX_TURNS=8
        CALL_DELAY=3

3.  Create your leads.csv in the same folder:
        name,phone,country_code,product
        John Smith,+447911123456,GB,Premium Amaze-On Membership
        Priya Patel,+14155551234,US,Amaze-On Fresh Delivery

4.  In a SECOND terminal, run: ngrok http 5000
    Copy the https://xxxx.ngrok-free.app URL into PUBLIC_URL in .env

5.  In Twilio Console → Phone Numbers → your number → Voice:
    Set "A call comes in" webhook to: https://xxxx.ngrok-free.app/voice

6.  Run this file: python deodrant_bot.py

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEGAL NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Outbound automated calling is regulated (TCPA in US, PECR in UK,
ACMA in AU, etc.). Only call numbers you have prior consent for.
This bot is provided for educational / parody purposes. You are
responsible for compliance in your jurisdiction.
"""

import os
import csv
import sys
import time
import uuid
import threading
import tempfile
from pathlib import Path

# ── Load .env before anything else ──────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠  python-dotenv not found. Run: pip install python-dotenv")
    sys.exit(1)

# ── Validate required env vars early ────────────────────────────────────────
REQUIRED = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "ANTHROPIC_API_KEY",
    "PUBLIC_URL",
]
missing = [k for k in REQUIRED if not os.environ.get(k)]
if missing:
    print(f"\n❌  Missing required environment variables: {', '.join(missing)}")
    print("    Check your .env file.\n")
    sys.exit(1)

# ── Import dependencies ──────────────────────────────────────────────────────
try:
    from flask import Flask, request, Response
except ImportError:
    print("❌  flask not installed. Run: pip install flask")
    sys.exit(1)

try:
    from twilio.rest import Client as TwilioClient
    from twilio.twiml.voice_response import VoiceResponse, Gather, Play, Hangup
except ImportError:
    print("❌  twilio not installed. Run: pip install twilio")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    print("❌  anthropic not installed. Run: pip install anthropic")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
TWILIO_SID       = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_TOKEN     = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_FROM      = os.environ["TWILIO_PHONE_NUMBER"]
ANTHROPIC_KEY    = os.environ["ANTHROPIC_API_KEY"]
ELEVENLABS_KEY   = os.environ.get("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "")
LEADS_CSV        = os.environ.get("LEADS_CSV", "leads.csv")
PUBLIC_URL       = os.environ["PUBLIC_URL"].rstrip("/")
PORT             = int(os.environ.get("PORT", "5000"))
MAX_TURNS        = int(os.environ.get("MAX_TURNS", "8"))
CALL_DELAY       = float(os.environ.get("CALL_DELAY", "3"))

# ── Clients ──────────────────────────────────────────────────────────────────
twilio_client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
claude_client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# ── Flask app ────────────────────────────────────────────────────────────────
app = Flask(__name__)

# ── In-memory call state: call_sid → {lead, history, turns} ─────────────────
calls: dict[str, dict] = {}
calls_lock = threading.Lock()

# ── Temp dir for ElevenLabs audio files ─────────────────────────────────────
AUDIO_DIR = Path(tempfile.gettempdir()) / "deodrant_audio"
AUDIO_DIR.mkdir(exist_ok=True)

# ════════════════════════════════════════════════════════════════════════════
#  RAJESH — Character & Prompt
# ════════════════════════════════════════════════════════════════════════════

RAJESH_SYSTEM = """You are Rajesh, a warm, enthusiastic, slightly over-the-top AI sales agent \
calling on behalf of Amaze-On. You speak with a polite Indian call-centre manner — use "saar" \
occasionally, be apologetic when interrupted, always persistent but never hostile.

Your job: engage the person who answered and pitch the product below.

Hard rules:
- Keep EVERY reply to 2–3 short sentences maximum. This is a phone call.
- Always end your turn with a question to keep them talking.
- If they say "not interested", apologise warmly, pivot to a new angle, try again.
- If they say "stop calling" or "don't call again" THREE times in a row, say a gracious goodbye and stop.
- Never break character. You are Rajesh. Always Rajesh.
- Never mention you are an AI unless the caller explicitly and directly asks "are you a robot?" or "are you AI?" — then admit it cheerfully and pivot back to the sale.

Product: {product}
Customer name: {name}
"""


def build_system(lead: dict) -> str:
    return RAJESH_SYSTEM.format(
        product=lead.get("product", "our amazing Amaze-On product, saar"),
        name=lead.get("name", "valued customer"),
    )


# ════════════════════════════════════════════════════════════════════════════
#  VOICE SYNTHESIS
# ════════════════════════════════════════════════════════════════════════════

def tts_elevenlabs(text: str) -> str | None:
    """
    Generate audio via ElevenLabs. Returns a public URL to the .mp3 file,
    or None if ElevenLabs is unavailable (bot falls back to Twilio Polly).
    """
    if not ELEVENLABS_KEY:
        return None
    try:
        from elevenlabs import ElevenLabs, VoiceSettings

        el = ElevenLabs(api_key=ELEVENLABS_KEY)
        voice_id = ELEVENLABS_VOICE or "21m00Tcm4TlvDq8ikWAM"  # default: Rachel

        audio_iter = el.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_turbo_v2",
            voice_settings=VoiceSettings(stability=0.45, similarity_boost=0.80),
        )

        filename = f"{uuid.uuid4().hex}.mp3"
        path = AUDIO_DIR / filename
        with open(path, "wb") as f:
            for chunk in audio_iter:
                if chunk:
                    f.write(chunk)

        return f"{PUBLIC_URL}/audio/{filename}"
    except Exception as exc:
        print(f"  [ElevenLabs] Error ({exc}) — falling back to Twilio Polly")
        return None


@app.route("/audio/<filename>")
def serve_audio(filename: str):
    """Serve ElevenLabs-generated audio files to Twilio."""
    path = AUDIO_DIR / filename
    if not path.exists() or not path.name.endswith(".mp3"):
        return "Not found", 404
    return Response(path.read_bytes(), mimetype="audio/mpeg",
                    headers={"Cache-Control": "no-cache"})


# ════════════════════════════════════════════════════════════════════════════
#  TWIML HELPERS
# ════════════════════════════════════════════════════════════════════════════

def twiml_speak_and_gather(text: str, call_sid: str) -> str:
    """
    Speak `text` (via ElevenLabs or Twilio Polly) then open a <Gather>
    to collect the caller's speech response.
    """
    resp = VoiceResponse()
    audio_url = tts_elevenlabs(text)

    gather = Gather(
        input="speech",
        action=f"{PUBLIC_URL}/gather?call_sid={call_sid}",
        method="POST",
        timeout=6,
        speech_timeout="auto",
        language="en-IN",
    )
    if audio_url:
        gather.play(audio_url)
    else:
        gather.say(text, voice="Polly.Aditi", language="en-IN")

    resp.append(gather)
    # No input: re-prompt once
    resp.redirect(f"{PUBLIC_URL}/no-input?call_sid={call_sid}", method="POST")
    return str(resp)


def twiml_speak_and_hangup(text: str) -> str:
    """Speak a farewell then hang up."""
    resp = VoiceResponse()
    audio_url = tts_elevenlabs(text)
    if audio_url:
        resp.play(audio_url)
    else:
        resp.say(text, voice="Polly.Aditi", language="en-IN")
    resp.hangup()
    return str(resp)


# ════════════════════════════════════════════════════════════════════════════
#  CLAUDE — Response generation
# ════════════════════════════════════════════════════════════════════════════

def rajesh_reply(state: dict) -> str:
    try:
        msg = claude_client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=120,
            system=build_system(state["lead"]),
            messages=state["history"],
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        print(f"  [Claude] Error: {exc}")
        return (
            "I am so very sorry saar, I am having a small technical difficulty. "
            "Please allow me just one moment, saar!"
        )


# ════════════════════════════════════════════════════════════════════════════
#  FLASK ROUTES — Twilio webhooks
# ════════════════════════════════════════════════════════════════════════════

@app.route("/voice", methods=["POST"])
def voice():
    """
    Twilio hits this URL when the outbound call is answered.
    We play Rajesh's opening line and start gathering speech.
    """
    call_sid = request.form.get("CallSid", "unknown")
    with calls_lock:
        state = calls.get(call_sid)

    if not state:
        # Unexpected call — hang up gracefully
        return Response(
            twiml_speak_and_hangup("Hello? I am so sorry, there seems to be a mistake. Goodbye, saar!"),
            mimetype="text/xml",
        )

    lead = state["lead"]
    name = lead.get("name", "saar")

    opening = (
        f"Hello! Am I speaking with {name}? "
        "This is Rajesh calling from Amaze-On. "
        "I have a very special offer just for you today, saar. "
        "Do you have just sixty seconds of your valuable time?"
    )

    with calls_lock:
        state["history"].append({"role": "assistant", "content": opening})

    print(f"  [{call_sid[:8]}] ✓ Answered — Rajesh opening.")
    return Response(twiml_speak_and_gather(opening, call_sid), mimetype="text/xml")


@app.route("/gather", methods=["POST"])
def gather():
    """
    Twilio posts the caller's transcribed speech here.
    We send it to Claude and return Rajesh's next line.
    """
    call_sid = request.args.get("call_sid") or request.form.get("CallSid", "")
    speech   = request.form.get("SpeechResult", "").strip()

    with calls_lock:
        state = calls.get(call_sid)

    if not state:
        return Response(
            twiml_speak_and_hangup("Sorry saar, something went wrong. Goodbye!"),
            mimetype="text/xml",
        )

    # Empty / inaudible speech
    if not speech:
        return Response(
            twiml_speak_and_gather(
                "Hello, saar? I cannot hear you very well. Are you still there?",
                call_sid,
            ),
            mimetype="text/xml",
        )

    print(f"  [{call_sid[:8]}] Caller : {speech}")

    with calls_lock:
        state["history"].append({"role": "user", "content": speech})
        state["turns"] += 1
        turns = state["turns"]

    # Max turns reached — graceful goodbye
    if turns >= MAX_TURNS:
        farewell = (
            "It has been such a pleasure speaking with you today, saar! "
            "I will follow up another time. "
            "Have a most wonderful day!"
        )
        return Response(twiml_speak_and_hangup(farewell), mimetype="text/xml")

    reply = rajesh_reply(state)
    print(f"  [{call_sid[:8]}] Rajesh : {reply}")

    with calls_lock:
        state["history"].append({"role": "assistant", "content": reply})

    return Response(twiml_speak_and_gather(reply, call_sid), mimetype="text/xml")


@app.route("/no-input", methods=["POST"])
def no_input():
    """Called when the caller says nothing within the timeout."""
    call_sid = request.args.get("call_sid") or request.form.get("CallSid", "")
    return Response(
        twiml_speak_and_gather(
            "Hello? Are you still there, saar? I am waiting patiently just for you!",
            call_sid,
        ),
        mimetype="text/xml",
    )


@app.route("/status", methods=["POST"])
def status():
    """Twilio posts call lifecycle events here."""
    call_sid   = request.form.get("CallSid", "")
    call_status = request.form.get("CallStatus", "")
    print(f"  [{call_sid[:8]}] Status → {call_status}")

    if call_status in ("completed", "failed", "busy", "no-answer", "canceled"):
        with calls_lock:
            calls.pop(call_sid, None)
        _cleanup_old_audio()

    return ("", 204)


@app.route("/healthz")
def healthz():
    return {"status": "rajesh is ready saar", "active_calls": len(calls)}


# ════════════════════════════════════════════════════════════════════════════
#  UTILITIES
# ════════════════════════════════════════════════════════════════════════════

def _cleanup_old_audio():
    """Delete audio files older than 1 hour."""
    cutoff = time.time() - 3600
    for f in AUDIO_DIR.glob("*.mp3"):
        try:
            if f.stat().st_mtime < cutoff:
                f.unlink()
        except Exception:
            pass


def load_leads(path: str) -> list[dict]:
    """
    Load leads from a CSV file.
    Expected columns: name, phone, country_code, product
    The `product` column is optional — falls back to a generic pitch.
    Phone numbers should be in E.164 format, e.g. +447911123456
    """
    leads = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=2):
            phone = (
                row.get("phone") or row.get("Phone") or
                row.get("number") or row.get("Number") or ""
            ).strip()
            if not phone:
                print(f"  ⚠  Row {i}: no phone number — skipped")
                continue
            leads.append({
                "name":    (row.get("name") or row.get("Name") or "valued customer").strip(),
                "phone":   phone,
                "product": (row.get("product") or row.get("Product") or
                            "our exclusive Amaze-On premium membership, saar").strip(),
            })
    return leads


def dial_lead(lead: dict):
    """Initiate an outbound call to a single lead via the Twilio REST API."""
    phone = lead["phone"]
    print(f"\n  📞 Dialling {lead['name']} → {phone}")
    try:
        call = twilio_client.calls.create(
            to=phone,
            from_=TWILIO_FROM,
            url=f"{PUBLIC_URL}/voice",
            status_callback=f"{PUBLIC_URL}/status",
            status_callback_method="POST",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )
        with calls_lock:
            calls[call.sid] = {
                "lead":    lead,
                "history": [],
                "turns":   0,
            }
        print(f"     ✓ SID: {call.sid}")
    except Exception as exc:
        print(f"     ✗ Failed: {exc}")


def run_dialler(leads: list[dict]):
    """Dial all leads sequentially with a configurable delay between calls."""
    print(f"\n{'─'*50}")
    print(f"  🤖 Rajesh is ready, saar! Dialling {len(leads)} leads...")
    print(f"{'─'*50}")

    for i, lead in enumerate(leads):
        dial_lead(lead)
        if i < len(leads) - 1:
            time.sleep(CALL_DELAY)

    print(f"\n{'─'*50}")
    print(f"  ✅ All {len(leads)} leads dialled, saar!")
    print(f"  (Server keeps running until all calls finish — Ctrl+C to stop)")
    print(f"{'─'*50}\n")


# ════════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║          DEODRANT BOT — AI Outbound Spam Caller             ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"  Public URL  : {PUBLIC_URL}")
    print(f"  Twilio from : {TWILIO_FROM}")
    print(f"  Leads file  : {LEADS_CSV}")
    print(f"  Max turns   : {MAX_TURNS}")
    print(f"  Call delay  : {CALL_DELAY}s")
    print(f"  Voice       : {'ElevenLabs (' + (ELEVENLABS_VOICE or 'default voice') + ')' if ELEVENLABS_KEY else 'Twilio Polly.Aditi (no ElevenLabs key set)'}")
    print()

    # Load leads
    try:
        leads = load_leads(LEADS_CSV)
    except FileNotFoundError:
        print(f"❌  Leads file not found: {LEADS_CSV}")
        print("    Create a CSV with columns: name,phone,country_code,product")
        print("    Example row: John Smith,+447911123456,GB,Amaze-On Premium")
        sys.exit(1)

    if not leads:
        print("❌  No valid leads found in CSV. Check phone number column.")
        sys.exit(1)

    print(f"  Loaded {len(leads)} leads from {LEADS_CSV}")
    print()

    # Start Flask in a daemon thread
    flask_thread = threading.Thread(
        target=lambda: app.run(
            host="0.0.0.0",
            port=PORT,
            debug=False,
            use_reloader=False,
        ),
        daemon=True,
        name="flask-server",
    )
    flask_thread.start()
    print(f"  Flask server listening on port {PORT}")
    print(f"  Webhook URL : {PUBLIC_URL}/voice")
    print()

    # Give Flask a moment to bind before Twilio tries to hit it
    time.sleep(1.5)

    # Start dialling in a daemon thread so Ctrl+C still works
    dial_thread = threading.Thread(
        target=run_dialler,
        args=(leads,),
        daemon=True,
        name="dialler",
    )
    dial_thread.start()

    # Keep the main thread alive (handles Ctrl+C cleanly)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n  ⛔ Bot stopped by user. Goodbye, saar!\n")
        sys.exit(0)
