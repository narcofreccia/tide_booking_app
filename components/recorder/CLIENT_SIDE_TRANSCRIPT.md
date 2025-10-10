Client-side transcription architecture (React Native first)
Overview
Transcribe speech on-device or via native OS APIs inside the React Native app, then send only text (plus minimal metadata) to your backend for intent parsing and booking actions. Optionally upload the raw audio when confidence is low or for audit.

Goals
Minimize bandwidth and latency.
Keep API keys off the device.
Provide immediate feedback to staff with partial transcripts.
Preserve reliability via conditional audio upload and short-term retention.
Components
React Native app:
Audio capture and push-to-talk UX (press-and-hold).
On-device or OS speech-to-text (STT).
Confidence/quality heuristics.
Optional audio upload for recheck/audit.
Submission of transcript and context to backend.
Backend APIs:
Text-intent endpoint (accepts transcript, locale, timezone, staff/venue IDs).
Optional audio intake endpoint (signed upload, storage, async recheck).
Agent service (PydanticAI) for parsing and tool execution.
Storage for transcripts, parsed intents, and short-term audio references.
Flow
User interaction
Staff long-presses “Speak to book”.
Visual state: recording indicator; waveform/noise hint.
Recording + transcription on device
Start audio capture.
Start STT using native iOS/Android (via react-native-voice) or an on-device engine.
Display partial transcripts in real time.
On release, finalize transcript and capture:
transcript_text
locale (e.g., it-IT)
approximate confidence or proxy signals (stability of partials, duration, background noise).
Local validation and heuristics
Detect critical tokens: numbers, times, names.
If missing essential fields (party size, time), prompt the user or let the backend ask later.
If confidence below threshold or noisy environment detected, mark as needs_server_recheck = true.
Submit to backend (fast path)
POST to /voice-intents with:
transcript_text, locale, timezone, staff_id, venue_id
stt_mode = "on_device"
quality flags (confidence proxy, duration, noise)
Immediate backend response:
Parsed intent, required clarifications, or booking confirmation.
Optional audio handling
If needs_server_recheck:
Upload audio file to backend (or to object storage via signed URL).
Receive audio_url; associate with the transcript record.
Backend asynchronously runs high-accuracy STT (Whisper/Google/Azure).
If material difference is detected (e.g., time or numbers changed), backend sends a push/event:
“Improved transcription available: ‘20:30’ → ‘20:00’. Tap to apply and re-run.”
Staff can accept correction, which triggers backend to re-run the agent.
Storage & retention
Backend stores:
Transcript text, metadata, parsing result, agent decision trail.
Audio URL only if uploaded; lifecycle auto-delete after 14–30 days.
App stores nothing long-term; clears local cache after successful upload.
Pros
Immediate feedback; minimal bandwidth.
Keys remain server-side.
Flexible fallback to server accuracy only when needed.
Better UX in spotty network conditions.
Cons
On-device/OS STT accuracy varies; might require rechecks on busy nights.
Complexity: hybrid logic and “material change” reconciliation.
Operational considerations
Locale handling: default per venue; allow quick switch if staff mixes languages.
Accessibility: vibrate/tones for start/stop recording in noisy environments.
Privacy: show a brief notice during onboarding about temporary voice processing.
Monitoring: track on-device vs server recheck rates, correction acceptance rate, and first-pass success.