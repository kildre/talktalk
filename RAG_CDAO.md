# TalkTalk / TalkBack as a RAG Solution for CDAO

## Overview

The TalkTalk + TalkBack stack is a full-stack AI chat platform composed of a React/TypeScript frontend and a Python FastAPI backend with native AWS Bedrock integration. As-is, the system already has the core scaffolding required to deliver a **Retrieval-Augmented Generation (RAG)** solution for the Chief Data and AI Office (CDAO). This document explains how each layer maps to a RAG architecture and what targeted changes would evolve the prototype into a production-grade CDAO tool.

---

## What RAG Is (and Why CDAO Needs It)

Retrieval-Augmented Generation grounds an LLM's responses in a curated, authoritative document corpus before generating an answer. Instead of relying solely on a model's training data, the system:

1. **Retrieves** semantically relevant chunks from an indexed knowledge base when a query arrives.
2. **Augments** the prompt sent to the LLM with those chunks as context.
3. **Generates** a response that is both fluent and grounded in verified source material.

For CDAO this matters because:

- Policy documents, directives, and data strategies change frequently and cannot be baked into model weights.
- Responses must be traceable back to authoritative sources (auditability, attribution).
- Users may ask questions that span multiple policy memos, data standards, or acquisition regulations simultaneously.
- Hallucination risk on sensitive government decisions is unacceptable.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      TalkTalk (UI)                          │
│  React + TypeScript + MUI                                    │
│  • Login / Register (JWT)                                   │
│  • Conversation sidebar with history                         │
│  • Message bubbles, image attachment, TTS                   │
│  • Streams responses via REST → sendChatMessage()           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────┐
│                     TalkBack API                             │
│  Python FastAPI + SQLAlchemy + SQLite                        │
│  • JWT auth  • /chat  • /applicants  • /cases               │
│  • AWS Bedrock client (InvokeModel, RetrieveAndGenerate)    │
│  • Optional: AWS_BEDROCK_KNOWLEDGE_BASE_ID                   │                        
└──────────────────────────┬──────────────────────────────────┘
                           │ AWS SDK
┌──────────────────────────▼──────────────────────────────────┐
│                    AWS Bedrock                               │
│  • Foundation Models (Claude 3 Sonnet / Haiku)              │
│  • Bedrock Knowledge Bases (managed RAG)                    │
│  • Amazon OpenSearch Serverless (vector store)              │
└─────────────────────────────────────────────────────────────┘
```

The critical line in [AWS_BEDROCK_SETUP.md](AWS_BEDROCK_SETUP.md):

```env
AWS_BEDROCK_KNOWLEDGE_BASE_ID=YOUR_KB_ID
```

means the backend already calls `bedrock-agent-runtime:RetrieveAndGenerate` when a Knowledge Base ID is present. The RAG plumbing exists; it just needs a populated knowledge base and CDAO-specific configuration.

---

## RAG Data Flow (Detailed)

```
User types question
        │
        ▼
TalkTalk UI  ──POST /chat/messages──►  TalkBack API
                                            │
                                    1. Embed query
                                            │
                                    2. Retrieve top-K chunks
                                       from Bedrock KB
                                            │
                                    3. Build augmented prompt
                                       (system + chunks + query)
                                            │
                                    4. InvokeModel → Claude
                                            │
                                    5. Return response +
                                       source citations
                                            │
        ◄────────── JSON response ──────────┘
        │
