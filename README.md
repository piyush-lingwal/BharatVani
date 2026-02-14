# 🏗️ BharatVani - Technical Architecture Part 2

## Implementation, Code Examples, Testing & Deployment

---

## 7. Implementation Guide (48 Hours)

### Hour-by-Hour Build Plan

```
HACKATHON TIMELINE: 48 HOURS

┌─────────────────────────────────────────────────────┐
│ PHASE 1: Foundation (Hours 0-12)                    │
└─────────────────────────────────────────────────────┘

Hour 0-2: Setup & Planning
├── AWS Account Setup
│   ├── Create/verify AWS accounts for all members
│   ├── Enable required services (Connect, Bedrock, etc.)
│   └── Create IAM roles and policies
├── Development Environment
│   ├── Install AWS CLI, SAM CLI, Python 3.11
│   ├── Setup Git repository
│   └── Configure VS Code / IDE
└── Architecture Review
    ├── Team walkthrough of system design
    ├── Assign specific components to members
    └── Setup communication channels

Hour 2-4: Amazon Connect IVR Setup
├── Create Connect Instance
│   ├── Instance alias: bharatvani-dev
│   ├── Claim toll-free number (or use test number)
│   └── Configure hours of operation
├── Build Main Contact Flow
│   ├── Welcome message
│   ├── Language selection (Hindi/English)
│   ├── Main menu (DTMF: 1,2,3)
│   └── Lambda integration points
└── Test Basic Call Flow
    └── Make test call, verify IVR works

Hour 4-6: DynamoDB Tables Setup
├── Create Tables
│   ├── bharatvani-sessions
│   ├── bharatvani-bookings
│   └── bharatvani-users
├── Define Schemas
│   └── Add sample data for testing
└── Create Access Policies
    └── IAM roles for Lambda access

Hour 6-8: Session Manager Lambda
├── Create Lambda Function
│   ├── Runtime: Python 3.11
│   ├── Handler: session_manager.lambda_handler
│   └── Configure environment variables
├── Implement Core Functions
│   ├── create_session()
│   ├── get_session()
│   ├── update_session()
│   └── close_session()
└── Test with Sample Events
    └── Verify DynamoDB read/write

Hour 8-10: Bedrock Integration
├── Enable Bedrock Access
│   ├── Request model access (Claude 3.5 Sonnet)
│   └── Wait for approval (usually instant)
├── Create Bedrock Helper Module
│   ├── bedrock_client.py
│   ├── Intent extraction function
│   └── Response generation function
└── Test Bedrock Calls
    └── Verify natural language understanding

Hour 10-12: Polly Integration
├── Create Polly Helper Module
│   ├── polly_client.py
│   ├── SSML template system
│   └── Voice caching (optional)
└── Test Voice Generation
    ├── Generate Hindi speech
    ├── Generate English speech
    └── Verify audio quality

┌─────────────────────────────────────────────────────┐
│ PHASE 2: Railway Booking (Hours 12-24)              │
└─────────────────────────────────────────────────────┘

Hour 12-14: Railway Booking Lambda
├── Create Lambda Function
│   └── railway_booking_handler.py
├── Implement State Machine
│   ├── BookingStateMachine class
│   ├── State transition logic
│   └── Context management
└── Mock IRCTC API Client
    ├── search_trains()
    ├── check_availability()
    └── book_ticket()

Hour 14-16: Booking Conversation Flow
├── Implement Dialog Management
│   ├── Source station collection
│   ├── Destination collection
│   ├── Date parsing (natural language)
│   ├── Train selection
│   └── Passenger details
└── Test Each State
    └── Unit tests for state transitions

Hour 16-18: Connect Integration
├── Update Contact Flow
│   ├── Add railway booking branch
│   ├── Connect to Lambda functions
│   ├── Add error handling
│   └── Add retry logic
└── Test End-to-End
    ├── Make test call
    ├── Complete booking flow
    └── Verify SMS delivery

Hour 18-20: SNS SMS Integration
├── Configure SNS
│   ├── Setup SMS sending
│   ├── Create message templates
│   └── Configure sender ID
├── Implement SMS Sender
│   └── send_booking_confirmation()
└── Test SMS Delivery
    └── Verify messages received

Hour 20-22: Polishing & Bug Fixes
├── Error Handling
│   ├── Add try-catch blocks
│   ├── Graceful degradation
│   └── User-friendly error messages
├── Logging
│   ├── Add CloudWatch logs
│   ├── Log all state transitions
│   └── Log external API calls
└── Testing
    ├── Happy path testing
    ├── Error scenario testing
    └── Edge case testing

Hour 22-24: Data Persistence
├── Save Complete Bookings
│   └── Write to DynamoDB bookings table
├── Update User Profiles
│   └── Track booking history
└── Session Cleanup
    └── Implement TTL for old sessions

┌─────────────────────────────────────────────────────┐
│ PHASE 3: Additional Services (Hours 24-36)          │
└─────────────────────────────────────────────────────┘

Hour 24-28: Government Schemes (Optional)
├── Create Schemes Lambda
├── Load Schemes Database
├── Implement Eligibility Check
└── Build Conversation Flow

Hour 28-32: Aadhaar Services (Optional)
├── Create Aadhaar Lambda
├── Mock UIDAI Client
├── Implement Download Link Generation
└── Build Conversation Flow

Hour 32-36: Testing & Refinement
├── Integration Testing
│   ├── Test all services
│   ├── Test language switching
│   └── Test error recovery
├── Performance Testing
│   ├── Lambda cold start times
│   ├── Response latency
│   └── Database query performance
└── User Experience Testing
    ├── Call flow smoothness
    ├── Voice clarity
    └── Response appropriateness

┌─────────────────────────────────────────────────────┐
│ PHASE 4: Presentation (Hours 36-48)                 │
└─────────────────────────────────────────────────────┘

Hour 36-40: Build Presentation
├── Create Pitch Deck
│   ├── Problem statement
│   ├── Solution overview
│   ├── Live demo plan
│   ├── Technical architecture
│   ├── Business model
│   └── Impact metrics
├── Prepare Demo Script
│   ├── Write exact dialogue
│   ├── Practice timing
│   └── Prepare backup scenarios
└── Create Architecture Diagrams
    └── Visual system overview

Hour 40-44: Demo Preparation
├── Setup Demo Environment
│   ├── Test phone with good signal
│   ├── Backup phone ready
│   ├── Speaker setup
│   └── Screen recording ready
├── Practice Demo
│   ├── Multiple run-throughs
│   ├── Time the demo (< 3 minutes)
│   ├── Practice failure recovery
│   └── Prepare for interruptions
└── Prepare Q&A
    ├── Anticipated questions list
    ├── Answers for each
    └── Team member assignments

Hour 44-46: Final Testing & Polish
├── End-to-End Testing
│   ├── Complete booking flow
│   ├── SMS delivery
│   ├── Error handling
│   └── Edge cases
├── Documentation
│   ├── README.md
│   ├── API documentation
│   └── Setup instructions
└── Code Cleanup
    ├── Remove debug code
    ├── Add comments
    └── Code formatting

Hour 46-48: Presentation Practice
├── Full Rehearsal
│   ├── Pitch + Demo (5 min total)
│   ├── Q&A practice (5 min)
│   └── Timing adjustments
├── Team Alignment
│   ├── Who presents what
│   ├── Who handles demo
│   └── Who answers questions
└── Final Checks
    ├── All systems operational
    ├── Backup plans ready
    └── Confidence building
```

