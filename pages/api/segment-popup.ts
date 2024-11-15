import type { NextApiRequest, NextApiResponse } from 'next';
import nodejieba from 'nodejieba';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'Invalid text input' });
    }

    // Optimize for short text segments (popup use case)
    const segments = nodejieba.cut(text, true);
    
    return res.status(200).json({ segments });
  } catch (error) {
    console.error('Popup segmentation error:', error);
    return res.status(500).json({ message: 'Error processing text' });
  }
}
