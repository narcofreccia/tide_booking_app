RouteLLM
Routing to GPT-5
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
Server-side transcription architecture (backend-first)
Overview
Record audio in the app and upload it to your backend, which performs transcription with a high-accuracy cloud/on-prem model (e.g., Whisper large-v3, Google, or Azure), then routes the transcript to the PydanticAI agent for action. The app primarily displays status and confirmations.

Goals
Maximize transcription quality and consistency.
Centralize vocab boosting and model selection.
Maintain strong auditability (retain audio briefly).
Keep client simple and uniform across devices.
Components
React Native app:
Push-to-talk audio capture.
Secure upload (direct-to-storage or via backend).
Minimal UI for progress, status, and confirmation.
Backend services:
Upload handling (pre-signed URL issuance, integrity checks).
Transcription workers (GPU or cloud STT).
Agent service (PydanticAI) for intent parsing and tool execution.
Storage for audio (short-term), transcripts, parsed intents, and outcomes.
Notification/event system to update client when ready.
Flow
User interaction
Staff long-presses to record; app shows timer and VU meter.
Audio capture
Record at 16 kHz+ mono.
Prefer compressed formats (Opus in WebM/Ogg) to reduce bandwidth; or WAV if required by provider.
Secure upload
Request a pre-signed upload URL from backend: POST /uploads/init with metadata (codec, sample_rate, duration_estimate, locale, staff_id, venue_id).
Upload audio directly to object storage using the signed URL.
Notify backend upload completion: POST /uploads/complete with object key.
Backend transcription
Orchestrator enqueues a job with audio_url and metadata.
Transcription engine runs:
Whisper (self-host or OpenAI API) or Google/Azure Speech with Italian locale and phrase hints (names, areas, menu terms).
Produces transcript_text, confidence, word/segment timestamps, detected language.
Persist audio record (with retention policy) and transcript record.
Intent parsing and action
Pass transcript_text + context (venue_id, timezone, policies) to PydanticAI agent.
Agent extracts intent and fields, resolves temporal expressions (e.g., “stasera”), validates rules, and calls tools:
create_reservation / modify / cancel / query.
Persist parsing JSON, decisions, and outcome.
Client updates
Backend sends response back to the app:
If synchronous STT: return in the initial request flow.
If asynchronous (recommended): push/event when ready with a structured summary and actions.
App shows confirmation card with Undo/Edit; if missing fields, shows clarifying prompts.
Storage & retention
Audio in object storage with:
Server-side encryption, private ACL, per-tenant prefixing.
Lifecycle rule to delete after 14–30 days.
Keep transcripts and intent logs permanently (or per policy).
Access to raw audio gated by role-based permissions; audit every playback.
Pros
Highest accuracy and consistency across devices.
Easier to add custom phrase boosting and future model upgrades.
Strong audit trail with controlled retention.
Simpler client logic.
Cons
More bandwidth and slightly higher latency than on-device STT.
Requires GPU capacity or paid STT APIs.
Needs robust upload and retry logic for spotty networks.
Operational considerations
Latency targets:
Upload: 0.5–2s for 5–10s audio (Opus).
Transcription: 1–3s with GPU Whisper or cloud STT.
Total time-to-confirmation: typically 2–5s.
Queue management:
Prioritize short clips; add backpressure during peak hours.
Circuit-breaker to fail fast to human confirmation if STT stalls.
Quality controls:
Confidence thresholds; if low, ask staff to confirm highlighted fields.
Retain timestamps to align phrases with extracted entities for better debugging.
Compliance:
DPA with STT provider; document data flow in your privacy policy.
Allow venue-level opt-out of audio retention.