---

## 8. Complete Code Examples

### 8.1 Session Manager Lambda

```python
# lambda_functions/session_manager/handler.py

import boto3
import json
import uuid
import time
from typing import Dict, Optional
from datetime import datetime, timedelta

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sessions_table = dynamodb.Table('bharatvani-sessions')
users_table = dynamodb.Table('bharatvani-users')

def lambda_handler(event, context):
    """
    Main handler for session management
    
    Event structure from Amazon Connect:
    {
        "Details": {
            "ContactData": {
                "CustomerEndpoint": {
                    "Address": "+919876543210"
                },
                "ContactId": "abc-123-def"
            },
            "Parameters": {
                "action": "create_session" | "get_session" | "update_session" | "close_session",
                "session_id": "optional",
                "updates": "optional json string"
            }
        }
    }
    """
    
    try:
        # Extract parameters
        phone_number = event['Details']['ContactData']['CustomerEndpoint']['Address']
        contact_id = event['Details']['ContactData']['ContactId']
        params = event['Details']['Parameters']
        
        action = params.get('action', 'create_session')
        
        # Route to appropriate handler
        if action == 'create_session':
            result = create_session(phone_number, contact_id)
        elif action == 'get_session':
            session_id = params.get('session_id')
            result = get_session(session_id)
        elif action == 'update_session':
            session_id = params.get('session_id')
            updates = json.loads(params.get('updates', '{}'))
            result = update_session(session_id, updates)
        elif action == 'close_session':
            session_id = params.get('session_id')
            result = close_session(session_id)
        else:
            result = {'error': 'Invalid action'}
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error in session manager: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def create_session(phone_number: str, contact_id: str) -> Dict:
    """
    Create a new session for a call
    """
    
    # Generate session ID
    session_id = f"sess_{int(time.time())}_{uuid.uuid4().hex[:8]}"
    
    # Get or create user profile
    user_profile = get_user_profile(phone_number)
    
    # Create session object
    session = {
        'session_id': session_id,
        'phone_number': phone_number,
        'contact_id': contact_id,
        'created_at': int(time.time()),
        'updated_at': int(time.time()),
        
        'user_profile': user_profile,
        
        'conversation_state': {
            'current_service': None,
            'state': 'initial',
            'context': {
                'conversation_history': []
            }
        },
        
        'metadata': {
            'call_count': user_profile.get('statistics', {}).get('total_calls', 0) + 1
        },
        
        # Auto-expire after 24 hours
        'ttl': int(time.time()) + 86400
    }
    
    # Save to DynamoDB
    sessions_table.put_item(Item=session)
    
    # Update user stats
    update_user_stats(phone_number, 'call_started')
    
    return {
        'session_id': session_id,
        'user_profile': user_profile,
        'success': True
    }


def get_session(session_id: str) -> Optional[Dict]:
    """
    Retrieve existing session
    """
    
    try:
        response = sessions_table.get_item(
            Key={'session_id': session_id}
        )
        
        if 'Item' in response:
            return response['Item']
        else:
            return {'error': 'Session not found'}
            
    except Exception as e:
        print(f"Error retrieving session: {str(e)}")
        return {'error': str(e)}


def update_session(session_id: str, updates: Dict) -> Dict:
    """
    Update session with new data
    
    Args:
        session_id: Session identifier
        updates: Dictionary of updates to apply
    """
    
    try:
        # Get current session
        current = get_session(session_id)
        if 'error' in current:
            return current
        
        # Apply updates
        if 'conversation_state' in updates:
            current['conversation_state'].update(updates['conversation_state'])
        
        if 'metadata' in updates:
            current['metadata'].update(updates['metadata'])
        
        # Update timestamp
        current['updated_at'] = int(time.time())
        
        # Save back to DynamoDB
        sessions_table.put_item(Item=current)
        
        return {
            'session_id': session_id,
            'success': True
        }
        
    except Exception as e:
        print(f"Error updating session: {str(e)}")
        return {'error': str(e)}


def close_session(session_id: str) -> Dict:
    """
    Close a session and cleanup
    """
    
    try:
        # Get session
        session = get_session(session_id)
        if 'error' in session:
            return session
        
        # Update user stats
        phone_number = session['phone_number']
        call_duration = int(time.time()) - session['created_at']
        
        update_user_stats(phone_number, 'call_ended', {
            'duration': call_duration
        })
        
        # Delete session (or mark as closed)
        sessions_table.delete_item(
            Key={'session_id': session_id}
        )
        
        return {
            'session_id': session_id,
            'success': True
        }
        
    except Exception as e:
        print(f"Error closing session: {str(e)}")
        return {'error': str(e)}


def get_user_profile(phone_number: str) -> Dict:
    """
    Get or create user profile
    """
    
    try:
        response = users_table.get_item(
            Key={'phone_number': phone_number}
        )
        
        if 'Item' in response:
            return response['Item']
        else:
            # Create new user profile
            new_user = {
                'phone_number': phone_number,
                'profile': {
                    'language_preference': 'hindi',  # Default
                    'created_at': int(time.time())
                },
                'statistics': {
                    'total_calls': 0,
                    'successful_transactions': 0
                },
                'created_at': int(time.time()),
                'updated_at': int(time.time())
            }
            
            users_table.put_item(Item=new_user)
            return new_user
            
    except Exception as e:
        print(f"Error getting user profile: {str(e)}")
        return {
            'profile': {
                'language_preference': 'hindi'
            },
            'statistics': {}
        }


def update_user_stats(phone_number: str, event_type: str, data: Dict = None):
    """
    Update user statistics
    """
    
    try:
        users_table.update_item(
            Key={'phone_number': phone_number},
            UpdateExpression='SET statistics.total_calls = statistics.total_calls + :inc, updated_at = :now',
            ExpressionAttributeValues={
                ':inc': 1 if event_type == 'call_started' else 0,
                ':now': int(time.time())
            }
        )
    except Exception as e:
        print(f"Error updating user stats: {str(e)}")
```

