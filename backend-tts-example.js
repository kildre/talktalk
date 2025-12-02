// Azure Text-to-Speech Backend Endpoint Example
// Add this to your existing Express server

const sdk = require('microsoft-cognitiveservices-speech-sdk');

// Add this to your Express app
app.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'en-US-GuyNeural', rate = 0.9, pitch = 0.85 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Azure Speech credentials - get these from Azure Portal
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION; // e.g., 'eastus'

    if (!speechKey || !speechRegion) {
      return res.status(500).json({ 
        error: 'Azure Speech credentials not configured',
        message: 'Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables'
      });
    }

    // Configure speech synthesis
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisVoiceName = voice;
    
    // Use SSML for better control over speech
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch > 1 ? '+' : ''}${((pitch - 1) * 100).toFixed(0)}%">
            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </prosody>
        </voice>
      </speak>
    `;

    // Create synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    // Synthesize to array buffer
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          synthesizer.close();
          resolve(result);
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      // Send audio data
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(result.audioData));
    } else {
      console.error('Speech synthesis failed:', result.errorDetails);
      res.status(500).json({ 
        error: 'Speech synthesis failed', 
        details: result.errorDetails 
      });
    }
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

1. Install Azure Speech SDK:
   npm install microsoft-cognitiveservices-speech-sdk

2. Create Azure Speech Service:
   - Go to Azure Portal (portal.azure.com)
   - Create a "Speech Services" resource
   - Get your key and region from "Keys and Endpoint"

3. Set environment variables:
   export AZURE_SPEECH_KEY="your-key-here"
   export AZURE_SPEECH_REGION="eastus"  # or your region

4. Available Premium Voices (HAL-like):
   - en-US-GuyNeural (deep male, professional)
   - en-US-DavisNeural (warm male)
   - en-GB-RyanNeural (British male, authoritative)
   - en-AU-WilliamNeural (Australian male)

5. Test endpoint:
   curl -X POST http://localhost:3000/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello, I am TalkTalk. How may I assist you today?","voice":"en-US-GuyNeural"}' \
     --output test.mp3

Azure Free Tier includes:
- 0.5 million characters per month free
- Neural voices included
- No credit card required for free tier
*/
