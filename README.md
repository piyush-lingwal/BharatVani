# BharatVani — Project Requirements

> **Har Phone, Har Bhasha, Har Bharatiya**
> *(Every Phone, Every Language, Every Indian)*

---

## 1. Problem Statement

**India's digital revolution has left 700 million people behind.**

Despite massive growth in digital services — UPI, e-governance, e-commerce — a staggering 700 million Indians still cannot access them. They own basic feature phones with no internet, no apps, and no means to participate in Digital India.

### Who is excluded?

| Segment | Population | Barrier |
|---|---|---|
| Rural farmers & laborers | ~500M | No smartphone, no internet |
| Urban low-income workers | ~150M | Cannot afford data plans |
| Elderly & visually impaired | ~50M | Cannot use touchscreens/apps |

### What does exclusion look like?

A farmer in Bihar wants to check if he's eligible for PM-KISAN (₹6,000/year benefit). Today, he must:

1. Travel 5 km to the nearest CSC center → **₹50 transport cost**
2. Wait 2+ hours in queue → **lost half-day wages (₹200+)**
3. Hope the operator is available and helpful
4. Repeat if documents are missing

**Total cost of one query: ₹250+ and an entire day.**

This same farmer has a ₹500 phone in his pocket that can make voice calls — but no digital service speaks his language, on his device.

### The Gap

```
┌─────────────────────────────────┐
│     DIGITAL SERVICES            │
│  (Apps, Websites, Portals)      │
│                                 │
│  Require: Smartphone + Internet │
│           + Literacy + English  │
├─────────────────────────────────┤
│           THE GAP               │  ← BharatVani bridges this
├─────────────────────────────────┤
│     700 MILLION INDIANS         │
│                                 │
│  Have: Basic phone + Voice      │
│  Speak: Hindi, Tamil, Telugu... │
│  Need: Govt schemes, prices,   │
│        orders, information      │
└─────────────────────────────────┘
```

---

## 2. Proposed Solution

### BharatVani (भारत वाणी) — "Voice of India"

A **toll-free voice AI service** that lets any Indian access digital services by simply making a phone call — in their own language, on any phone, with zero internet.

### How It Works

```
User dials toll-free number
        ↓
AI greets in their language
        ↓
User speaks naturally
  "PM-KISAN ke bare mein batao"
        ↓
AI understands, processes, responds
  "PM-KISAN mein kisan ko saal mein
   ₹6000 milte hain, 3 installments mein..."
        ↓
User gets SMS confirmation (if applicable)
```

**One phone call replaces:** travel + queues + apps + internet + literacy.

### Key Capabilities

| Capability | Description | Example |
|---|---|---|
| **Information Access** | Answer any question from public knowledge | "Ayushman Bharat mein kya milta hai?" |
| **Government Schemes** | Explain eligibility, benefits, application process | "Kya main PM-KISAN ke liye eligible hoon?" |
| **Agricultural Advisory** | Crop prices, weather, farming tips | "Aaj tamatar ka rate kya hai?" |
| **Transactional Services** | Book, order, or register through voice | "Mujhe train ticket book karna hai" |
| **Multilingual Support** | Understand and respond in 22+ Indian languages | Works in Hindi, Tamil, Telugu, Bengali, etc. |

---

## 3. Functional Requirements

### 3.1 Voice Communication

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | System shall accept incoming calls from any phone (feature/smart) via toll-free number | **Must Have** |
| FR-02 | System shall convert user's speech to text in real-time | **Must Have** |
| FR-03 | System shall auto-detect the user's language from speech | **Must Have** |
| FR-04 | System shall generate natural voice responses in the detected language | **Must Have** |
| FR-05 | System shall maintain conversation context throughout the call | **Must Have** |
| FR-06 | System shall support Hindi-English code-mixing | **Must Have** |
| FR-07 | System shall handle background noise and unclear speech gracefully | **Should Have** |

### 3.2 AI & Knowledge

| ID | Requirement | Priority |
|---|---|---|
| FR-08 | System shall answer general knowledge questions from public information | **Must Have** |
| FR-09 | System shall provide detailed information on 30+ government schemes | **Must Have** |
| FR-10 | System shall check user eligibility for schemes based on conversational questions | **Should Have** |
| FR-11 | System shall provide current crop/mandi prices by region | **Should Have** |
| FR-12 | System shall provide weather forecasts by district | **Should Have** |
| FR-13 | System shall keep voice responses concise (under 30 words per turn) | **Must Have** |

### 3.3 Transactional Services

| ID | Requirement | Priority |
|---|---|---|
| FR-14 | System shall allow product browsing and ordering via voice | **Must Have** |
| FR-15 | System shall verify user identity via OTP before transactions | **Must Have** |
| FR-16 | System shall send SMS confirmation after successful transactions | **Must Have** |
| FR-17 | System shall allow order tracking via voice | **Should Have** |
| FR-18 | System shall support railway ticket booking (future phase) | **Could Have** |

### 3.4 Session & User Management

| ID | Requirement | Priority |
|---|---|---|
| FR-19 | System shall create and manage conversation sessions with unique IDs | **Must Have** |
| FR-20 | System shall identify returning users by phone number | **Should Have** |
| FR-21 | System shall remember user language preference across sessions | **Should Have** |
| FR-22 | System shall auto-terminate idle sessions after 5 minutes | **Must Have** |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Voice response latency (user speaks → AI responds) | < 3 seconds |
| NFR-02 | Call connection time | < 2 seconds |
| NFR-03 | OTP delivery time | < 5 seconds |
| NFR-04 | Speech recognition accuracy (clean audio) | > 90% |
| NFR-05 | Concurrent call capacity | 1,000+ (auto-scales) |

