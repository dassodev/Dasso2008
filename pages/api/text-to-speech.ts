import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

interface ErrorResponse {
  error: string;
  details?: any;
}

if (!AZURE_KEY || !AZURE_REGION) {
  console.error('Azure Speech credentials not configured properly:',
    {
      keyPresent: !!AZURE_KEY,
      regionPresent: !!AZURE_REGION,
      region: AZURE_REGION
    }
  );
}

async function getAccessToken(): Promise<string> {
  try {
    console.log('Requesting Azure access token...');
    const response = await axios.post(
      `https://${AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('Successfully obtained Azure access token');
    return response.data;
  } catch (error: any) {
    console.error('Error getting Azure access token:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('Failed to get Azure access token');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!AZURE_KEY || !AZURE_REGION) {
    return res.status(500).json({ 
      error: 'Azure Speech credentials not configured',
      details: {
        keyPresent: !!AZURE_KEY,
        regionPresent: !!AZURE_REGION,
        region: AZURE_REGION
      }
    });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Processing text-to-speech request for:', text);
    const accessToken = await getAccessToken();

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="zh-CN-XiaoxiaoNeural">
          ${text}
        </voice>
      </speak>
    `;

    console.log('Requesting speech synthesis...');
    const response = await axios.post(
      `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      ssml,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        responseType: 'arraybuffer',
      }
    );

    console.log('Successfully generated speech audio');
    const audioBuffer = Buffer.from(response.data);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error: any) {
    console.error('Error generating speech:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({ 
      error: 'Failed to generate speech',
      details: {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    });
  }
}