TalkTalk renders answer
+ clickable source references
```

---

## How Each Layer Maps to CDAO Needs

### 1. Knowledge Base (Data Layer)

AWS Bedrock Knowledge Bases ingest and chunk documents automatically. For CDAO the corpus would include:

| Source Type | Examples |
|---|---|
| Strategy documents | DoD Data Strategy, CDAO AI Roadmap |
| Policy & directives | DoDI 5000.02, AI Ethics Principles |
| Data standards | NIEM, DoD Data Catalog schemas |
| Acquisition guidance | FAR/DFARS AI clauses |
| Technical references | Platform One docs, Zero Trust framework |

Documents are uploaded to S3 → Bedrock ingests, chunks, and embeds them → vectors stored in Amazon OpenSearch Serverless. No custom embedding pipeline required.

### 2. Backend (Orchestration Layer)

The TalkBack API's `/chat` router already holds the Bedrock client. Changes needed to fully enable RAG:

- **Enable `RetrieveAndGenerate`**: When `AWS_BEDROCK_KNOWLEDGE_BASE_ID` is set, route through `bedrock-agent-runtime` instead of bare `InvokeModel`. This is already gated in the config.
- **Return citations**: The `RetrieveAndGenerate` response includes source URIs and page numbers. Expose these in the chat response JSON so the frontend can render them.
- **System prompt tuning**: Add a CDAO-specific system prompt that instructs the model to only answer from retrieved context, cite sources, and refuse to speculate beyond what the documents contain.
- **Role-based filtering**: The existing JWT auth and `users` model can gate which knowledge base namespaces a user queries (e.g., SIPRNet-only documents for cleared users vs. unclassified corpus for all staff).

### 3. Frontend (Presentation Layer)

The TalkTalk UI needs minimal changes to surface RAG outputs:

- **Source citations panel**: Render the source URIs returned by Bedrock as expandable footnotes beneath each assistant message (extend the `MessageBubble` component).
- **Confidence / relevance scores**: Optionally surface the retrieval scores so analysts can assess how well-grounded an answer is.
- **Document upload**: The existing image-attachment flow in `ChatInput` can be extended to accept PDF/DOCX for ad-hoc document Q&A (Bedrock supports inline document context via the Messages API).
- **Conversation history**: The sidebar already manages multi-turn conversations; no change needed for multi-hop RAG queries that reference prior context.

---

## CDAO-Specific Use Cases

### Policy Navigator
> "What does DoDI 8310.01 say about data tagging requirements for AI training sets?"

The system retrieves the relevant directive sections, quotes them verbatim, and links back to the source document — eliminating the need for analysts to manually search SharePoint or MAX.gov.

### Acquisition Intelligence
> "Are there any DFARS clauses that apply when procuring a commercial AI product that processes CUI?"

Grounded in the current FAR/DFARS corpus updated in the knowledge base, the model synthesizes cross-clause guidance with citations.

### Data Governance Q&A
> "Which data domains in the DoD Data Catalog are still missing approved data stewards?"

If structured data (JSON/CSV exports from the catalog) is ingested alongside prose documents, the model can answer factual inventory questions.

### Onboarding Assistant
> "I'm a new GS-13 data scientist joining CDAO. What tools and platforms do I have access to?"

The knowledge base includes onboarding guides, IT provisioning SOPs, and platform docs. The assistant synthesizes a personalized checklist.

---

## Security and Compliance Considerations

| Concern | Mitigation in This Stack |
|---|---|
| Data residency | Bedrock operates within the AWS GovCloud (US) region; configure `AWS_DEFAULT_REGION=us-gov-east-1` |
| PII in chat logs | The `applicants` model already tracks SSN and DOB — extend the API to mask or redact PII before logging |
| Network isolation | Deploy TalkBack in a VPC with a Bedrock VPC endpoint; no traffic leaves the boundary |
| Access control | JWT roles map to Bedrock knowledge base namespaces; add DoD CAC/PKI via OIDC (OIDC config already stubbed in `.env`) |
| Audit trail | Every chat message is persisted in the `messages` table with `chat_id`, `user_id`, and timestamp — meets audit log requirements |
| Classification | For CUI/SECRET, deploy a separate stack in IL4/IL5-compliant AWS environment; one knowledge base per classification level |

---

## Gaps to Close Before Production

1. **Populate the knowledge base** — Upload and sync the authoritative CDAO document corpus to S3 and trigger a Bedrock ingestion job.
2. **Activate `RetrieveAndGenerate`** — Set `AWS_BEDROCK_KNOWLEDGE_BASE_ID` and verify the chat router uses `bedrock-agent-runtime` instead of `bedrock-runtime`.
3. **Surface citations in the UI** — Extend the `MessageBubble` component to render source links.
4. **Replace SQLite** — Swap for PostgreSQL (Aurora Serverless) for multi-user production load. The Alembic migration scaffold is already in place.
5. **Harden auth** — Wire the OIDC config stub to an existing DoD IdP (e.g., Okta, PingFederate, or CAC-based auth).
6. **Incremental KB sync** — Set up an S3 event notification → Lambda → Bedrock ingestion job to keep the knowledge base current as new policy documents are published.
7. **Observability** — Add structured logging (AWS CloudWatch) and Bedrock model invocation metrics to satisfy FedRAMP audit requirements.

---

## Summary

TalkTalk + TalkBack is not just a chat prototype — it is a deployable RAG skeleton. The AWS Bedrock Knowledge Base integration is already wired in the backend configuration; a populated document corpus and a few targeted code changes are all that stand between this codebase and a production CDAO policy assistant. The frontend's multi-turn conversation history, image/document attachment capability, TTS support, and JWT-protected user model give CDAO a head start that a greenfield build would take months to replicate.
