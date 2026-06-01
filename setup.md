1. Introduction &amp; Orientation
This document is your complete build reference for BandForge — an AI-native IELTS
preparation platform built under MATA Labs OPC. You are responsible for three of the five core
product pillars: the MCQ/Objective Evaluation Core, the Subjective Evaluation Core (Writing and
Speaking), and the IELTS-mimicking UI/UX. The other two cores — the Mock Test Generator
and Marketing — are the founder&#39;s department and are not in scope here.
Read this document fully before writing a single line of code. Every architectural decision, every
table schema, every integration, and every definition of &#39;done&#39; is specified here. Where this
document specifies something, follow it. Where it does not, use your best judgement and flag it
in your weekly check-in.
1.1 What You Are Building
BandForge allows Telugu-speaking IELTS candidates to take full-length mock tests, receive
instant AI-generated feedback on Writing, and get scored evaluations on Speaking. The product
must feel indistinguishable from the real IELTS test interface in terms of timing, navigation, and
task sequencing. The quality of that simulation is the primary product differentiator.
1.2 Tech Stack
Layer Technology Notes
Frontend Next.js (React) — PWA Must be installable as a PWA on Android.

No native app.

Backend API FastAPI (Python) All business logic lives here.
Database Supabase (PostgreSQL + Auth

+ Storage)

Use Supabase Auth for phone OTP. Use
Supabase Storage for audio files.
AI Evaluation Anthropic API (Claude Sonnet) Writing evaluation and feedback. Prompt

library provided by founder.

Speech-to-Text OpenAI Whisper (self-hosted or

API)

Transcription of Speaking recordings
before evaluation.

Audio Storage Cloudflare R2 Speaking recordings. Cost-effective at

scale.

Async Jobs Celery + Redis Whisper transcription and AI evaluation
run async — not blocking the HTTP
response.

Payments Razorpay Already integrated. Do not touch the

payment flow.

SMS MSG91 Notify students when Speaking evaluation

is complete.

NOTE: Auth (phone OTP), Razorpay payment, and the dashboard shell are already built from Phase
1. Do not rebuild them. Your work begins at the test engine layer.
1.3 Repository Structure

BandForge · Product Dev Associate Build ManualMATA LABS OPC | Confidential

Version 1.0 · April 20263
Two repos under the MATA Labs GitHub organisation:
• bandforge-api — FastAPI backend. All evaluation logic, question serving, and async jobs
live here.
• bandforge-web — Next.js frontend. All UI screens live here.
Always branch off main, keep PRs small (one feature per PR), and tag the founder on any PR
that touches the database schema or payment flow.

## This repo layout

- **`frontend/`** — Next.js app (maps to future `bandforge-web` repo). All npm commands run here.
- **`backend/`** — FastAPI app (future `bandforge-api` repo), not scaffolded yet.

Within **frontend**:

- **`/`** — BandForge marketing landing (`components/bandforge/bandforge-landing.tsx`).
- **BandForge routes** — add under separate paths (e.g. `/login`, `/dashboard`, `/test/...`), not at `/`.