### 4.2 Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-06 | System uptime | 99.9% |
| NFR-07 | Graceful degradation on component failure | Required |
| NFR-08 | No technical jargon in error messages to users | Required |
| NFR-09 | Fallback to cached data when external APIs are down | Required |

### 4.3 Security

| ID | Requirement | Target |
|---|---|---|
| NFR-10 | OTP-based verification for all transactions | Required |
| NFR-11 | OTP expiry | 5 minutes |
| NFR-12 | Max OTP attempts per session | 3 |
| NFR-13 | No storage of sensitive data (Aadhaar numbers, etc.) | Required |
| NFR-14 | IAM least-privilege access between all services | Required |

### 4.4 Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-15 | Fully serverless architecture (zero capacity planning) | Required |
| NFR-16 | Linear cost scaling with usage | Required |
| NFR-17 | Support for adding new service modules without system changes | Required |

### 4.5 Accessibility

| ID | Requirement | Target |
|---|---|---|
| NFR-18 | Works on any phone (feature phone, smartphone, landline) | Required |
| NFR-19 | Works on 2G networks | Required |
| NFR-20 | Zero cost to end user (toll-free) | Required |
| NFR-21 | No internet/data required by user | Required |
| NFR-22 | No literacy/reading ability required | Required |

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Call Handling | Amazon Connect | Toll-free IVR, call routing, audio streaming |
| Speech-to-Text | Amazon Transcribe | Real-time voice → text in 22 Indian languages |
| AI Engine | Amazon Bedrock (Claude 3.5 Sonnet) | Intent detection, response generation, knowledge Q&A |
| Text-to-Speech | Amazon Polly | Natural voice responses with neural Indian voices |
| Business Logic | AWS Lambda | Serverless orchestration, routing, and service modules |
| Database | Amazon DynamoDB | Sessions, users, orders, cached data |
| Knowledge Store | Amazon S3 | Government schemes, agriculture data, FAQs |
| Notifications | Amazon SNS | OTP delivery, transaction confirmations via SMS |
| Monitoring | Amazon CloudWatch | Logs, metrics, alarms |
| Security | AWS IAM | Service-to-service authentication and authorization |

---

## 6. Target Users

### Primary Users (700M+)

```
👨‍🌾 Rural Farmers        → Crop prices, govt schemes, weather
🏪 Small Shopkeepers     → Orders, inventory info, payments
👷 Daily Wage Workers     → Job info, skill training, schemes
👵 Elderly Citizens       → Health info, pension status, services
🧑‍🦯 Visually Impaired     → Full digital access via voice
📱 Feature Phone Users    → Everything smartphone users take for granted
```

### User Persona

> **Ramesh, 55, Farmer, Bihar**
>
> - Owns a ₹500 Nokia phone
> - Speaks Hindi, understands basic English words
> - Needs: PM-KISAN status, tomorrow's weather, today's tomato price
> - Current solution: 5 km travel + 2 hour wait at CSC center
> - **With BharatVani:** One 3-minute phone call. Done.

---

## 7. Impact Projections

### Social Impact

| Metric | Impact |
|---|---|
| People gaining digital access | 700 million |
| Government scheme value made accessible | ₹10 lakh crore/year |
| Annual cost saved (reduced travel/queues) | ₹5,000 crore |
| Hours saved per person per year | 20+ |
| New economic opportunities enabled | 50 million |

### Alignment with National Missions

| Mission | How BharatVani Contributes |
|---|---|
| **Digital India** | Extends digital access to 700M excluded citizens |
| **Financial Inclusion** | Direct access to banking and payment schemes |
| **Skill India** | Voice access to job listings and training programs |
| **PM-KISAN / DBT** | Farmers can check eligibility and status instantly |
| **Accessible India** | Full digital access for visually impaired citizens |

---

## 8. Success Criteria

### Hackathon Demo

| Criteria | Target |
|---|---|
| Live call connects and AI responds | ✅ Works on feature phone |
| AI answers government scheme questions accurately | ✅ 3+ schemes demonstrated |
| AI completes a transaction (order/booking) | ✅ End-to-end with OTP |
| Multilingual support demonstrated | ✅ Hindi + English minimum |
| SMS confirmation received | ✅ Within 5 seconds |

### Post-Hackathon (6 months)

| Criteria | Target |
|---|---|
| Pilot users | 10,000 |
| Supported languages | 6+ |
| Available services | 10+ |
| Government partnership | 1 state minimum |
| Average call satisfaction | > 80% |

---

## 9. Constraints & Assumptions

### Constraints
- 48-hour hackathon development window
- AWS services only (hackathon requirement)
- Toll-free number requires telecom partnership (simulated for demo)
- Bedrock model availability in ap-south-1 region

### Assumptions
- Users can make voice calls (2G minimum)
- Users can receive SMS
- AWS free tier / hackathon credits available
- Bedrock supports Hindi with acceptable accuracy
- Amazon Transcribe handles Indian accents and dialects

---

*Last Updated: February 15, 2026*
*Team: BharatVani | Track: AI for Communities, Access & Public Impact*
