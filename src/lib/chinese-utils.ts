// Type definitions
export interface WordInfo {
  word: string;
  pinyin: string;
  segments: string[];
  translation?: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface Segment {
  word: string
  offset: number
  end: number
}

// Helper function to check if a character is Chinese
export function isChinese(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x4E00 && code <= 0x9FFF;
}

// Helper function to get the character at a specific position in text
export function getCharacterAtPosition(text: string, position: number): string {
  return text.charAt(position);
}

// Helper function to get translation from API
export async function getTranslation(text: string): Promise<string> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  if (!data.translation) {
    throw new Error('Failed to get translation');
  }

  return data.translation;
}

// Helper function to get word info from API
export async function getWordInfo(text: string): Promise<WordInfo> {
  const [wordInfoResponse, translationResponse] = await Promise.all([
    fetch('/api/word-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }),
    fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
  ]);

  const [wordData, translationData] = await Promise.all([
    wordInfoResponse.json(),
    translationResponse.json()
  ]);

  if (!wordData.wordInfo) {
    throw new Error('Failed to get word info');
  }

  return {
    ...wordData.wordInfo,
    translation: translationData.translation
  };
}

// Helper function to segment text from API
export async function segmentText(text: string): Promise<WordInfo[]> {
  const response = await fetch('/api/segment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  if (!data.segmented) {
    throw new Error('Failed to segment text');
  }

  // Get translations for all segments
  const segmentsWithTranslations = await Promise.all(
    data.segmented.map(async (segment: WordInfo) => {
      try {
        const translation = await getTranslation(segment.word);
        return { ...segment, translation };
      } catch (error) {
        console.error(`Failed to get translation for ${segment.word}:`, error);
        return segment;
      }
    })
  );

  return segmentsWithTranslations;
}

export async function fetchSegments(text: string): Promise<Segment[]> {
  const response = await fetch('/api/segment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('Segmentation failed')
  }

  const data = await response.json()
  return data.segments as Segment[]
}
