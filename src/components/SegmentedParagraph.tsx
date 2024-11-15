import React from 'react';
import { isChinese, type Segment } from '../lib/chinese-utils';

interface SegmentedParagraphProps {
  segments: Segment[];
  onWordClick: (word: string, event: React.MouseEvent<HTMLSpanElement>) => void;
  showSpaces?: boolean;
  className?: string;
}

export const SegmentedParagraph: React.FC<SegmentedParagraphProps> = ({
  segments,
  onWordClick,
  showSpaces = true,
  className = '',
}) => {
  return (
    <p className={`mb-4 ${className}`} style={{ textIndent: '2em' }}>
      {segments.map((segment, index) => {
        const isChineseWord = isChinese(segment.word);
        
        // For English text, just render it normally without any styling or spaces
        if (!isChineseWord) {
          return <span key={index}>{segment.word}</span>;
        }

        // For Chinese text, only apply the interactive styling without any additional spaces
        return (
          <span
            key={index}
            className="segment cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={(e) => onWordClick(segment.word, e)}
            role="button"
            aria-label={`Select word: ${segment.word}`}
            tabIndex={0}
          >
            {segment.word}
          </span>
        );
      })}
    </p>
  );
};

export default React.memo(SegmentedParagraph);
