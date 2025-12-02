"""
Example FastAPI Backend with Voice Configuration
This shows how to configure voice settings in your chat endpoint
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    history: Optional[List[ChatMessage]] = []
    images: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"
    conversationId: Optional[str] = None
    voiceSettings: Optional[Dict[str, Any]] = None  # Add voice settings here!

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that returns response with voice configuration
    """
    try:
        # Your AI logic here
        # For example, call Claude, GPT, or your custom model
        response_text = f"You said: {request.message}"
        
        # Configure voice settings based on your logic
        # You can dynamically choose voice settings based on:
        # - User preferences
        # - Conversation context
        # - Time of day
        # - Sentiment analysis
        # - Character/persona
        
        voice_config = get_voice_for_response(request.message)
        
        return ChatResponse(
            content=response_text,
            role="assistant",
            conversationId=request.conversationId,
            voiceSettings=voice_config  # Frontend will use these settings
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_voice_for_response(message: str) -> Dict[str, Any]:
    """
    Dynamically select voice settings based on context
    
    Available voices (Google Cloud TTS):
    - en-US-Neural2-D: Deep male (HAL-like)
    - en-GB-Neural2-B: British authoritative male
    - en-US-Neural2-A: Female
    - en-US-Neural2-C: Male
    - en-GB-Neural2-D: British male
    - en-US-Neural2-F: Female, young
    - en-US-Neural2-J: Male, casual
    
    Parameters:
    - voice: Voice name (string)
    - speed: 0.25 to 4.0 (1.0 = normal)
    - pitch: -20.0 to 20.0 (0 = normal, negative = deeper)
    """
    
    # Example 1: Different voices for different topics
    if "urgent" in message.lower() or "emergency" in message.lower():
        return {
            "voice": "en-US-Neural2-D",  # Deep, serious voice
            "speed": 1.2,                 # Slightly faster
            "pitch": -5.0                 # Deeper
        }
    
    # Example 2: Friendly, casual conversation
    elif "joke" in message.lower() or "fun" in message.lower():
        return {
            "voice": "en-US-Neural2-J",  # Casual male
            "speed": 1.0,
            "pitch": 2.0                  # Slightly higher
        }
    
    # Example 3: Professional British voice
    elif "business" in message.lower() or "professional" in message.lower():
        return {
            "voice": "en-GB-Neural2-B",  # British authoritative
            "speed": 0.9,                 # Slower, more deliberate
            "pitch": -3.0
        }
    
    # Default voice settings
    else:
        return {
            "voice": "en-GB-Neural2-B",
            "speed": 4.0,                 # Max speed
            "pitch": -9.0                 # Deep
        }

# Alternative: User preferences stored in database
async def get_user_voice_preferences(user_id: str) -> Dict[str, Any]:
    """
    Get user's preferred voice settings from database
    """
    # Example: fetch from database
    user_prefs = {
        "voice": "en-US-Neural2-D",
        "speed": 1.5,
        "pitch": -5.0
    }
    return user_prefs

# Alternative: Time-based voice selection
def get_time_based_voice() -> Dict[str, Any]:
    """
    Different voice based on time of day
    """
    from datetime import datetime
    hour = datetime.now().hour
    
    if 6 <= hour < 12:  # Morning
        return {
            "voice": "en-US-Neural2-A",  # Bright female voice
            "speed": 1.0,
            "pitch": 2.0
        }
    elif 12 <= hour < 18:  # Afternoon
        return {
            "voice": "en-US-Neural2-C",  # Male voice
            "speed": 1.2,
            "pitch": 0.0
        }
    else:  # Evening/Night
        return {
            "voice": "en-US-Neural2-D",  # Deep, calming voice
            "speed": 0.8,
            "pitch": -5.0
        }

# Alternative: Sentiment-based voice
def get_sentiment_based_voice(sentiment: str) -> Dict[str, Any]:
    """
    Select voice based on sentiment analysis of the response
    """
    sentiment_voices = {
        "positive": {
            "voice": "en-US-Neural2-A",
            "speed": 1.2,
            "pitch": 3.0
        },
        "neutral": {
            "voice": "en-US-Neural2-C",
            "speed": 1.0,
            "pitch": 0.0
        },
        "negative": {
            "voice": "en-US-Neural2-D",
            "speed": 0.9,
            "pitch": -5.0
        }
    }
    return sentiment_voices.get(sentiment, sentiment_voices["neutral"])

"""
HOW TO USE IN YOUR BACKEND:

1. Add voiceSettings to your ChatResponse model:
   
   class ChatResponse(BaseModel):
       content: str
       voiceSettings: Optional[Dict[str, Any]] = None

2. Return voice settings in your /chat endpoint:
   
   return ChatResponse(
       content=ai_response,
       voiceSettings={
           "voice": "en-GB-Neural2-B",
           "speed": 1.5,
           "pitch": -5.0
       }
   )

3. Frontend will automatically use these settings!

VOICE SELECTION STRATEGIES:

✅ Static: Always use the same voice
✅ User Preference: Store in database per user
✅ Context-based: Different voices for different topics
✅ Time-based: Morning/afternoon/evening voices
✅ Sentiment-based: Match voice to emotion
✅ Character-based: Different personas/characters
✅ Random: Variety in conversations

EXAMPLE RESPONSES:

{
    "content": "Hello! How can I help you today?",
    "voiceSettings": {
        "voice": "en-GB-Neural2-B",
        "speed": 1.5,
        "pitch": -5.0
    }
}

If voiceSettings is omitted, frontend uses defaults:
- voice: "en-GB-Neural2-B"
- speed: 4.0
- pitch: -9.0
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
