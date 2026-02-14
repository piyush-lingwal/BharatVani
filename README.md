# 🏗️ BharatVani - Technical Architecture & Implementation Guide

## AI for Bharat Hackathon 2026

---

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [AWS Services Integration](#aws-services-integration)
3. [Data Pipeline & Flow](#data-pipeline--flow)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Call Flow & State Management](#call-flow--state-management)
7. [Implementation Guide (48 Hours)](#implementation-guide-48-hours)
8. [Code Structure & Examples](#code-structure--examples)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Scaling](#deployment--scaling)

---

## 1. System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Feature Phone│  │  Smartphone  │  │   Landline   │         │
│  │  (DTMF/Voice)│  │    (Voice)   │  │   (Voice)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PSTN/Telecom  │
                    │     Network     │
                    └────────┬────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      AWS CLOUD LAYER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AMAZON CONNECT (IVR)                         │   │
│  │  - Call routing & management                              │   │
│  │  - DTMF & Voice input collection                         │   │
│  │  - Multi-language support                                │   │
│  │  - Contact flows & queue management                      │   │
│  └────┬────────────────────────────────────────────┬────────┘   │
│       │                                             │             │
│  ┌────▼─────────────┐                    ┌─────────▼──────────┐ │
│  │ AMAZON TRANSCRIBE│                    │   AMAZON POLLY     │ │
│  │  (Speech-to-Text)│                    │  (Text-to-Speech)  │ │
│  │                  │                    │                    │ │
│  │ • Hindi          │                    │ • Hindi (Aditi)    │ │
│  │ • English        │                    │ • English (Raveena)│ │
│  │ • Tamil          │                    │ • Tamil            │ │
│  │ • 20+ languages  │                    │ • 20+ voices       │ │
│  └────┬─────────────┘                    └─────────▲──────────┘ │
│       │                                             │             │
│  ┌────▼──────────────────────────────────────────┬─┘            │
│  │              CORE PROCESSING LAYER              │             │
│  │                                                │              │
│  │  ┌───────────────────────────────────────┐   │              │
│  │  │      AMAZON BEDROCK (Claude 3.5)      │   │              │
│  │  │  - Natural language understanding     │   │              │
│  │  │  - Intent extraction                  │   │              │
│  │  │  - Context management                 │   │              │
│  │  │  - Conversation orchestration         │   │              │
│  │  │  - Response generation                │   │              │
│  │  └───────────────┬───────────────────────┘   │              │
│  │                  │                            │              │
│  │  ┌───────────────▼───────────────────────┐   │              │
│  │  │     AWS LAMBDA (Business Logic)       │   │              │
│  │  │                                       │   │              │
│  │  │  ┌─────────────────────────────────┐ │   │              │
│  │  │  │  session_manager.py             │ │   │              │
│  │  │  │  - Session state tracking       │ │   │              │
│  │  │  │  - Context persistence          │ │   │              │
│  │  │  └─────────────────────────────────┘ │   │              │
│  │  │                                       │   │              │
│  │  │  ┌─────────────────────────────────┐ │   │              │
│  │  │  │  railway_booking_handler.py     │ │   │              │
│  │  │  │  - Train search logic           │ │   │              │
│  │  │  │  - Booking orchestration        │ │   │              │
│  │  │  └─────────────────────────────────┘ │   │              │
│  │  │                                       │   │              │
│  │  │  ┌─────────────────────────────────┐ │   │              │
│  │  │  │  government_schemes_handler.py  │ │   │              │
│  │  │  │  - Scheme eligibility check     │ │   │              │
│  │  │  │  - Application guidance         │ │   │              │
│  │  │  └─────────────────────────────────┘ │   │              │
│  │  │                                       │   │              │
│  │  │  ┌─────────────────────────────────┐ │   │              │
│  │  │  │  aadhaar_services_handler.py    │ │   │              │
│  │  │  │  - Document retrieval           │ │   │              │
│  │  │  │  - Status checking              │ │   │              │
│  │  │  └─────────────────────────────────┘ │   │              │
│  │  └───────────────┬───────────────────────┘   │              │
│  │                  │                            │              │
│  └──────────────────┼────────────────────────────┘              │
│                     │                                            │
│  ┌──────────────────▼──────────────────────────────────────┐   │
│  │                 DATA LAYER                               │   │
│  │                                                          │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │   │
│  │  │   DynamoDB     │  │   DynamoDB     │  │ DynamoDB  │ │   │
│  │  │   (Sessions)   │  │   (Bookings)   │  │  (Users)  │ │   │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │              Amazon S3                             │ │   │
│  │  │  - Call recordings (optional)                      │ │   │
│  │  │  - Conversation logs                               │ │   │
│  │  │  - Analytics data                                  │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            NOTIFICATION & INTEGRATION LAYER               │   │
│  │                                                          │   │
│  │  ┌────────────────┐         ┌────────────────────────┐  │   │
│  │  │  Amazon SNS    │         │   External APIs        │  │   │
│  │  │  (SMS Gateway) │         │  - IRCTC (mock/real)   │  │   │
│  │  │  - Confirmations│        │  - UIDAI               │  │   │
│  │  │  - OTP delivery │        │  - Gov portals         │  │   │
│  │  └────────────────┘         └────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MONITORING & LOGGING                         │   │
│  │                                                          │   │
│  │  ┌────────────────┐         ┌────────────────────────┐  │   │
│  │  │  CloudWatch    │         │   X-Ray (Tracing)      │  │   │
│  │  │  - Logs        │         │  - Performance         │  │   │
│  │  │  - Metrics     │         │  - Debugging           │  │   │
│  │  │  - Alarms      │         └────────────────────────┘  │   │
│  │  └────────────────┘                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. AWS Services Integration

### 2.1 Amazon Connect Configuration

**Purpose:** IVR system for handling phone calls

**Setup Steps:**

```yaml
# Amazon Connect Instance Configuration
instance_alias: "bharatvani-prod"
identity_management: "CONNECT_MANAGED"
inbound_calls: true
outbound_calls: false
contact_flow_logs: true

# Phone Number Configuration
toll_free_number: "1800-XXX-XXXX"
country_code: "+91"
type: "TOLL_FREE"

# Hours of Operation
operating_hours:
  - name: "24x7 Support"
    timezone: "Asia/Kolkata"
    schedule: "Always Open"

# Contact Flow
main_contact_flow:
  name: "BharatVani_Main_Flow"
  type: "CONTACT_FLOW"
  description: "Primary entry point for all calls"
```

**Key Features Used:**
- Contact Flows (visual IVR builder)
- Lambda integration points
- DTMF input collection
- Voice input (using Lex integration)
- Call recording (optional)
- Real-time metrics

---

### 2.2 Amazon Bedrock (Claude 3.5 Sonnet)

**Purpose:** AI brain for understanding conversations

**Configuration:**

```python
# bedrock_config.py

BEDROCK_CONFIG = {
    "model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "region": "us-east-1",
    
    "inference_params": {
        "max_tokens": 1000,
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 250
    },
    
    "system_prompt": """You are BharatVani, a helpful voice assistant for Indian citizens.

Your role:
- Help users access digital services via phone
- Speak naturally in their language (Hindi, English, etc.)
- Be patient and explain things simply
- Handle multi-turn conversations
- Extract structured information from natural speech

Guidelines:
- Always be polite and respectful
- Use simple language (8th grade reading level)
- Confirm understanding before proceeding
- If unsure, ask clarifying questions
- Keep responses under 30 words for voice delivery

Current context: {context}
User's language preference: {language}
Current service: {service_type}
"""
}
```

**API Call Pattern:**

```python
import boto3
import json

bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'
)

def call_bedrock(user_message, context, language="hindi"):
    """
    Call Bedrock API with conversation context
    """
    
    # Build system prompt with context
    system_prompt = BEDROCK_CONFIG["system_prompt"].format(
        context=json.dumps(context),
        language=language,
        service_type=context.get('service', 'general')
    )
    
    # Prepare request
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": BEDROCK_CONFIG["inference_params"]["max_tokens"],
        "temperature": BEDROCK_CONFIG["inference_params"]["temperature"],
        "messages": [
            {
                "role": "user",
                "content": user_message
            }
        ],
        "system": system_prompt
    }
    
    # Call API
    response = bedrock.invoke_model(
        modelId=BEDROCK_CONFIG["model_id"],
        body=json.dumps(request_body)
    )
    
    # Parse response
    response_body = json.loads(response['body'].read())
    
    return response_body['content'][0]['text']
```

---

### 2.3 Amazon Transcribe

**Purpose:** Convert voice to text

**Configuration:**

```python
# transcribe_config.py

TRANSCRIBE_CONFIG = {
    "languages": {
        "hindi": {
            "language_code": "hi-IN",
            "vocabulary_name": "bharatvani-hindi-vocab",
            "custom_vocab": [
                "IRCTC", "PNR", "Aadhaar", "PM-KISAN",
                "tatkal", "sleeper", "AC", "general"
            ]
        },
        "english": {
            "language_code": "en-IN",
            "vocabulary_name": "bharatvani-english-vocab",
            "custom_vocab": [
                "IRCTC", "PNR", "Aadhaar", "UPI"
            ]
        },
        "tamil": {
            "language_code": "ta-IN"
        }
    },
    
    "settings": {
        "enable_speaker_diarization": False,
        "max_speaker_labels": 1,
        "show_alternatives": 3,
        "vocabulary_filter_method": "mask"
    }
}
```

**Streaming Transcription:**

```python
import boto3
from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent

class BharatVaniTranscriptHandler(TranscriptResultStreamHandler):
    """
    Handler for real-time transcription events
    """
    
    def __init__(self, output_stream):
        super().__init__(output_stream)
        self.transcript_parts = []
    
    async def handle_transcript_event(self, transcript_event: TranscriptEvent):
        """
        Process each transcription event
        """
        results = transcript_event.transcript.results
        
        for result in results:
            if not result.is_partial:
                # Final transcript
                for alt in result.alternatives:
                    transcript = alt.transcript
                    confidence = alt.confidence
                    
                    self.transcript_parts.append({
                        'text': transcript,
                        'confidence': confidence,
                        'timestamp': result.start_time
                    })
                    
                    # Trigger intent processing
                    await self.process_intent(transcript)
    
    async def process_intent(self, transcript):
        """
        Send transcript to Bedrock for intent extraction
        """
        # This would integrate with your Lambda function
        pass

async def start_transcription_stream(audio_stream, language="hi-IN"):
    """
    Start streaming transcription
    """
    client = TranscribeStreamingClient(region="us-east-1")
    
    stream = await client.start_stream_transcription(
        language_code=language,
        media_sample_rate_hz=8000,  # Phone quality
        media_encoding="pcm",
        vocabulary_name=TRANSCRIBE_CONFIG["languages"]["hindi"]["vocabulary_name"]
    )
    
    handler = BharatVaniTranscriptHandler(stream.output_stream)
    
    await asyncio.gather(
        write_audio_chunks(stream, audio_stream),
        handler.handle_events()
    )
```

---

### 2.4 Amazon Polly

**Purpose:** Convert text to natural speech

**Configuration:**

```python
# polly_config.py

POLLY_CONFIG = {
    "voices": {
        "hindi": {
            "voice_id": "Aditi",
            "language_code": "hi-IN",
            "engine": "neural"  # More natural
        },
        "english": {
            "voice_id": "Raveena",
            "language_code": "en-IN",
            "engine": "neural"
        },
        "tamil": {
            "voice_id": "TBD",  # Check available voices
            "language_code": "ta-IN",
            "engine": "standard"
        }
    },
    
    "speech_params": {
        "output_format": "mp3",
        "sample_rate": "8000",  # Phone quality
        "text_type": "ssml"  # For better control
    }
}
```

**SSML Templates:**

```python
SSML_TEMPLATES = {
    "greeting": """
        <speak>
            <prosody rate="medium" pitch="medium">
                {text}
            </prosody>
        </speak>
    """,
    
    "confirmation": """
        <speak>
            <prosody rate="slow" pitch="+10%">
                <emphasis level="strong">{text}</emphasis>
            </prosody>
        </speak>
    """,
    
    "question": """
        <speak>
            <prosody rate="medium" pitch="+5%">
                {text}
                <break time="500ms"/>
            </prosody>
        </speak>
    """,
    
    "error": """
        <speak>
            <prosody rate="slow" pitch="-5%">
                {text}
            </prosody>
        </speak>
    """
}

def generate_speech(text, language="hindi", template="greeting"):
    """
    Generate natural speech with SSML
    """
    polly = boto3.client('polly', region_name='us-east-1')
    
    voice_config = POLLY_CONFIG["voices"][language]
    
    # Apply SSML template
    ssml_text = SSML_TEMPLATES[template].format(text=text)
    
    response = polly.synthesize_speech(
        Text=ssml_text,
        TextType='ssml',
        VoiceId=voice_config["voice_id"],
        Engine=voice_config["engine"],
        OutputFormat=POLLY_CONFIG["speech_params"]["output_format"],
        SampleRate=POLLY_CONFIG["speech_params"]["sample_rate"]
    )
    
    return response['AudioStream'].read()
```

---

### 2.5 AWS Lambda Functions

**Purpose:** Business logic execution

**Function Structure:**

```
lambda_functions/
├── session_manager/
│   ├── handler.py
│   ├── requirements.txt
│   └── config.py
├── railway_booking/
│   ├── handler.py
│   ├── irctc_client.py
│   ├── requirements.txt
│   └── config.py
├── government_schemes/
│   ├── handler.py
│   ├── eligibility_engine.py
│   ├── requirements.txt
│   └── config.py
├── aadhaar_services/
│   ├── handler.py
│   ├── uidai_client.py
│   ├── requirements.txt
│   └── config.py
└── common/
    ├── bedrock_client.py
    ├── dynamodb_helper.py
    ├── polly_client.py
    └── utils.py
```

**Lambda Configuration:**

```yaml
# lambda_config.yaml

session_manager:
  runtime: python3.11
  timeout: 30
  memory: 512
  environment:
    SESSION_TABLE: bharatvani-sessions
    REGION: us-east-1

railway_booking:
  runtime: python3.11
  timeout: 60
  memory: 1024
  environment:
    BOOKINGS_TABLE: bharatvani-bookings
    IRCTC_API_URL: https://api.irctc.co.in  # Mock for MVP
    REGION: us-east-1

government_schemes:
  runtime: python3.11
  timeout: 45
  memory: 512
  environment:
    SCHEMES_TABLE: bharatvani-schemes
    REGION: us-east-1

aadhaar_services:
  runtime: python3.11
  timeout: 60
  memory: 512
  environment:
    UIDAI_API_URL: https://api.uidai.gov.in  # Mock for MVP
    REGION: us-east-1
```

---

### 2.6 Amazon DynamoDB

**Purpose:** NoSQL database for sessions, bookings, users

**Table Schemas:**

```python
# dynamodb_schemas.py

SESSIONS_TABLE = {
    "TableName": "bharatvani-sessions",
    "KeySchema": [
        {"AttributeName": "session_id", "KeyType": "HASH"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "session_id", "AttributeType": "S"},
        {"AttributeName": "phone_number", "AttributeType": "S"},
        {"AttributeName": "created_at", "AttributeType": "N"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "phone-number-index",
            "KeySchema": [
                {"AttributeName": "phone_number", "KeyType": "HASH"},
                {"AttributeName": "created_at", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        }
    ],
    "BillingMode": "PAY_PER_REQUEST",
    "Tags": [
        {"Key": "Project", "Value": "BharatVani"},
        {"Key": "Environment", "Value": "Production"}
    ]
}

BOOKINGS_TABLE = {
    "TableName": "bharatvani-bookings",
    "KeySchema": [
        {"AttributeName": "booking_id", "KeyType": "HASH"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "booking_id", "AttributeType": "S"},
        {"AttributeName": "phone_number", "AttributeType": "S"},
        {"AttributeName": "booking_date", "AttributeType": "N"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "phone-booking-index",
            "KeySchema": [
                {"AttributeName": "phone_number", "KeyType": "HASH"},
                {"AttributeName": "booking_date", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        }
    ],
    "BillingMode": "PAY_PER_REQUEST"
}

USERS_TABLE = {
    "TableName": "bharatvani-users",
    "KeySchema": [
        {"AttributeName": "phone_number", "KeyType": "HASH"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "phone_number", "AttributeType": "S"}
    ],
    "BillingMode": "PAY_PER_REQUEST"
}
```

---

### 2.7 Amazon SNS

**Purpose:** SMS notifications

**Configuration:**

```python
# sns_config.py

SNS_CONFIG = {
    "region": "ap-south-1",  # Mumbai region for India
    "sender_id": "BHRVANI",  # 6-char alphanumeric
    "sms_type": "Transactional",
    
    "templates": {
        "booking_confirmation": {
            "hindi": "Ticket book ho gayi! PNR: {pnr}. Train: {train_name}. Date: {date}. Seat: {seat}. - BharatVani",
            "english": "Ticket booked! PNR: {pnr}. Train: {train_name}. Date: {date}. Seat: {seat}. - BharatVani"
        },
        "scheme_application": {
            "hindi": "Aapka {scheme_name} application submit ho gaya. Reference: {ref_number}. Status check karein: 1800-XXX-XXXX - BharatVani",
            "english": "Your {scheme_name} application submitted. Reference: {ref_number}. Check status: 1800-XXX-XXXX - BharatVani"
        },
        "aadhaar_download": {
            "hindi": "Aapka Aadhaar download link: {download_url}. Valid for 24 hours. - BharatVani",
            "english": "Your Aadhaar download link: {download_url}. Valid for 24 hours. - BharatVani"
        }
    }
}

def send_sms(phone_number, template_name, language, **kwargs):
    """
    Send SMS using SNS
    """
    sns = boto3.client('sns', region_name=SNS_CONFIG["region"])
    
    # Get template
    template = SNS_CONFIG["templates"][template_name][language]
    message = template.format(**kwargs)
    
    response = sns.publish(
        PhoneNumber=phone_number,
        Message=message,
        MessageAttributes={
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': SNS_CONFIG["sender_id"]
            },
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': SNS_CONFIG["sms_type"]
            }
        }
    )
    
    return response['MessageId']
```

---

## 3. Data Pipeline & Flow

### 3.1 Complete Call Flow Diagram

```
USER CALLS
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Amazon Connect: Answer Call                         │
│ - Play welcome message (Polly)                      │
│ - Detect language preference                        │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Lambda: session_manager                             │
│ - Create/retrieve session                           │
│ - Load user profile (if exists)                     │
│ - Initialize conversation context                   │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│ Amazon Connect: Main Menu                           │
│ - Present service options (DTMF/Voice)             │
│ - Collect user choice                              │
└───────────────────┬─────────────────────────────────┘
                    │
         ┌──────────┴──────────┬─────────────┐
         │                     │             │
         ▼                     ▼             ▼
    [Railway]           [Gov Schemes]   [Aadhaar]
         │                     │             │
         │                     │             │
         ▼                     ▼             ▼
┌──────────────────┐  ┌──────────────┐  ┌────────────┐
│ Lambda:          │  │ Lambda:       │  │ Lambda:    │
│ railway_booking  │  │ gov_schemes   │  │ aadhaar    │
└────────┬─────────┘  └──────┬───────┘  └─────┬──────┘
         │                    │                 │
         └────────────────────┴─────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │  Conversation Loop                     │
         │  ┌──────────────────────────────────┐ │
         │  │ 1. Transcribe user input         │ │
         │  │    (Amazon Transcribe)            │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 2. Extract intent & entities     │ │
         │  │    (Amazon Bedrock)               │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 3. Update session state          │ │
         │  │    (DynamoDB)                     │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 4. Execute business logic        │ │
         │  │    (Lambda functions)             │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 5. Generate response text        │ │
         │  │    (Amazon Bedrock)               │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 6. Convert to speech             │ │
         │  │    (Amazon Polly)                 │ │
         │  └────────────┬─────────────────────┘ │
         │               ▼                        │
         │  ┌──────────────────────────────────┐ │
         │  │ 7. Play to user                  │ │
         │  │    (Amazon Connect)               │ │
         │  └────────────┬─────────────────────┘ │
         │               │                        │
         │               └──► More input?         │
         │                    Yes → Loop          │
         │                    No  → Continue      │
         └────────────────────┬───────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Transaction Complete          │
              │ - Save to DynamoDB            │
              │ - Send SMS confirmation (SNS) │
              │ - End call gracefully         │
              └───────────────────────────────┘
```

### 3.2 Data Flow for Railway Booking

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Intent Detection                               │
│                                                             │
│ User says: "Mumbai se Delhi ka ticket"                     │
│      │                                                      │
│      ▼                                                      │
│ Transcribe → "mumbai se delhi ka ticket"                   │
│      │                                                      │
│      ▼                                                      │
│ Bedrock extracts:                                          │
│   {                                                         │
│     "intent": "book_railway_ticket",                       │
│     "entities": {                                          │
│       "source": "Mumbai",                                  │
│       "destination": "Delhi"                               │
│     },                                                      │
│     "missing": ["date", "passenger_details"]              │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Collect Missing Information                         │
│                                                             │
│ System asks: "Kab jana hai?"                               │
│      │                                                      │
│      ▼                                                      │
│ User: "Kal"                                                │
│      │                                                      │
│      ▼                                                      │
│ Bedrock parses: "kal" → tomorrow's date                    │
│      │                                                      │
│      ▼                                                      │
│ Update session:                                            │
│   {                                                         │
│     "source": "Mumbai",                                    │
│     "destination": "Delhi",                                │
│     "date": "2026-02-16"                                   │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Search Trains                                       │
│                                                             │
│ Lambda calls IRCTC API (or mock):                          │
│   GET /search?from=BOM&to=NDLS&date=2026-02-16            │
│      │                                                      │
│      ▼                                                      │
│ Response:                                                   │
│   [                                                         │
│     {                                                       │
│       "train_number": "12301",                             │
│       "name": "Rajdhani Express",                          │
│       "departure": "06:00",                                │
│       "arrival": "10:30",                                  │
│       "classes": [                                         │
│         {"type": "3AC", "price": 2500, "available": 45},  │
│         {"type": "2AC", "price": 3500, "available": 20}   │
│       ]                                                     │
│     },                                                      │
│     {...more trains...}                                    │
│   ]                                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Present Options                                     │
│                                                             │
│ Bedrock generates natural response:                        │
│   "3 trains milein:                                        │
│    1. Rajdhani - subah 6 baje - ₹2500                      │
│    2. Duronto - subah 9 baje - ₹2200                       │
│    3. Express - dopahar 12 baje - ₹1800"                   │
│      │                                                      │
│      ▼                                                      │
│ Polly converts to speech                                   │
│      │                                                      │
│      ▼                                                      │
│ User hears and selects: "Ek" (one)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Collect Passenger Details                          │
│                                                             │
│ Ask: "Naam?"        → "Ramesh Kumar"                       │
│ Ask: "Umra?"        → "55"                                 │
│ Ask: "Seat?"        → "Window"                             │
│      │                                                      │
│      ▼                                                      │
│ Session updated:                                           │
│   {                                                         │
│     "train": "12301",                                      │
│     "passenger": {                                         │
│       "name": "Ramesh Kumar",                             │
│       "age": 55,                                           │
│       "seat_preference": "window"                         │
│     }                                                       │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Confirmation                                        │
│                                                             │
│ Generate summary:                                          │
│   "Confirm karein:                                         │
│    Train: Rajdhani Express                                 │
│    Date: 16 Feb 2026                                       │
│    Mumbai to Delhi                                         │
│    Passenger: Ramesh Kumar, 55 years                       │
│    Price: ₹2500                                            │
│    Sahi hai?"                                              │
│      │                                                      │
│      ▼                                                      │
│ User: "Haan, sahi hai"                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Process Booking                                     │
│                                                             │
│ Lambda calls IRCTC booking API:                            │
│   POST /book                                               │
│   {                                                         │
│     "train_number": "12301",                               │
│     "date": "2026-02-16",                                  │
│     "passengers": [...],                                   │
│     "contact": "+919876543210"                             │
│   }                                                         │
│      │                                                      │
│      ▼                                                      │
│ Response:                                                   │
│   {                                                         │
│     "status": "confirmed",                                 │
│     "pnr": "1234567890",                                   │
│     "seat": "A1, Coach B3"                                 │
│   }                                                         │
│      │                                                      │
│      ▼                                                      │
│ Save to DynamoDB (bookings table)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Send Confirmation                                   │
│                                                             │
│ Voice: "Ticket book ho gayi! PNR aapko SMS se mil jayega" │
│      │                                                      │
│      ▼                                                      │
│ SNS sends SMS:                                             │
│   "Ticket booked! PNR: 1234567890                          │
│    Train: Rajdhani Express                                 │
│    Date: 16 Feb 2026                                       │
│    Seat: A1, Coach B3                                      │
│    - BharatVani"                                           │
│      │                                                      │
│      ▼                                                      │
│ End call gracefully                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Sessions Table

```python
# Session document structure

{
    "session_id": "sess_20260215_123456",  # Primary Key
    "phone_number": "+919876543210",       # GSI Hash Key
    "created_at": 1708012345,              # GSI Range Key (unix timestamp)
    "updated_at": 1708012567,
    
    "user_profile": {
        "name": "Ramesh Kumar",
        "language": "hindi",
        "location": "Bihar"
    },
    
    "conversation_state": {
        "current_service": "railway_booking",
        "state": "waiting_train_selection",
        "context": {
            "source": "Mumbai",
            "destination": "Delhi",
            "date": "2026-02-16",
            "available_trains": [...],
            "conversation_history": [
                {
                    "speaker": "user",
                    "text": "Mumbai se Delhi",
                    "timestamp": 1708012345
                },
                {
                    "speaker": "system",
                    "text": "Kab jana hai?",
                    "timestamp": 1708012346
                }
            ]
        }
    },
    
    "metadata": {
        "call_id": "conn_abc123",
        "call_duration": 120,  # seconds
        "ip_address": "203.0.113.45"
    },
    
    "ttl": 1708098745  # Auto-delete after 24 hours
}
```

### 4.2 Bookings Table

```python
# Booking document structure

{
    "booking_id": "bk_20260215_789012",    # Primary Key
    "phone_number": "+919876543210",       # GSI Hash Key
    "booking_date": 1708012345,            # GSI Range Key
    
    "booking_type": "railway_ticket",
    
    "booking_details": {
        "pnr": "1234567890",
        "train_number": "12301",
        "train_name": "Rajdhani Express",
        "journey_date": "2026-02-16",
        "source": "Mumbai Central (BOM)",
        "destination": "New Delhi (NDLS)",
        "departure_time": "06:00",
        "arrival_time": "10:30",
        
        "passengers": [
            {
                "name": "Ramesh Kumar",
                "age": 55,
                "gender": "M",
                "seat": "A1",
                "coach": "B3",
                "berth": "Lower"
            }
        ],
        
        "fare": {
            "base_fare": 2500,
            "taxes": 50,
            "total": 2550,
            "currency": "INR"
        },
        
        "status": "confirmed",
        "booking_time": 1708012345
    },
    
    "communication": {
        "sms_sent": true,
        "sms_id": "msg_xyz789",
        "confirmation_sent_at": 1708012350
    },
    
    "session_id": "sess_20260215_123456",
    
    "created_at": 1708012345,
    "updated_at": 1708012345
}
```

### 4.3 Users Table

```python
# User profile document

{
    "phone_number": "+919876543210",  # Primary Key
    
    "profile": {
        "name": "Ramesh Kumar",
        "age": 55,
        "gender": "M",
        "language_preference": "hindi",
        "location": {
            "state": "Bihar",
            "district": "Patna",
            "village": "Rampur"
        }
    },
    
    "preferences": {
        "default_train_class": "3AC",
        "seat_preference": "window",
        "meal_preference": "veg"
    },
    
    "statistics": {
        "total_calls": 15,
        "total_bookings": 8,
        "successful_transactions": 12,
        "last_call_date": 1708012345,
        "favorite_services": ["railway_booking", "pm_kisan"]
    },
    
    "linked_accounts": {
        "aadhaar": "1234-5678-9012",
        "pan": "ABCDE1234F",
        "bank_account": "1234567890"
    },
    
    "created_at": 1705420345,
    "updated_at": 1708012345
}
```

---

## 5. API Architecture

### 5.1 Internal API Structure

```python
# api_structure.py

"""
BharatVani Internal API Structure

Base URL: Internal (Lambda to Lambda communication)
Protocol: Synchronous invocation via boto3
"""

# Session Management API
class SessionAPI:
    """
    Manages user sessions across calls
    """
    
    @staticmethod
    def create_session(phone_number, language="hindi"):
        """
        POST /session/create
        """
        pass
    
    @staticmethod
    def get_session(session_id):
        """
        GET /session/{session_id}
        """
        pass
    
    @staticmethod
    def update_session(session_id, updates):
        """
        PUT /session/{session_id}
        """
        pass
    
    @staticmethod
    def close_session(session_id):
        """
        DELETE /session/{session_id}
        """
        pass


# Railway Booking API
class RailwayAPI:
    """
    Railway ticket booking interface
    """
    
    @staticmethod
    def search_trains(source, destination, date):
        """
        GET /railway/search
        
        Query params:
        - source: Station code (e.g., "BOM")
        - destination: Station code (e.g., "NDLS")
        - date: Journey date (YYYY-MM-DD)
        
        Returns: List of available trains
        """
        pass
    
    @staticmethod
    def check_availability(train_number, date, class_type):
        """
        GET /railway/availability
        """
        pass
    
    @staticmethod
    def book_ticket(booking_request):
        """
        POST /railway/book
        
        Body:
        {
            "train_number": "12301",
            "date": "2026-02-16",
            "class": "3AC",
            "passengers": [...],
            "contact": "+919876543210"
        }
        """
        pass
    
    @staticmethod
    def get_pnr_status(pnr):
        """
        GET /railway/pnr/{pnr}
        """
        pass


# Government Schemes API
class GovernmentSchemesAPI:
    """
    Government schemes eligibility and application
    """
    
    @staticmethod
    def list_schemes(category=None):
        """
        GET /schemes/list
        """
        pass
    
    @staticmethod
    def check_eligibility(phone_number, scheme_id):
        """
        POST /schemes/eligibility
        """
        pass
    
    @staticmethod
    def get_scheme_details(scheme_id):
        """
        GET /schemes/{scheme_id}
        """
        pass
    
    @staticmethod
    def apply_for_scheme(application_data):
        """
        POST /schemes/apply
        """
        pass


# Aadhaar Services API
class AadhaarAPI:
    """
    Aadhaar-related services
    """
    
    @staticmethod
    def verify_aadhaar(aadhaar_number):
        """
        POST /aadhaar/verify
        """
        pass
    
    @staticmethod
    def generate_download_link(aadhaar_number):
        """
        POST /aadhaar/download-link
        """
        pass
    
    @staticmethod
    def update_mobile(aadhaar_number, new_mobile):
        """
        POST /aadhaar/update-mobile
        """
        pass
```

### 5.2 External API Integrations

```python
# external_apis.py

"""
External API Integration Layer
Handles communication with IRCTC, UIDAI, Government portals
"""

import requests
from typing import Dict, List, Optional

class IRCTCClient:
    """
    IRCTC API Client
    
    For MVP: Use mock responses
    For Production: Integrate with actual IRCTC API
    """
    
    BASE_URL = "https://api.irctc.co.in/v1"  # Mock URL
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
    
    def search_trains(
        self,
        source_station: str,
        dest_station: str,
        journey_date: str
    ) -> List[Dict]:
        """
        Search for trains between stations
        
        Args:
            source_station: Source station code (e.g., "NDLS")
            dest_station: Destination station code (e.g., "BOM")
            journey_date: Journey date in YYYY-MM-DD format
        
        Returns:
            List of train objects
        """
        
        # For MVP - return mock data
        return self._mock_train_search(source_station, dest_station, journey_date)
    
    def _mock_train_search(self, source, dest, date):
        """
        Mock train search response for MVP
        """
        return [
            {
                "train_number": "12301",
                "train_name": "Howrah Rajdhani",
                "source_station": source,
                "dest_station": dest,
                "departure_time": "06:00",
                "arrival_time": "10:30",
                "duration": "4:30",
                "available_classes": [
                    {
                        "class_type": "3AC",
                        "available_seats": 45,
                        "fare": 2500,
                        "status": "AVAILABLE"
                    },
                    {
                        "class_type": "2AC",
                        "available_seats": 20,
                        "fare": 3500,
                        "status": "AVAILABLE"
                    }
                ],
                "days_of_operation": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            {
                "train_number": "12951",
                "train_name": "Mumbai Rajdhani",
                "source_station": source,
                "dest_station": dest,
                "departure_time": "09:00",
                "arrival_time": "13:45",
                "duration": "4:45",
                "available_classes": [
                    {
                        "class_type": "3AC",
                        "available_seats": 30,
                        "fare": 2200,
                        "status": "AVAILABLE"
                    }
                ],
                "days_of_operation": ["Mon", "Wed", "Fri", "Sun"]
            }
        ]
    
    def book_ticket(self, booking_data: Dict) -> Dict:
        """
        Book railway ticket
        
        Returns:
            Booking confirmation with PNR
        """
        
        # For MVP - return mock booking
        import random
        
        return {
            "status": "CONFIRMED",
            "pnr": str(random.randint(1000000000, 9999999999)),
            "booking_id": f"BK{random.randint(100000, 999999)}",
            "train_number": booking_data["train_number"],
            "journey_date": booking_data["journey_date"],
            "passengers": booking_data["passengers"],
            "total_fare": booking_data["total_fare"],
            "seats": [
                {
                    "passenger_name": p["name"],
                    "coach": f"B{random.randint(1, 10)}",
                    "seat_number": f"{random.choice(['A', 'B', 'C'])}{random.randint(1, 72)}",
                    "berth": random.choice(["Lower", "Middle", "Upper", "Side Lower", "Side Upper"])
                }
                for p in booking_data["passengers"]
            ]
        }


class UIDAIClient:
    """
    UIDAI (Aadhaar) API Client
    """
    
    BASE_URL = "https://api.uidai.gov.in/v1"  # Mock URL
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def verify_aadhaar(self, aadhaar_number: str) -> Dict:
        """
        Verify Aadhaar number
        
        For MVP: Return mock response
        """
        return {
            "valid": True,
            "aadhaar_number": aadhaar_number,
            "masked_number": f"XXXX-XXXX-{aadhaar_number[-4:]}"
        }
    
    def generate_download_link(self, aadhaar_number: str) -> Dict:
        """
        Generate e-Aadhaar download link
        """
        import hashlib
        import time
        
        # Generate mock download link
        token = hashlib.md5(f"{aadhaar_number}{time.time()}".encode()).hexdigest()
        
        return {
            "download_url": f"https://eaadhaar.uidai.gov.in/download/{token}",
            "valid_until": int(time.time()) + 86400,  # 24 hours
            "password": aadhaar_number[-4:] + "YOB"  # Last 4 digits + Year of Birth
        }


class GovernmentPortalClient:
    """
    Generic Government Portal API Client
    """
    
    def __init__(self):
        self.schemes_db = self._load_schemes_database()
    
    def _load_schemes_database(self) -> Dict:
        """
        Load government schemes database
        
        For MVP: Return static data
        For Production: Integrate with actual government APIs
        """
        return {
            "pm_kisan": {
                "id": "pm_kisan",
                "name": "PM-KISAN",
                "full_name": "Pradhan Mantri Kisan Samman Nidhi",
                "description": "Financial support to farmers",
                "benefit_amount": 6000,
                "benefit_frequency": "yearly",
                "eligibility": {
                    "occupation": "farmer",
                    "land_ownership": "required",
                    "max_land_size": None  # No limit
                },
                "required_documents": [
                    "Aadhaar Card",
                    "Land Ownership Document",
                    "Bank Account Details"
                ],
                "application_url": "https://pmkisan.gov.in"
            },
            "ayushman_bharat": {
                "id": "ayushman_bharat",
                "name": "Ayushman Bharat",
                "full_name": "Pradhan Mantri Jan Arogya Yojana",
                "description": "Health insurance for poor families",
                "benefit_amount": 500000,
                "benefit_frequency": "yearly_coverage",
                "eligibility": {
                    "income_limit": 100000,
                    "family_type": "BPL"
                },
                "required_documents": [
                    "Aadhaar Card",
                    "Ration Card",
                    "Income Certificate"
                ],
                "application_url": "https://pmjay.gov.in"
            }
        }
    
    def get_eligible_schemes(self, user_profile: Dict) -> List[Dict]:
        """
        Get schemes user is eligible for
        """
        eligible = []
        
        for scheme_id, scheme in self.schemes_db.items():
            if self._check_eligibility(user_profile, scheme):
                eligible.append(scheme)
        
        return eligible
    
    def _check_eligibility(self, user_profile: Dict, scheme: Dict) -> bool:
        """
        Check if user is eligible for a scheme
        
        Simple eligibility logic for MVP
        """
        # Implement eligibility rules
        return True  # Simplified for MVP
```

---

## 6. Call Flow & State Management

### 6.1 State Machine for Railway Booking

```python
# state_machine.py

from enum import Enum
from typing import Dict, Optional

class BookingState(Enum):
    """
    States in railway booking flow
    """
    INITIAL = "initial"
    WAITING_SOURCE = "waiting_source"
    WAITING_DESTINATION = "waiting_destination"
    WAITING_DATE = "waiting_date"
    SEARCHING_TRAINS = "searching_trains"
    PRESENTING_OPTIONS = "presenting_options"
    WAITING_TRAIN_SELECTION = "waiting_train_selection"
    WAITING_CLASS_SELECTION = "waiting_class_selection"
    WAITING_PASSENGER_COUNT = "waiting_passenger_count"
    COLLECTING_PASSENGER_DETAILS = "collecting_passenger_details"
    CONFIRMING_BOOKING = "confirming_booking"
    PROCESSING_PAYMENT = "processing_payment"
    BOOKING_COMPLETE = "booking_complete"
    ERROR = "error"


class BookingStateMachine:
    """
    State machine for railway booking conversation
    """
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.state = BookingState.INITIAL
        self.context = {}
    
    def transition(self, user_input: str) -> Dict:
        """
        Process user input and transition to next state
        
        Returns:
            {
                "next_state": BookingState,
                "system_response": str,
                "actions": [...]
            }
        """
        
        if self.state == BookingState.INITIAL:
            return self._handle_initial(user_input)
        
        elif self.state == BookingState.WAITING_SOURCE:
            return self._handle_source_input(user_input)
        
        elif self.state == BookingState.WAITING_DESTINATION:
            return self._handle_destination_input(user_input)
        
        elif self.state == BookingState.WAITING_DATE:
            return self._handle_date_input(user_input)
        
        # ... more state handlers
    
    def _handle_initial(self, user_input: str) -> Dict:
        """
        Handle initial state
        """
        self.state = BookingState.WAITING_SOURCE
        
        return {
            "next_state": self.state,
            "system_response": "Kahan se yatra karni hai? Shahr ka naam bataiye.",
            "actions": ["save_session"]
        }
    
    def _handle_source_input(self, user_input: str) -> Dict:
        """
        Handle source station input
        """
        # Extract station from input using Bedrock
        source = self._extract_station(user_input)
        
        if source:
            self.context["source"] = source
            self.state = BookingState.WAITING_DESTINATION
            
            return {
                "next_state": self.state,
                "system_response": f"{source} se kahan jana hai?",
                "actions": ["save_session"]
            }
        else:
            return {
                "next_state": self.state,  # Stay in same state
                "system_response": "Samajh nahi aaya. Kripya station ka naam dubara bataiye.",
                "actions": []
            }
    
    def _handle_destination_input(self, user_input: str) -> Dict:
        """
        Handle destination station input
        """
        dest = self._extract_station(user_input)
        
        if dest:
            self.context["destination"] = dest
            self.state = BookingState.WAITING_DATE
            
            return {
                "next_state": self.state,
                "system_response": "Kab jana hai? Aaj, kal, ya koi aur din?",
                "actions": ["save_session"]
            }
        else:
            return {
                "next_state": self.state,
                "system_response": "Station samajh nahi aaya. Dubara bataiye.",
                "actions": []
            }
    
    def _handle_date_input(self, user_input: str) -> Dict:
        """
        Handle journey date input
        """
        date = self._parse_date(user_input)
        
        if date:
            self.context["date"] = date
            self.state = BookingState.SEARCHING_TRAINS
            
            return {
                "next_state": self.state,
                "system_response": "Thik hai. Trains search kar raha hoon...",
                "actions": ["save_session", "search_trains"]
            }
        else:
            return {
                "next_state": self.state,
                "system_response": "Date samajh nahi aayi. Kripya dubara bataiye - jaise 'kal' ya '15 February'.",
                "actions": []
            }
    
    def _extract_station(self, text: str) -> Optional[str]:
        """
        Extract station name from user input using Bedrock
        """
        # Call Bedrock to extract station
        # For MVP, simple keyword matching
        
        stations = {
            "mumbai": "Mumbai Central (BOM)",
            "delhi": "New Delhi (NDLS)",
            "bangalore": "Bangalore (SBC)",
            "chennai": "Chennai Central (MAS)",
            "kolkata": "Howrah (HWH)",
            "hyderabad": "Hyderabad (HYB)"
        }
        
        text_lower = text.lower()
        for key, value in stations.items():
            if key in text_lower:
                return value
        
        return None
    
    def _parse_date(self, text: str) -> Optional[str]:
        """
        Parse date from natural language
        """
        from datetime import datetime, timedelta
        
        text_lower = text.lower()
        today = datetime.now()
        
        if "aaj" in text_lower or "today" in text_lower:
            return today.strftime("%Y-%m-%d")
        elif "kal" in text_lower or "tomorrow" in text_lower:
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")
        elif "parso" in text_lower or "day after" in text_lower:
            return (today + timedelta(days=2)).strftime("%Y-%m-%d")
        else:
            # Use Bedrock for complex date parsing
            return None
```

### 6.2 Context Management

```python
# context_manager.py

import json
from typing import Dict, List, Optional
from datetime import datetime

class ConversationContext:
    """
    Manages conversation context across turns
    """
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.history: List[Dict] = []
        self.entities: Dict = {}
        self.state_data: Dict = {}
    
    def add_turn(self, speaker: str, text: str, metadata: Optional[Dict] = None):
        """
        Add a conversation turn
        """
        turn = {
            "speaker": speaker,  # "user" or "system"
            "text": text,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        self.history.append(turn)
    
    def update_entity(self, entity_name: str, value: any):
        """
        Update an extracted entity
        """
        self.entities[entity_name] = {
            "value": value,
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def get_entity(self, entity_name: str, default=None):
        """
        Get entity value
        """
        entity = self.entities.get(entity_name)
        return entity["value"] if entity else default
    
    def set_state_data(self, key: str, value: any):
        """
        Set state-specific data
        """
        self.state_data[key] = value
    
    def get_state_data(self, key: str, default=None):
        """
        Get state-specific data
        """
        return self.state_data.get(key, default)
    
    def get_context_summary(self, last_n_turns: int = 5) -> str:
        """
        Get conversation summary for Bedrock context
        """
        recent_history = self.history[-last_n_turns:]
        
        summary = {
            "recent_conversation": [
                f"{turn['speaker']}: {turn['text']}"
                for turn in recent_history
            ],
            "extracted_entities": self.entities,
            "state_data": self.state_data
        }
        
        return json.dumps(summary, indent=2)
    
    def to_dict(self) -> Dict:
        """
        Serialize context for storage
        """
        return {
            "session_id": self.session_id,
            "history": self.history,
            "entities": self.entities,
            "state_data": self.state_data
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ConversationContext':
        """
        Deserialize context from storage
        """
        context = cls(data["session_id"])
        context.history = data.get("history", [])
        context.entities = data.get("entities", {})
        context.state_data = data.get("state_data", {})
        return context
```

---

*This document continues with Implementation Guide, Code Examples, Testing Strategy, and Deployment in the next sections...*

Would you like me to continue with the remaining sections (7-10)?