### 8.2 Railway Booking Handler

```python
# lambda_functions/railway_booking/handler.py

import boto3
import json
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta

# Import custom modules
from bedrock_client import call_bedrock, extract_intent
from irctc_client import IRCTCClient
from state_machine import BookingStateMachine, BookingState

# Initialize clients
dynamodb = boto3.resource('dynamodb')
sessions_table = dynamodb.Table('bharatvani-sessions')
bookings_table = dynamodb.Table('bharatvani-bookings')
sns = boto3.client('sns')

# IRCTC client (mock for MVP)
irctc = IRCTCClient(api_key="mock_key")

def lambda_handler(event, context):
    """
    Main handler for railway booking
    
    Event from Amazon Connect:
    {
        "session_id": "sess_xxx",
        "user_input": "mumbai se delhi",
        "language": "hindi"
    }
    """
    
    try:
        session_id = event.get('session_id')
        user_input = event.get('user_input', '')
        language = event.get('language', 'hindi')
        
        # Get session
        session = get_session(session_id)
        if not session:
            return error_response("Session not found")
        
        # Initialize state machine
        state_machine = BookingStateMachine.from_session(session)
        
        # Process user input
        result = state_machine.process_input(user_input, language)
        
        # Save updated session
        save_session(session_id, state_machine.to_dict())
        
        # Handle completion
        if state_machine.state == BookingState.BOOKING_COMPLETE:
            # Save booking
            booking_id = save_booking(session_id, state_machine.context)
            
            # Send SMS
            send_confirmation_sms(
                phone_number=session['phone_number'],
                booking_data=state_machine.context,
                language=language
            )
            
            result['booking_id'] = booking_id
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error in railway booking: {str(e)}")
        return error_response(str(e))


class BookingStateMachine:
    """
    State machine for railway booking flow
    """
    
    def __init__(self):
        self.state = BookingState.INITIAL
        self.context = {}
        self.conversation_history = []
    
    @classmethod
    def from_session(cls, session: Dict):
        """
        Restore state machine from session
        """
        machine = cls()
        
        conv_state = session.get('conversation_state', {})
        machine.state = BookingState(conv_state.get('state', 'initial'))
        machine.context = conv_state.get('context', {})
        machine.conversation_history = machine.context.get('conversation_history', [])
        
        return machine
    
    def process_input(self, user_input: str, language: str) -> Dict:
        """
        Process user input and determine response
        """
        
        # Add to history
        self.add_to_history('user', user_input)
        
        # Route based on current state
        if self.state == BookingState.INITIAL:
            response = self._handle_initial(user_input, language)
        
        elif self.state == BookingState.WAITING_SOURCE:
            response = self._handle_source_input(user_input, language)
        
        elif self.state == BookingState.WAITING_DESTINATION:
            response = self._handle_destination_input(user_input, language)
        
        elif self.state == BookingState.WAITING_DATE:
            response = self._handle_date_input(user_input, language)
        
        elif self.state == BookingState.WAITING_TRAIN_SELECTION:
            response = self._handle_train_selection(user_input, language)
        
        elif self.state == BookingState.WAITING_PASSENGER_DETAILS:
            response = self._handle_passenger_details(user_input, language)
        
        elif self.state == BookingState.CONFIRMING_BOOKING:
            response = self._handle_confirmation(user_input, language)
        
        else:
            response = self._handle_error(language)
        
        # Add system response to history
        self.add_to_history('system', response['message'])
        
        return response
    
    def _handle_initial(self, user_input: str, language: str) -> Dict:
        """
        Handle initial state - ask for source
        """
        self.state = BookingState.WAITING_SOURCE
        
        message = "Kahan se yatra karni hai?" if language == 'hindi' else "Where do you want to travel from?"
        
        return {
            'message': message,
            'state': self.state.value,
            'awaiting_input': True
        }
    
    def _handle_source_input(self, user_input: str, language: str) -> Dict:
        """
        Extract source station from input
        """
        
        # Use Bedrock to extract station
        intent_data = extract_intent(
            text=user_input,
            context=self.get_context_for_ai(),
            language=language
        )
        
        source = intent_data.get('entities', {}).get('station')
        
        if source:
            self.context['source'] = source
            self.state = BookingState.WAITING_DESTINATION
            
            message = f"{source} se kahan jana hai?" if language == 'hindi' else f"Where do you want to go from {source}?"
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
        else:
            # Didn't understand, try again
            message = "Station ka naam samajh nahi aaya. Kripya dubara bataiye." if language == 'hindi' else "I didn't understand the station name. Please tell again."
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
    
    def _handle_destination_input(self, user_input: str, language: str) -> Dict:
        """
        Extract destination station
        """
        
        intent_data = extract_intent(
            text=user_input,
            context=self.get_context_for_ai(),
            language=language
        )
        
        destination = intent_data.get('entities', {}).get('station')
        
        if destination:
            self.context['destination'] = destination
            self.state = BookingState.WAITING_DATE
            
            message = "Kab jana hai? Aaj, kal, ya koi aur din?" if language == 'hindi' else "When do you want to travel? Today, tomorrow, or another day?"
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
        else:
            message = "Destination samajh nahi aaya. Dubara bataiye." if language == 'hindi' else "I didn't understand the destination. Please tell again."
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
    
    def _handle_date_input(self, user_input: str, language: str) -> Dict:
        """
        Parse journey date
        """
        
        date = parse_date_from_text(user_input, language)
        
        if date:
            self.context['journey_date'] = date
            self.state = BookingState.SEARCHING_TRAINS
            
            # Search trains
            trains = self._search_trains()
            
            if trains:
                self.context['available_trains'] = trains
                self.state = BookingState.WAITING_TRAIN_SELECTION
                
                # Generate options message
                message = self._format_train_options(trains, language)
                
                return {
                    'message': message,
                    'state': self.state.value,
                    'awaiting_input': True
                }
            else:
                message = "Koi train nahi mili. Kripya date check karein." if language == 'hindi' else "No trains found. Please check the date."
                self.state = BookingState.WAITING_DATE
                
                return {
                    'message': message,
                    'state': self.state.value,
                    'awaiting_input': True
                }
        else:
            message = "Date samajh nahi aayi. Kripya 'kal' ya '15 February' jaise bataiye." if language == 'hindi' else "I didn't understand the date. Please say like 'tomorrow' or '15 February'."
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
    
    def _search_trains(self) -> List[Dict]:
        """
        Search for trains using IRCTC client
        """
        
        try:
            trains = irctc.search_trains(
                source_station=self.context['source'],
                dest_station=self.context['destination'],
                journey_date=self.context['journey_date']
            )
            return trains
        except Exception as e:
            print(f"Error searching trains: {str(e)}")
            return []
    
    def _format_train_options(self, trains: List[Dict], language: str) -> str:
        """
        Format train options for user
        """
        
        if language == 'hindi':
            message = f"{len(trains)} trains milein:\n"
            for i, train in enumerate(trains[:3], 1):  # Show max 3
                message += f"{i}. {train['train_name']} - {train['departure_time']} baje - ₹{train['available_classes'][0]['fare']}\n"
            message += "Konsi train chahiye? Number bataiye."
        else:
            message = f"{len(trains)} trains found:\n"
            for i, train in enumerate(trains[:3], 1):
                message += f"{i}. {train['train_name']} - {train['departure_time']} - ₹{train['available_classes'][0]['fare']}\n"
            message += "Which train do you want? Tell the number."
        
        return message
    
    def _handle_train_selection(self, user_input: str, language: str) -> Dict:
        """
        Handle train selection
        """
        
        # Extract number
        selection = extract_number_from_text(user_input)
        
        if selection and 1 <= selection <= len(self.context['available_trains']):
            selected_train = self.context['available_trains'][selection - 1]
            self.context['selected_train'] = selected_train
            self.state = BookingState.WAITING_PASSENGER_DETAILS
            
            message = "Aapka naam kya hai?" if language == 'hindi' else "What is your name?"
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
        else:
            message = "Galat number. Kripya 1, 2, ya 3 bataiye." if language == 'hindi' else "Wrong number. Please say 1, 2, or 3."
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
    
    def _handle_passenger_details(self, user_input: str, language: str) -> Dict:
        """
        Collect passenger details
        """
        
        # Simple flow: just collect name for MVP
        # In production, collect age, gender, etc.
        
        self.context['passenger_name'] = user_input
        self.context['passenger_age'] = 55  # Mock
        self.state = BookingState.CONFIRMING_BOOKING
        
        # Generate confirmation message
        message = self._generate_confirmation_message(language)
        
        return {
            'message': message,
            'state': self.state.value,
            'awaiting_input': True
        }
    
    def _generate_confirmation_message(self, language: str) -> str:
        """
        Generate booking confirmation prompt
        """
        
        train = self.context['selected_train']
        
        if language == 'hindi':
            message = f"""
Confirm karein:
Train: {train['train_name']}
Date: {self.context['journey_date']}
{self.context['source']} se {self.context['destination']}
Passenger: {self.context['passenger_name']}
Price: ₹{train['available_classes'][0]['fare']}

Sahi hai? Haan ya Nahi bataiye.
"""
        else:
            message = f"""
Please confirm:
Train: {train['train_name']}
Date: {self.context['journey_date']}
From {self.context['source']} to {self.context['destination']}
Passenger: {self.context['passenger_name']}
Price: ₹{train['available_classes'][0]['fare']}

Is this correct? Say Yes or No.
"""
        
        return message.strip()
    
    def _handle_confirmation(self, user_input: str, language: str) -> Dict:
        """
        Handle booking confirmation
        """
        
        confirmation = extract_confirmation(user_input, language)
        
        if confirmation:
            # Process booking
            booking_result = self._process_booking()
            
            if booking_result['status'] == 'success':
                self.context['pnr'] = booking_result['pnr']
                self.context['booking_id'] = booking_result['booking_id']
                self.state = BookingState.BOOKING_COMPLETE
                
                message = f"Ticket book ho gayi! PNR: {booking_result['pnr']}. SMS aapko mil jayega." if language == 'hindi' else f"Ticket booked! PNR: {booking_result['pnr']}. You will receive SMS."
                
                return {
                    'message': message,
                    'state': self.state.value,
                    'awaiting_input': False,
                    'booking_complete': True
                }
            else:
                message = "Booking mein problem aayi. Kripya dobara try karein." if language == 'hindi' else "There was a problem with booking. Please try again."
                self.state = BookingState.ERROR
                
                return {
                    'message': message,
                    'state': self.state.value,
                    'awaiting_input': False
                }
        else:
            # User said no
            message = "Thik hai. Kya change karna hai?" if language == 'hindi' else "Okay. What do you want to change?"
            self.state = BookingState.INITIAL
            
            return {
                'message': message,
                'state': self.state.value,
                'awaiting_input': True
            }
    
    def _process_booking(self) -> Dict:
        """
        Actually book the ticket
        """
        
        try:
            train = self.context['selected_train']
            
            booking_data = {
                'train_number': train['train_number'],
                'journey_date': self.context['journey_date'],
                'class': train['available_classes'][0]['class_type'],
                'passengers': [
                    {
                        'name': self.context['passenger_name'],
                        'age': self.context['passenger_age'],
                        'gender': 'M'
                    }
                ],
                'total_fare': train['available_classes'][0]['fare']
            }
            
            result = irctc.book_ticket(booking_data)
            
            return {
                'status': 'success',
                'pnr': result['pnr'],
                'booking_id': result['booking_id']
            }
            
        except Exception as e:
            print(f"Error processing booking: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def _handle_error(self, language: str) -> Dict:
        """
        Handle error state
        """
        
        message = "Kuch galat ho gaya. Dobara shuru karte hain." if language == 'hindi' else "Something went wrong. Let's start again."
        self.state = BookingState.INITIAL
        self.context = {}
        
        return {
            'message': message,
            'state': self.state.value,
            'awaiting_input': True
        }
    
    def add_to_history(self, speaker: str, text: str):
        """
        Add turn to conversation history
        """
        self.conversation_history.append({
            'speaker': speaker,
            'text': text,
            'timestamp': int(time.time())
        })
    
    def get_context_for_ai(self) -> str:
        """
        Get context summary for AI
        """
        return json.dumps({
            'current_state': self.state.value,
            'collected_data': self.context,
            'recent_conversation': self.conversation_history[-5:]
        })
    
    def to_dict(self) -> Dict:
        """
        Serialize state machine to dict
        """
        return {
            'state': self.state.value,
            'context': {
                **self.context,
                'conversation_history': self.conversation_history
            }
        }


# Helper functions

def parse_date_from_text(text: str, language: str) -> Optional[str]:
    """
    Parse date from natural language
    """
    from datetime import datetime, timedelta
    
    text_lower = text.lower()
    today = datetime.now()
    
    # Handle common date expressions
    if any(word in text_lower for word in ['aaj', 'today']):
        return today.strftime('%Y-%m-%d')
    elif any(word in text_lower for word in ['kal', 'tomorrow']):
        return (today + timedelta(days=1)).strftime('%Y-%m-%d')
    elif any(word in text_lower for word in ['parso', 'day after']):
        return (today + timedelta(days=2)).strftime('%Y-%m-%d')
    else:
        # Use Bedrock for complex parsing
        try:
            result = call_bedrock(
                message=f"Extract date from: '{text}'. Today is {today.strftime('%Y-%m-%d')}. Return only date in YYYY-MM-DD format or 'NONE'.",
                context={},
                language=language
            )
            
            if 'NONE' not in result and len(result) == 10:
                return result
            else:
                return None
        except:
            return None


def extract_number_from_text(text: str) -> Optional[int]:
    """
    Extract number from text
    """
    # Handle digit
    if text.strip().isdigit():
        return int(text.strip())
    
    # Handle words
    words_to_numbers = {
        'ek': 1, 'one': 1, '1': 1,
        'do': 2, 'two': 2, '2': 2,
        'teen': 3, 'three': 3, '3': 3
    }
    
    for word, num in words_to_numbers.items():
        if word in text.lower():
            return num
    
    return None


def extract_confirmation(text: str, language: str) -> bool:
    """
    Extract yes/no confirmation
    """
    text_lower = text.lower()
    
    yes_words = ['haan', 'yes', 'हां', 'sahi', 'correct', 'thik']
    no_words = ['nahi', 'no', 'नहीं', 'galat', 'wrong']
    
    if any(word in text_lower for word in yes_words):
        return True
    elif any(word in text_lower for word in no_words):
        return False
    else:
        return None


def save_booking(session_id: str, booking_data: Dict) -> str:
    """
    Save booking to DynamoDB
    """
    
    booking_id = f"bk_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    
    booking = {
        'booking_id': booking_id,
        'session_id': session_id,
        'booking_type': 'railway_ticket',
        'booking_details': {
            'pnr': booking_data['pnr'],
            'train': booking_data['selected_train'],
            'journey_date': booking_data['journey_date'],
            'passenger': {
                'name': booking_data['passenger_name'],
                'age': booking_data['passenger_age']
            }
        },
        'created_at': int(time.time())
    }
    
    bookings_table.put_item(Item=booking)
    
    return booking_id


def send_confirmation_sms(phone_number: str, booking_data: Dict, language: str):
    """
    Send SMS confirmation
    """
    
    train = booking_data['selected_train']
    pnr = booking_data['pnr']
    
    if language == 'hindi':
        message = f"Ticket book ho gayi! PNR: {pnr}. Train: {train['train_name']}. Date: {booking_data['journey_date']}. - BharatVani"
    else:
        message = f"Ticket booked! PNR: {pnr}. Train: {train['train_name']}. Date: {booking_data['journey_date']}. - BharatVani"
    
    try:
        sns.publish(
            PhoneNumber=phone_number,
            Message=message,
            MessageAttributes={
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': 'BHRVANI'
                },
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional'
                }
            }
        )
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")


def error_response(message: str) -> Dict:
    """
    Standard error response
    """
    return {
        'statusCode': 500,
        'body': json.dumps({
            'error': message
        })
    }


def get_session(session_id: str) -> Optional[Dict]:
    """
    Get session from DynamoDB
    """
    try:
        response = sessions_table.get_item(
            Key={'session_id': session_id}
        )
        return response.get('Item')
    except Exception as e:
        print(f"Error getting session: {str(e)}")
        return None


def save_session(session_id: str, state_data: Dict):
    """
    Save session to DynamoDB
    """
    try:
        sessions_table.update_item(
            Key={'session_id': session_id},
            UpdateExpression='SET conversation_state = :state, updated_at = :now',
            ExpressionAttributeValues={
                ':state': state_data,
                ':now': int(time.time())
            }
        )
    except Exception as e:
        print(f"Error saving session: {str(e)}")
```

---

*This document continues with Testing Strategy and Deployment sections...*

Would you like me to:
1. Continue with Testing Strategy section?
2. Add Deployment & Infrastructure as Code section?
3. Create visual architecture diagrams?
4. Provide AWS SAM/CloudFormation templates?

Let me know what you need next!
