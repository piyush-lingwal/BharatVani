<div align="center">

# 🇮🇳 BharatVani — भारत वाणी

### *The Internet, Spoken.*

**A toll-free AI voice service that gives 700 million Indians access to digital services — using just a phone call.**

No smartphone. No internet. No app. No literacy. Just your voice.

---

[![Built on AWS](https://img.shields.io/badge/Built%20on-AWS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![AI Powered](https://img.shields.io/badge/AI-Amazon%20Bedrock-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![Voice](https://img.shields.io/badge/Voice-Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)](https://twilio.com)
[![Live Data](https://img.shields.io/badge/Live%20Data-Tavily%20%2B%20OpenWeather-28a745?style=for-the-badge)](#live-data-apis)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#license)

[Architecture](./ARCHITECTURE.md) · [Requirements](./REQUIREMENTS.md) · [Design](./DESIGN.md)

</div>

---

## 📞 One Phone Call. That's All It Takes.

```
👨‍🌾 Ramesh, farmer in Bihar, dials the Twilio number

🤖 AI:  "Namaste! BharatVani mein aapka swagat hai."

👨‍🌾 Ramesh: "Aaj Delhi mein mausam kaisa hai?"

🤖 AI:  "Delhi mein abhi 30 degree hai, ekdum saaf aasmaan.
         Hawa 8 kilometer ghante ki speed se chal rahi hai."

👨‍🌾 Ramesh: "Aaj petrol ka rate kya hai?"

🤖 AI:  "Mumbai mein aaj petrol 103 rupaye 54 paise per litre hai."

👨‍🌾 Ramesh: "PM Kisan ke baare mein batao"

🤖 AI:  "PM-KISAN mein saal mein 6000 rupaye milte hain,
         teen kiston mein. Helpline 1800-115-526 hai."
```

**Ramesh didn't need a smartphone. Just talked — BharatVani did the rest.**

---

## 🔴 The Problem

India's digital revolution has exploded — UPI, DigiLocker, UMANG, e-governance. But there's a massive blind spot:

<div align="center">

### **700 million Indians are completely excluded from digital services.**

</div>

| Barrier | How Many Affected | Why Current Solutions Fail |
|---|---|---|
| **No Smartphone** | 700M have only feature phones | Apps require smartphones (₹6,000+) |
| **No Internet** | 350M+ lack reliable data | Websites need data plans |
| **No Literacy** | 260M adults not fully literate | All digital services require reading |
| **No English** | 500M+ don't understand English | Most apps default to English |

---

## 🟢 The Solution

**BharatVani = A phone number powered by AI.**

Any Indian dials → AI listens → AI responds in Hindi with live, real data.

---

## ✨ What BharatVani Can Do (Live Today)

| Capability | Example Query | Data Source |
|---|---|---|
| 🌦️ **Live Weather** | "Delhi mein mausam kaisa hai?" | OpenWeatherMap API |
| 📰 **Live News** | "Aaj ki taza khabar?" | NDTV India RSS |
| ⛽ **Live Petrol Rates** | "Petrol ka rate kya hai?" | Tavily Web Search |
| 🚂 **Train Info** | "Mumbai Patna train kab hai?" | Tavily Web Search |
| 🏛️ **Govt Schemes** | "PM Kisan eligibility?" | Knowledge Base (25+ schemes) |
| 💰 **Gold Price** | "Sone ka aaj ka bhav?" | Tavily Web Search |
| 🌾 **Mandi/Farm** | "Gehun ka rate kya hai?" | Tavily Web Search |
| 💼 **Jobs** | "Sarkari naukri kaise milegi?" | Tavily Web Search |
| 💬 **Anything** | Any general question | Claude 3.5 Sonnet AI |

---

## 🏗️ Current Architecture

```
📱 Caller dials Twilio number
          ↓
    ☎️ Twilio (voice telephony)
          ↓
    🎙️ STT: Twilio/Browser Speech Recognition (hi-IN)
          ↓
    ⚡ AWS Lambda (Orchestrator)
          ↓
    🔍 Intent Detection (detectLiveDataNeed)
       ├── weather?   → OpenWeatherMap API
       ├── news?      → NDTV RSS Feed
       └── anything else live? → Tavily Web Search
          ↓
    🧠 Amazon Bedrock (Claude 3.5 Sonnet)
       LIVE DATA injected into prompt
          ↓
    🔊 Twilio TwiML → Voice Response back to caller
```

### AWS Services in Use

| Service | Role |
|---|---|
| **Amazon Bedrock** (Claude 3.5 Sonnet APAC) | AI brain — understands + generates responses |
| **AWS Lambda** | Single orchestrator function — handles all call logic |
| **Amazon DynamoDB** | Session storage, conversation history |
| **Amazon S3** | Knowledge base — 25+ government scheme JSONs |
| **AWS API Gateway** | HTTP API — exposes Lambda to Twilio |
| **AWS SAM** | Infrastructure as code, deployment |

### External Services

| Service | Role |
|---|---|
| **Twilio** | Voice telephony — receives calls, STT, TTS |
| **OpenWeatherMap** | Real-time weather for 50+ Indian cities |
| **Tavily AI Search** | Real-time web search (petrol, trains, gold, news) |
| **NDTV India RSS** | Free live news headlines |

---

## 🔑 Live API Keys & Endpoints

> ⚠️ **For maintainers only** — keys are in Lambda env vars, not in code

| Key | Purpose | Where Set |
|---|---|---|
| `WEATHER_API_KEY` | OpenWeatherMap | Lambda env var |
| `TAVILY_API_KEY` | Tavily web search | Lambda env var |
| `NEWS_API_KEY` | (unused — NDTV RSS is free) | Lambda env var |
| `BEDROCK_MODEL_ID` | `apac.anthropic.claude-3-5-sonnet-20241022-v2:0` | Lambda env var |

**Lambda endpoint:** `https://p37tglqhc0.execute-api.ap-south-1.amazonaws.com`

**Twilio webhook:** `https://p37tglqhc0.execute-api.ap-south-1.amazonaws.com/voice/incoming`

**Chat endpoint:** `https://p37tglqhc0.execute-api.ap-south-1.amazonaws.com/chat`

---

## 📂 Repository Structure

```
BharatVani/
├── README.md                        ← You are here (current state)
├── ARCHITECTURE.md                  ← Detailed architecture
├── REQUIREMENTS.md                  ← Requirements
├── DESIGN.md                        ← Design document
├── infrastructure/
│   └── template.yaml                ← AWS SAM template (Lambda + API GW + DDB)
├── lambda/
│   └── orchestrator/                ← Single Lambda (all logic here)
│       ├── index.mjs                ← Main handler (Twilio + Chat routes)
│       ├── handlers/
│       │   ├── twilio.mjs           ← Twilio TwiML voice flow
│       │   ├── govtSchemes.mjs      ← Government scheme handler
│       │   └── farmerAssistant.mjs  ← Farmer queries
│       └── utils/
│           ├── bedrock.mjs          ← Claude AI integration + prompt builder
│           ├── apiServices.mjs      ← Weather / News / Tavily / Gold APIs
│           ├── session.mjs          ← DynamoDB session management
│           └── sms.mjs              ← OTP / SMS via SNS
├── knowledge-base/
│   ├── schemes/                     ← 25+ government scheme JSONs
│   ├── agriculture/                 ← Farming knowledge base
│   └── system/
│       └── system_prompt.txt        ← Claude's personality & rules
└── web/
    ├── chat.html                    ← Web chat interface (test)
    └── call.html                    ← Voice call interface (browser-based)
```

---

## 🚀 Deployment

### Prerequisites

- AWS CLI configured (`ap-south-1` region)
- AWS SAM CLI installed
- Node.js 18+
- Twilio account with a phone number

### Deploy

```bash
# Clone
git clone https://github.com/piyush-lingwal/BharatVani.git
cd BharatVani

# Build & deploy (replace keys with your own)
sam build --template-file infrastructure/template.yaml

sam deploy \
  --template-file infrastructure/template.yaml \
  --stack-name bharatvani-stack \
  --region ap-south-1 \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "Environment=dev \
     BedrockModelId=apac.anthropic.claude-3-5-sonnet-20241022-v2:0 \
     WeatherApiKey=YOUR_OPENWEATHER_KEY \
     TavilyApiKey=YOUR_TAVILY_KEY"
```

### Connect Twilio

1. Go to [console.twilio.com](https://console.twilio.com) → Phone Numbers
2. Click your number → Voice → Webhook
3. Set URL: `https://<YOUR_API_GW>.execute-api.ap-south-1.amazonaws.com/voice/incoming`
4. Method: `HTTP POST`

---

## 🔍 How Intent Detection Works

Intent detection is **keyword-based** (hardcoded in `apiServices.mjs`) — not an AI agent:

```
User text → detectLiveDataNeed(text)
  "मौसम" / "mausam" / "weather" → { type: 'weather', city: 'Delhi' }
  "खबर" / "khabar" / "news"    → { type: 'news' }
  "petrol" / "पेट्रोल" / "train" → { type: 'web_search', query: text }
  "सोना" / "sona" / "gold"      → { type: 'gold' } (via Tavily)
  (nothing matched)              → no live data, Claude answers from KB
```

Keywords exist in **both Latin and Devanagari** (speech recognition returns Devanagari for `hi-IN` lang).

---

## 🗣️ Language Support

| Language | Voice Input | AI Response |
|---|---|---|
| 🟢 Hindi | ✅ (hi-IN, Devanagari STT) | ✅ Natural Hindi |
| 🟢 English | ✅ | ✅ |
| 🟡 Other Indian languages | Planned Phase 2 | — |

**Code-mixing supported:** "Mujhe train ticket *book* karna hai" — Claude understands Hindi-English mix.

---

## 🗓️ Roadmap

| Phase | Status | Milestones |
|---|---|---|
| **MVP** | ✅ Done | AI voice call + Govt schemes + Weather/News |
| **Live APIs** | ✅ Done | Tavily web search + OpenWeatherMap + NDTV RSS |
| **Phone Integration** | 🔄 In Progress | Twilio number connected |
| **True Agent Pipeline** | 📋 Planned | Claude tool-calling instead of keyword detection |
| **More Languages** | 📋 Planned | Tamil, Telugu, Bengali, Marathi |
| **Bedrock Knowledge Base** | 📋 Planned | Replace local KB with Bedrock RAG |

---

<div align="center">

## 🇮🇳 *Har Phone, Har Bhasha, Har Bharatiya*

### Every Phone. Every Language. Every Indian.

**BharatVani gives 700 million Indians the internet they deserve — one phone call at a time.**

---

*Built with ❤️ for India*

*Powered by* **Amazon Web Services** *·* **Twilio** *·* **Claude AI**

</div>
