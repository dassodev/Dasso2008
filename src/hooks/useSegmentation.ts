import { useState, useEffect } from 'react';
import { fetchSegments, type Segment, isChinese } from '../lib/chinese-utils';

export const useSegmentation = (paragraphs: string[], showSpaces: boolean) => {
  const [segmentedParagraphs, setSegmentedParagraphs] = useState<Segment[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const segmentParagraphs = async () => {
      // Only perform segmentation if showSpaces is enabled
      if (!showSpaces) {
        setSegmentedParagraphs([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const segmentedResults = await Promise.all(
          paragraphs.map(async (paragraph) => {
            // Only segment if the paragraph contains Chinese characters
            if (paragraph.split('').some(char => isChinese(char))) {
              return fetchSegments(paragraph);
            }
            // Return English text as a single segment with required Segment properties
            return [{
              word: paragraph,
              offset: 0,
              end: paragraph.length,
              type: 'ENGLISH'
            } as Segment];
          })
        );
        setSegmentedParagraphs(segmentedResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to segment text');
      } finally {
        setIsLoading(false);
      }
    };

    if (paragraphs.length > 0) {
      segmentParagraphs();
    } else {
      setSegmentedParagraphs([]);
    }
  }, [paragraphs, showSpaces]); // Added showSpaces to dependencies

  return {
    segmentedParagraphs,
    isLoading,
    error
  };
};
