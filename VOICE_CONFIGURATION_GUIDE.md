# Voice Configuration Guide

Your TalkTalk app now supports **backend-controlled voice configuration**! 🎙️

## How It Works

The backend can now control the voice, speed, and pitch for each response by including `voiceSettings` in the chat response.

## Frontend Changes Made

### 1. Updated Type Definitions

**`src/types/chat.ts`**:
```typescript
export interface ChatMessage {
  // ... existing fields
  voiceSettings?: {
    voice?: string;
    speed?: number;
    pitch?: number;
  };
}
```

**`src/services/api.ts`**:
```typescript
export interface ChatResponse {
  // ... existing fields
  voiceSettings?: {
    voice?: string;
    speed?: number;
    pitch?: number;
  };
}
```

### 2. Updated Components

**`ChatInterface.tsx`**: Now passes `voiceSettings` from backend response to message store

**`MessageBubble.tsx`**: Now uses `message.voiceSettings` when available, falls back to defaults

## Backend Implementation

### Basic Example

```python
from fastapi import FastAPI
from pydantic import BaseModel

class ChatResponse(BaseModel):
    content: str
    voiceSettings: Optional[Dict[str, Any]] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    return ChatResponse(
        content="Hello! How can I help you?",
        voiceSettings={
            "voice": "en-GB-Neural2-B",  # British male
            "speed": 1.5,                 # 1.5x speed
            "pitch": -5.0                 # Slightly deeper
        }
    )
```

## Voice Options

### Available Voices (Google Cloud TTS)

| Voice | Description | Best For |
|-------|-------------|----------|
| `en-US-Neural2-D` | Deep male (HAL-like) | Serious, authoritative |
| `en-GB-Neural2-B` | British male | Professional, elegant |
| `en-US-Neural2-A` | Female | Friendly, approachable |
| `en-US-Neural2-C` | Male | Neutral, professional |
| `en-US-Neural2-J` | Casual male | Relaxed conversations |
| `en-GB-Neural2-D` | British male | Formal British |
| `en-US-Neural2-F` | Young female | Energetic, bright |

### Parameters

- **voice**: Voice name (string)
  - Example: `"en-GB-Neural2-B"`
  
- **speed**: Speaking rate
  - Range: `0.25` to `4.0`
  - Default: `4.0`
  - `1.0` = normal speed
  - Higher = faster

- **pitch**: Voice pitch
  - Range: `-20.0` to `20.0`
  - Default: `-9.0`
  - `0` = normal pitch
  - Negative = deeper
  - Positive = higher

## Advanced Backend Strategies

### 1. Context-Based Voice Selection

```python
def get_voice_for_context(message: str) -> Dict[str, Any]:
    if "urgent" in message.lower():
        return {
            "voice": "en-US-Neural2-D",
            "speed": 1.5,
            "pitch": -8.0
        }
    elif "friendly" in message.lower():
        return {
            "voice": "en-US-Neural2-A",
            "speed": 1.0,
            "pitch": 2.0
        }
    return {"voice": "en-GB-Neural2-B", "speed": 1.2, "pitch": -5.0}
```

### 2. User Preferences

```python
async def get_user_voice_prefs(user_id: str):
    # Fetch from database
    prefs = await db.get_user_preferences(user_id)
    return prefs.voice_settings
```

### 3. Time-Based

```python
from datetime import datetime

def get_time_based_voice():
    hour = datetime.now().hour
    
    if 6 <= hour < 12:  # Morning - bright
        return {"voice": "en-US-Neural2-A", "speed": 1.2, "pitch": 3.0}
    elif 12 <= hour < 18:  # Afternoon - neutral
        return {"voice": "en-US-Neural2-C", "speed": 1.0, "pitch": 0.0}
    else:  # Evening - calm
        return {"voice": "en-US-Neural2-D", "speed": 0.9, "pitch": -5.0}
```

### 4. Sentiment-Based

```python
def get_sentiment_voice(sentiment: str):
    voices = {
        "positive": {"voice": "en-US-Neural2-A", "speed": 1.2, "pitch": 3.0},
        "neutral": {"voice": "en-US-Neural2-C", "speed": 1.0, "pitch": 0.0},
        "negative": {"voice": "en-US-Neural2-D", "speed": 0.9, "pitch": -5.0}
    }
    return voices.get(sentiment, voices["neutral"])
```

### 5. Character/Persona-Based

```python
PERSONAS = {
    "assistant": {"voice": "en-GB-Neural2-B", "speed": 1.0, "pitch": -3.0},
    "teacher": {"voice": "en-US-Neural2-C", "speed": 0.9, "pitch": 0.0},
    "friend": {"voice": "en-US-Neural2-J", "speed": 1.2, "pitch": 2.0},
    "expert": {"voice": "en-US-Neural2-D", "speed": 0.8, "pitch": -5.0}
}
```

## Default Behavior

If `voiceSettings` is **not provided** by the backend, the frontend uses these defaults:

```typescript
{
  voice: "en-GB-Neural2-B",  // British male
  speed: 4.0,                 // Maximum speed
  pitch: -9.0                 // Deep voice
}
```

Plus a `playbackRate` multiplier of `5x` for even faster playback.

## Testing

### Test with curl:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "conversationId": "test-123"
  }'
```

### Expected Response:

```json
{
  "content": "Hello! How can I help you?",
  "role": "assistant",
  "voiceSettings": {
    "voice": "en-GB-Neural2-B",
    "speed": 1.5,
    "pitch": -5.0
  }
}
```

## Example Files

Check out these example implementations:

- `backend-with-voice-config-example.py` - Complete FastAPI example with multiple strategies
- `backend-google-tts-fastapi.py` - Google Cloud TTS integration
- `backend-google-tts.js` - Node.js version

## Frontend Customization

To change the frontend defaults, edit `src/components/MessageBubble.tsx`:

```typescript
// Around line 143-147
const voice = voiceSettings.voice || 'en-GB-Neural2-B'; // Change default voice
const speed = voiceSettings.speed !== undefined ? voiceSettings.speed : 4.0; // Change default speed
const pitch = voiceSettings.pitch !== undefined ? voiceSettings.pitch : -9.0; // Change default pitch

// Around line 158
audio.playbackRate = 5; // Change playback rate multiplier
```

## Summary

✅ Backend now controls voice settings per message  
✅ Frontend automatically uses backend voice settings  
✅ Falls back to sensible defaults if not provided  
✅ Multiple strategies available (context, user prefs, time, sentiment, persona)  
✅ Easy to test and customize  

Happy talking! 🎙️🤖
