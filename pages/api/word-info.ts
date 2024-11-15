import type { NextApiRequest, NextApiResponse } from 'next';
import nodejieba from 'nodejieba';
import { pinyin } from 'pinyin-pro';
import { WordInfo } from '../../src/lib/chinese-utils';

interface WordInfoResponse {
  wordInfo?: WordInfo;
  error?: string;
  details?: any;
}

async function getTranslation(text: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.translation || 'Translation not available';
  } catch (error) {
    console.error('Error fetching translation:', error);
    return 'Translation not available';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WordInfoResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Processing word info request for:', text);

    // Get word segmentation and pinyin with tone marks
    const segments = nodejieba.cut(text);
    const pinyinResult = pinyin(text, { toneType: 'symbol', type: 'array' }).join(' ');

    // Get translation
    const translation = await getTranslation(text);

    const wordInfo: WordInfo = {
      word: text,
      pinyin: pinyinResult,
      segments: segments,
      translation: translation,
      position: {
        start: 0,
        end: text.length
      }
    };

    console.log('Successfully processed word info:', {
      word: text,
      pinyin: pinyinResult,
      segmentsCount: segments.length,
      hasTranslation: !!translation
    });

    return res.status(200).json({ wordInfo });
  } catch (error: any) {
    console.error('Error processing word info:', {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      details: {
        message: error.message
      }
    });
  }
}
