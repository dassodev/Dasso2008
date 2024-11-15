import type { NextApiRequest, NextApiResponse } from 'next';
import { lookupWord } from '../../src/lib/cedict-utils';

interface TranslationResponse {
  translation?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranslationResponse>
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

    // Look up the word in CC-CEDICT
    const entry = await lookupWord(text);

    if (entry) {
      // Join all definitions with semicolons for multiple meanings
      const translation = entry.definitions.join('; ');
      return res.status(200).json({ translation });
    }

    // If no translation found
    return res.status(200).json({ translation: 'Translation not available' });
  } catch (error) {
    console.error('Error translating text:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
