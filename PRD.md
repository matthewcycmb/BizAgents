# BizPilot - Product Requirements Document

## Vision
BizPilot enables local businesses to deploy an AI-powered customer service chatbot trained on their website content, with built-in lead capture capabilities.

## User Personas
1. **Business Owner** — Wants to automate customer inquiries and capture leads
2. **Customer** — Visits the chat widget to ask questions about the business

## Core User Flows

### Owner Flow
1. Sign up / Log in
2. Enter business name + website URL
3. System scrapes website, chunks content, generates embeddings
4. Owner sees dashboard with scrape status
5. Owner shares chat link with customers
6. Owner views captured leads on dashboard

### Customer Flow
1. Opens shared chat link (no auth required)
2. Asks questions about the business
3. Chatbot answers using RAG from scraped content
4. If buying intent detected, chatbot conversationally captures lead info
5. Lead saved to owner's dashboard

## Features (V1)
- Email/password auth
- Single business per owner
- Website scraping (up to 10 pages)
- RAG-powered chat with Claude
- Lead capture via Claude tool_use
- Owner dashboard with lead table
- Shareable public chat link

## Non-Goals (V1)
- Multi-business support
- Chat widget embed
- Real-time notifications
- Payment processing
- Custom branding
