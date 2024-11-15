import type { NextApiRequest, NextApiResponse } from 'next'
import nodejieba from 'nodejieba'

interface Segment {
  word: string
  offset: number
  end: number
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ segments: Segment[] } | { error: string }>
) {
  if (req.method === 'POST') {
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    try {
      // Get segments with accurate position tracking
      const segments = nodejieba.cut(text)
      let currentOffset = 0
      
      const segmentsWithPosition: Segment[] = segments.map(word => {
        const segment = {
          word,
          offset: currentOffset,
          end: currentOffset + word.length
        }
        currentOffset += word.length
        return segment
      })

      res.status(200).json({ segments: segmentsWithPosition })
    } catch (error) {
      console.error('Segmentation error:', error)
      res.status(500).json({ error: 'Failed to segment text' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}