// Google Cloud Text-to-Speech Backend Endpoint
// Add this to your existing Express server

const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

// Add this to your Express app
app.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US-Neural2-D', speed = 0.9, pitch = -2.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Construct the request
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'en-US',
        name: voice, // Neural2-D is deep male voice (HAL-like)
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speed,
        pitch: pitch,
        effectsProfileId: ['headphone-class-device'], // Optimize for headphones
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Send the audio content
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ 
      error: 'Text-to-speech failed', 
      message: error.message 
    });
  }
});

/*
SETUP INSTRUCTIONS:

1. Install Google Cloud TTS:
   npm install @google-cloud/text-to-speech

2. Create Google Cloud Project & Enable TTS:
   - Go to console.cloud.google.com
   - Create a new project (or use existing)
   - Enable "Cloud Text-to-Speech API"
   - Go to "APIs & Services" > "Credentials"
   - Create Service Account
   - Download JSON key file

3. Set up authentication (choose ONE method):

   METHOD A - Service Account JSON (Recommended):
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"

   METHOD B - API Key (Simpler but less secure):
   In your code, add API key to client initialization

4. Best HAL-like Voices (FREE tier):
   WaveNet voices (1M chars/month free):
   - en-US-Wavenet-D (deep male)
   - en-GB-Wavenet-B (British male)
   
   Neural2 voices (better quality, also FREE):
   - en-US-Neural2-D (deep male, recommended)
   - en-US-Neural2-J (male)
   - en-GB-Neural2-B (British male)

5. Test the endpoint:
   curl -X POST http://localhost:3000/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello, I am TalkTalk. How may I assist you today?","voice":"en-US-Neural2-D"}' \
     --output test.mp3

FREE TIER (Forever):
✅ 1 million characters per month FREE
✅ WaveNet voices included
✅ Neural2 voices included  
✅ No credit card required for free tier
✅ No expiration

PRICING (after free tier):
- WaveNet: $16 per 1 million characters
- Neural2: $16 per 1 million characters
- Standard: $4 per 1 million characters

Quick Setup (5 minutes):
1. npm install @google-cloud/text-to-speech
2. Create project at console.cloud.google.com
3. Enable Text-to-Speech API
4. Create service account & download JSON
5. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
6. Add this code to your server
7. Restart server

That's it! The voice quality is excellent and the free tier should cover personal use.
*/
