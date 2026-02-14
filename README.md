# 📋 BharatVani — Requirements Specification

<div align="center">

### भारत वाणी
**Voice-Powered Digital Access for 700 Million Indians**

*AI for Bharat Hackathon 2026 — Track: AI for Communities, Access & Public Impact*

[![AWS](https://img.shields.io/badge/Built%20on-AWS-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![Languages](https://img.shields.io/badge/Languages-22%2B%20Indian-blue?style=for-the-badge)](https://aws.amazon.com/transcribe/)
[![Users](https://img.shields.io/badge/Target%20Users-700M%2B-green?style=for-the-badge)](https://bharatvani.in)

</div>

---

## 1. Problem Statement

### 1.1 The Digital Divide in Numbers

India has achieved remarkable digital transformation — UPI processes 12 billion+ transactions monthly, DigiLocker hosts 600 crore+ documents, and UMANG offers 1,700+ government services. Yet this revolution has a critical blind spot:

> **700 million Indians — over 50% of the population — are completely excluded from digital services.**
>
> — *TRAI Telecom Subscription Data, 2025; IAMAI Digital Report*

These are not people who choose to stay offline. They are **structurally excluded** — by economics, infrastructure, literacy, and device limitations.

### 1.2 Root Cause Analysis

| Barrier | Scale | Why Current Solutions Fail |
|---|---|---|
| **Device Gap** | 700M own only basic feature phones (₹500-2000) | Apps require smartphones (₹6,000+) |
| **Connectivity Gap** | 350M+ lack reliable internet | Websites require data plans (₹200+/month) |
| **Literacy Gap** | 260M adults are not fully literate | All digital services require reading/typing |
| **Language Gap** | 500M+ don't understand English | Most apps/sites default to English |
| **Age/Disability Gap** | 140M elderly + 26M visually impaired | Touchscreens are inaccessible |

**The compound effect:** A farmer in Bihar who owns a ₹500 phone, speaks only Hindi, and has limited literacy faces **ALL FIVE barriers simultaneously.** No existing solution addresses this.

### 1.3 The Human Cost

> **Ramesh, 55, farmer, Madhubani district, Bihar**
>
> Ramesh is eligible for PM-KISAN (₹6,000/year), Soil Health Card, crop insurance under PM-FBY, and subsidized fertilizer. Combined value: **₹25,000+/year.** He receives none of it — because he cannot access the portals, fill online forms, or check his eligibility. To make one enquiry, he travels 8 km to the nearest CSC center, waits 2+ hours, and loses ₹400 in wages. He has done this three times. Each time, the CSC operator told him to "come back with different documents."
>
> **Ramesh has a phone. He just needs someone to answer it.**

### 1.4 The Untapped Interface

While internet access remains limited, **voice connectivity is near-universal in India:**

```
📱 Total mobile subscribers:        1.15 Billion (TRAI, 2025)
📞 2G/voice-capable coverage:       99% of population
🌐 Smartphone penetration:          ~45% (leaves 55% on feature phones)
📶 Broadband subscribers:           ~900 Million
❌ Population without internet:      ~350-700 Million
```

**The insight:** India doesn't have a connectivity problem — it has an **interface problem.** The network is there. The phone is there. The services exist. What's missing is a bridge that works without screens, apps, or internet.

**BharatVani is that bridge.**

---

## 2. Proposed Solution

### 2.1 What is BharatVani?

**BharatVani (भारत वाणी — "Voice of India")** is a **toll-free AI-powered voice service** that converts any phone call into a gateway to digital India.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   User dials toll-free number from ANY phone                 │
│                          ↓                                   │
│   AI greets them in their language                           │
│                          ↓                                   │
│   User asks anything — naturally, in their own words         │
│     "PM-KISAN ke baare mein batao"                           │
│     "Kal mausam kaisa rahega?"                               │
│     "Mujhe phone case order karna hai"                       │
│                          ↓                                   │
│   AI understands → processes → responds in natural voice     │
│                          ↓                                   │
│   SMS confirmation sent (if transaction)                     │
│                                                              │
│   ✅ No smartphone    ✅ No internet    ✅ No literacy       │
│   ✅ No app download  ✅ No cost        ✅ Any language      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Key Capabilities

| # | Capability | What It Does | Example Query |
|---|---|---|---|
| 1 | **General Knowledge** | Answers any publicly available question via AI | "Bharat ki aabadi kitni hai?" |
| 2 | **Government Schemes** | Explains eligibility, benefits, application steps for 30+ schemes | "Ayushman Bharat mein kya milta hai?" |
| 3 | **Agricultural Advisory** | Mandi prices, weather, crop tips | "Aaj gehun ka rate kya hai Delhi mein?" |
| 4 | **Voice Commerce** | Browse, select, and order products via voice | "Mujhe Samsung ka cover chahiye" |
| 5 | **Service Booking** | Book tickets, appointments through voice | "Patna se Delhi train book karo" |
| 6 | **Multilingual AI** | Auto-detects and responds in 22+ Indian languages | Speaks in Hindi, Tamil, Telugu, Bengali, etc. |
| 7 | **OTP Verification** | Secure transactions via voice-spoken OTP | "OTP bataiye: 4-8-3-2" |

---

## 3. Functional Requirements

### 3.1 Voice Communication System

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-01 | Accept incoming calls from any phone via toll-free number | **P0** | Feature phone, smartphone, and landline can connect |
| FR-02 | Real-time speech-to-text conversion | **P0** | Latency < 2 seconds for transcription |
| FR-03 | Auto-detect user's language from speech | **P0** | Correctly identifies Hindi, English, Tamil, Telugu, Bengali, Marathi |
| FR-04 | Generate natural voice responses in detected language | **P0** | Uses neural TTS voices, natural prosody |
| FR-05 | Maintain multi-turn conversation context | **P0** | Remembers previous exchanges within a session |
| FR-06 | Support Hindi-English code-mixing | **P0** | Understands mixed-language queries naturally |
| FR-07 | Handle noisy audio and unclear speech | **P1** | Prompts user to repeat instead of failing silently |
| FR-08 | Support DTMF fallback (keypad input) | **P2** | Users can press 1, 2, 3 for menu options |

### 3.2 AI & Knowledge Engine

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-09 | Answer general knowledge questions using AI | **P0** | Responds accurately to open-domain questions |
| FR-10 | Provide information on 30+ government schemes | **P0** | Correct details on eligibility, benefits, documents, application process |
| FR-11 | Check user eligibility for schemes conversationally | **P1** | Asks relevant questions, determines eligibility |
| FR-12 | Provide crop/mandi prices by region | **P1** | Returns current prices for major crops in major mandis |
| FR-13 | Provide weather forecasts by district | **P1** | Returns next-day forecast with farming advisory |
| FR-14 | Keep responses concise (≤ 30 words per turn) | **P0** | All responses optimized for voice delivery |
| FR-15 | Support follow-up questions in context | **P0** | "Iske liye documents kya chahiye?" works after scheme query |

### 3.3 Transactional Services

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-16 | Voice-based product browsing and ordering | **P0** | User can search, select, and order via conversation |
| FR-17 | OTP verification before any transaction | **P0** | 4-digit OTP via SMS, spoken back by user |
| FR-18 | SMS confirmation after successful transactions | **P0** | SMS within 10 seconds with order details |
| FR-19 | Order tracking via voice | **P1** | User can ask "Mera order kahan hai?" |
| FR-20 | Service booking (train, appointment) | **P2** | End-to-end booking with confirmation |

### 3.4 Session Management

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-21 | Unique session per call with conversation history | **P0** | Full context maintained throughout call |
| FR-22 | Returning user recognition by phone number | **P1** | Greets with "Welcome back" for known users |
| FR-23 | Persist language preference across sessions | **P1** | Skips language detection for returning users |
| FR-24 | Auto-terminate idle sessions after 30 seconds | **P0** | Polite prompt after 30s, disconnect after 60s silence |
| FR-25 | Session analytics logging | **P1** | Intent, duration, outcome logged for each session |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target | Measurement |
|---|---|---|---|
| NFR-01 | End-to-end response latency | **< 3 seconds** | User finishes speaking → AI starts responding |
| NFR-02 | Call connection time | **< 2 seconds** | Dial → first ring |
| NFR-03 | OTP SMS delivery | **< 5 seconds** | OTP generated → SMS received |
| NFR-04 | Speech recognition accuracy | **> 90%** (clean audio) | Measured on Indian-accented test set |
| NFR-05 | Concurrent call capacity | **1,000+ calls** | Auto-scales with demand |

### 4.2 Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-06 | System uptime | 99.9% (< 8.7 hours downtime/year) |
| NFR-07 | Graceful degradation on component failure | Cached fallback responses available |
| NFR-08 | Zero technical jargon in user-facing errors | No "error", "timeout", "exception" messages |
| NFR-09 | Automatic retry on transient failures | 1 retry with exponential backoff |

### 4.3 Security & Privacy

| ID | Requirement | Target |
|---|---|---|
| NFR-10 | OTP-based verification for all transactions | 4-digit, 5-min expiry, max 3 attempts |
| NFR-11 | Caller identity via phone number (Caller ID) | Validated by Amazon Connect |
| NFR-12 | No persistent storage of sensitive data | Aadhaar, bank details never stored |
| NFR-13 | Conversation data auto-deletion | TTL-based cleanup within 24 hours |
| NFR-14 | IAM least-privilege between all AWS services | Each Lambda has scoped permissions |
| NFR-15 | Encryption at rest and in transit | AWS-managed encryption (AES-256, TLS 1.2+) |

### 4.4 Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-16 | 100% serverless architecture | Zero capacity planning required |
| NFR-17 | Linear cost scaling | Cost grows proportionally to usage |
| NFR-18 | Add new service modules without system changes | Plugin architecture, < 2 hours per module |
| NFR-19 | Multi-region deployment support | Architecture supports any AWS region |

### 4.5 Accessibility — The Core Requirement

| ID | Requirement | Target | Why This Matters |
|---|---|---|---|
| NFR-20 | Works on any feature phone (₹500+) | Voice calls only | 700M users have these phones |
| NFR-21 | Works on 2G networks | Voice channel only | 2G covers 99% of India |
| NFR-22 | Zero cost to end user | Toll-free number | No financial barrier |
| NFR-23 | No internet/data needed | Operates over voice + SMS | No connectivity barrier |
| NFR-24 | No reading/writing ability needed | 100% voice-based interaction | No literacy barrier |
| NFR-25 | No prior training needed | Natural conversation | No learning curve |

---

## 5. Technology Stack — Fully AWS Native

| Layer | AWS Service | Role | Why This Service |
|---|---|---|---|
| **Call Handling** | Amazon Connect | Toll-free IVR, call routing | Purpose-built contact center, auto-scales to millions |
| **Speech → Text** | Amazon Transcribe | Real-time STT in 22 Indian languages | Best-in-class Indian language support, streaming mode |
| **AI Brain** | Amazon Bedrock (Claude 3.5 Sonnet) | Intent detection, response generation, knowledge | Managed LLM, no infrastructure, multi-language |
| **Text → Speech** | Amazon Polly | Neural TTS with Indian voices | Natural-sounding Hindi (Aditi), SSML support |
| **Business Logic** | AWS Lambda | Orchestrator, router, service modules | Serverless, pay-per-use, auto-scales |
| **Database** | Amazon DynamoDB | Sessions, users, orders, cache | Single-digit ms latency, serverless, TTL |
| **Knowledge Store** | Amazon S3 | Government schemes, agriculture data | Durable, cheap, integrates with Bedrock for RAG |
| **Notifications** | Amazon SNS | OTP and confirmation SMS | Reliable pan-India SMS delivery |
| **Monitoring** | Amazon CloudWatch | Logs, metrics, alarms | Full operational visibility |
| **Security** | AWS IAM | Service-to-service auth | Least-privilege policy enforcement |

**Total AWS services used: 10** — deep, purposeful integration across the AWS ecosystem.

---

## 6. Target Users & Personas

### 6.1 Primary Audience — 700M Feature Phone Users

```
 👨‍🌾 FARMERS (300M+)                    🏪 SMALL SHOPKEEPERS (100M+)
 Need: Crop prices, weather,            Need: Wholesale orders,
       govt schemes, subsidies                 GST info, bank services

 👷 DAILY WAGE WORKERS (150M+)          👵 ELDERLY CITIZENS (140M+)
 Need: Job listings, skill training,    Need: Pension status, health info,
       wage info, MGNREGA status               govt scheme updates

 🧑‍🦯 VISUALLY IMPAIRED (26M+)           🏠 HOMEMAKERS (100M+)
 Need: Complete digital access          Need: Ration card, LPG subsidy,
       via voice-only interface                education schemes for children
```

### 6.2 User Persona Deep Dive

> **Lakshmi, 62, homemaker, Madurai, Tamil Nadu**
>
> - Phone: Nokia 105 (₹1,199)
> - Languages: Tamil, basic Hindi
> - Digital literacy: Zero
> - Needs: Ujjwala Yojana (free LPG), Ration card renewal, grandson's scholarship status
> - **Today:** Depends entirely on her grandson to check anything online. He works in Chennai and visits monthly.
> - **With BharatVani:** Calls toll-free, speaks in Tamil, gets all information herself. Independent.

---

## 7. Impact Assessment

### 7.1 Social Impact

| Impact Area | Metric | Scale |
|---|---|---|
| **Digital Inclusion** | People gaining first-ever digital access | **700 million** |
| **Financial Access** | Government scheme value made accessible | **₹10 lakh crore/year** |
| **Time Saved** | Hours saved per person per year (no travel/queue) | **20+ hours** |
| **Cost Saved** | National savings from reduced physical visits | **₹5,000 crore/year** |
| **Economic Empowerment** | New market access for rural businesses | **50 million** |

### 7.2 UN Sustainable Development Goals Alignment

| SDG | How BharatVani Contributes |
|---|---|
| **SDG 1:** No Poverty | Direct access to financial inclusion schemes |
| **SDG 2:** Zero Hunger | Crop advisory, mandi prices, agricultural schemes |
| **SDG 4:** Quality Education | Access to scholarship and skill training information |
| **SDG 8:** Decent Work | Voice access to job listings and MGNREGA |
| **SDG 9:** Industry & Innovation | Novel voice-AI infrastructure for inclusion |
| **SDG 10:** Reduced Inequalities | Bridges the digital divide for 700M excluded citizens |
| **SDG 16:** Peace & Justice | Access to government services and citizen rights |

### 7.3 Government Mission Alignment

| National Mission | BharatVani's Contribution |
|---|---|
| **Digital India** | Extends digital access to the last 700M citizens |
| **BharatNet** | Complements fiber — voice works even where BharatNet hasn't reached |
| **PM-KISAN / DBT** | Farmers can check eligibility, status, and apply via voice |
| **Ayushman Bharat** | Health scheme information accessible to all |
| **Skill India** | Vocational training info via voice |
| **Accessible India** | Complete digital access for persons with disabilities |

---

## 8. Success Criteria

### 8.1 Hackathon Demo

| # | Criteria | Target | Verification |
|---|---|---|---|
| 1 | Live call from feature phone | Connects and AI responds in < 3s | Live demo |
| 2 | Government scheme Q&A | Accurate answers for 3+ schemes | Judge verification |
| 3 | End-to-end transaction | Order placed with OTP + SMS confirmation | Live demo |
| 4 | Multilingual response | Hindi + English demonstrated | Live demo |
| 5 | Open-domain question | AI answers judges' random questions | Interactive "Ask Anything" |

### 8.2 Post-Hackathon Milestones (6-Month Roadmap)

| Quarter | Milestone | Metric |
|---|---|---|
| **Month 1-2** | Pilot launch in 1 district (Bihar/UP) | 1,000 active users |
| **Month 3-4** | Expand to 3 states, 6 languages | 50,000 active users |
| **Month 5-6** | Government partnership + media launch | 5,00,000 active users |
| **Year 1** | Pan-India rollout | 1 crore+ active users |

---

## 9. Constraints & Assumptions

### Constraints

| # | Constraint | Mitigation |
|---|---|---|
| 1 | 48-hour hackathon development window | Prioritized MVP scope, mock data for demo |
| 2 | AWS-only technology stack (hackathon rule) | Architecture designed 100% on AWS |
| 3 | Toll-free number requires telecom partnership | Simulated via Amazon Connect for demo |
| 4 | Bedrock latency for real-time conversation | Response caching + prompt optimization |

### Assumptions

| # | Assumption | Basis |
|---|---|---|
| 1 | Users can make voice calls (2G minimum) | 99% of India has 2G coverage (TRAI) |
| 2 | Users can receive SMS | SMS works on all mobile phones |
| 3 | Bedrock supports Hindi with acceptable accuracy | Validated through testing |
| 4 | Amazon Transcribe handles Indian accents/dialects | AWS-documented support for 22 Indian languages |
| 5 | AWS hackathon credits are available | Standard hackathon provision |

---

<div align="center">

### BharatVani — The Internet, Spoken.

*Built with ❤️ for 700 million Indians who deserve digital access.*

**Team BharatVani** | AI for Bharat Hackathon 2026

</div>
