import React, { useRef, useCallback, useMemo, useEffect, useLayoutEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { isChinese, type Segment } from '../lib/chinese-utils';
import { useSegmentation } from '../hooks/useSegmentation';
import SegmentedParagraph from './SegmentedParagraph';

interface ReflowableContentProps {
  content: string;
  initialFontSize?: number;
  className?: string;
  lineSpacing?: number;
  showSpaces?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  isPaginationEnabled?: boolean;
  onWordSelect?: (word: string, position: { x: number; y: number }) => void;
  onToggleBars?: () => void;
  onTotalPagesChange?: (totalPages: number) => void;
  margin?: number;
  padding?: number;
  bottomBarHeight?: number;
}

interface Page {
  startIndex: number;
  endIndex: number;
}

interface LayoutDimensions {
  containerHeight: number;
  contentHeight: number;
  availableHeight: number;
}

const ITEM_SIZE = 50; // Base height for each paragraph
const BOTTOM_BAR_HEIGHT = 48; // Default bottom bar height
const PAGE_COUNTER_HEIGHT = 32; // Height of the page counter
const MIN_CONTENT_HEIGHT = 100; // Minimum content height to ensure visibility

const ReflowableContent: React.FC<ReflowableContentProps> = ({
  content,
  initialFontSize = 16,
  className = '',
  lineSpacing = 1.5,
  showSpaces = false,
  currentPage,
  onPageChange,
  isPaginationEnabled = false,
  onWordSelect,
  onToggleBars,
  onTotalPagesChange,
  margin = 24,
  padding = 16,
  bottomBarHeight = BOTTOM_BAR_HEIGHT,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [dimensions, setDimensions] = useState<LayoutDimensions>({
    containerHeight: 0,
    contentHeight: 0,
    availableHeight: MIN_CONTENT_HEIGHT,
  });

  // Split content into paragraphs
  const paragraphs = useMemo(() => {
    return content.split('\n').filter(para => para.trim().length > 0);
  }, [content]);

  // Use our custom segmentation hook with showSpaces parameter
  const { segmentedParagraphs, isLoading } = useSegmentation(paragraphs, showSpaces);

  // Calculate layout dimensions
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const totalMargin = margin * 2;
    const totalPadding = padding * 2;
    
    // Calculate heights considering bottom bar and page counter
    const effectiveBottomBarHeight = bottomBarHeight + (isPaginationEnabled ? PAGE_COUNTER_HEIGHT : 0);
    const containerHeight = Math.max(containerRect.height, MIN_CONTENT_HEIGHT + totalMargin + totalPadding);
    const contentHeight = containerHeight - totalMargin;
    const availableHeight = Math.max(contentHeight - effectiveBottomBarHeight, MIN_CONTENT_HEIGHT);

    setDimensions({
      containerHeight,
      contentHeight,
      availableHeight,
    });
  }, [margin, padding, bottomBarHeight, isPaginationEnabled]);

  // Handle layout updates
  useLayoutEffect(() => {
    calculateDimensions();
    
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateDimensions]);

  // Recalculate layout when dependencies change
  useEffect(() => {
    calculateDimensions();
  }, [
    calculateDimensions,
    initialFontSize,
    lineSpacing,
    margin,
    padding,
    bottomBarHeight,
    isPaginationEnabled,
  ]);

  // Calculate pages for pagination mode
  useEffect(() => {
    if (isPaginationEnabled && containerRef.current && contentRef.current) {
      const calculatePages = () => {
        const contentElement = contentRef.current!;
        const newPages: Page[] = [];
        let currentPageData: Page = { startIndex: 0, endIndex: 0 };
        let currentHeight = 0;
        let paraIndex = 0;

        // Create a temporary container to measure paragraphs
        const tempContainer = document.createElement('div');
        tempContainer.style.width = `${contentElement.clientWidth - (margin * 2) - (padding * 2)}px`;
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.fontSize = `${initialFontSize}px`;
        tempContainer.style.lineHeight = `${lineSpacing}`;
        document.body.appendChild(tempContainer);

        while (paraIndex < paragraphs.length) {
          const para = paragraphs[paraIndex];
          tempContainer.textContent = para;
          const paraHeight = tempContainer.offsetHeight;

          if (currentHeight + paraHeight > dimensions.availableHeight) {
            if (currentPageData.startIndex === paraIndex) {
              // Handle case where a single paragraph is too long
              currentPageData.endIndex = paraIndex;
              newPages.push(currentPageData);
              currentPageData = { startIndex: paraIndex + 1, endIndex: paraIndex + 1 };
              currentHeight = 0;
            } else {
              currentPageData.endIndex = paraIndex - 1;
              newPages.push(currentPageData);
              currentPageData = { startIndex: paraIndex, endIndex: paraIndex };
              currentHeight = paraHeight;
            }
          } else {
            currentHeight += paraHeight;
            currentPageData.endIndex = paraIndex;
          }
          paraIndex++;
        }

        if (currentPageData.startIndex <= currentPageData.endIndex) {
          newPages.push(currentPageData);
        }

        document.body.removeChild(tempContainer);
        setPages(newPages);
        const newTotalPages = newPages.length;
        setTotalPages(newTotalPages);
        onTotalPagesChange?.(newTotalPages);

        if (currentPage > newPages.length) {
          onPageChange(1);
        }
      };

      calculatePages();
    }
  }, [
    isPaginationEnabled,
    paragraphs,
    initialFontSize,
    lineSpacing,
    currentPage,
    dimensions.availableHeight,
    onPageChange,
    onTotalPagesChange,
    margin,
    padding,
  ]);

  // Navigation handlers
  const handlePrevPage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Handle word selection
  const handleWordClick = useCallback((word: string, event: React.MouseEvent<HTMLSpanElement>) => {
    if (onWordSelect && isChinese(word)) {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const position = {
          x: rect.left - containerRect.left + (rect.width / 2),
          y: rect.top - containerRect.top
        };
        onWordSelect(word, position);
      }
    }
  }, [onWordSelect]);

  // Handle tap for showing/hiding bars
  const handleContentTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.navigation-edge') && !target.closest('.segment')) {
      onToggleBars?.();
      calculateDimensions();
    }
  }, [onToggleBars, calculateDimensions]);

  // Get the paragraphs for the current view
  const getCurrentParagraphs = useCallback(() => {
    if (!isPaginationEnabled) {
      return {
        paragraphs,
        segmentedParagraphs
      };
    }

    const currentPageData = pages[currentPage - 1];
    if (!currentPageData) {
      return {
        paragraphs: [],
        segmentedParagraphs: []
      };
    }

    return {
      paragraphs: paragraphs.slice(currentPageData.startIndex, currentPageData.endIndex + 1),
      segmentedParagraphs: segmentedParagraphs.slice(currentPageData.startIndex, currentPageData.endIndex + 1)
    };
  }, [isPaginationEnabled, pages, currentPage, paragraphs, segmentedParagraphs]);

  // Render paragraph content
  const renderParagraph = useCallback((paragraph: string, segments: Segment[] | undefined, index: number, style?: React.CSSProperties) => {
    const hasChinese = paragraph.split('').some(char => isChinese(char));
    const paragraphStyle: React.CSSProperties = {
      ...style,
      textIndent: '2em',
      marginBottom: '1em',
      fontSize: `${initialFontSize}px`,
      lineHeight: `${lineSpacing}`,
      wordBreak: 'break-word' as const,
      overflow: 'visible',
    };

    return (
      <div style={paragraphStyle} key={index}>
        {showSpaces && hasChinese && segments ? (
          <SegmentedParagraph
            segments={segments}
            onWordClick={handleWordClick}
            showSpaces={showSpaces}
          />
        ) : (
          <p
            style={{
              margin: 0,
              textIndent: '2em',
              wordBreak: 'break-word' as const,
              overflow: 'visible',
            }}
            role="article"
            aria-label={`Paragraph ${index + 1}`}
            tabIndex={0}
          >
            {paragraph}
          </p>
        )}
      </div>
    );
  }, [showSpaces, handleWordClick, initialFontSize, lineSpacing]);

  // Render row for virtualized list (only used in scroll mode)
  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const { paragraphs: currentParagraphs, segmentedParagraphs: currentSegmentedParagraphs } = getCurrentParagraphs();
    return renderParagraph(currentParagraphs[index], currentSegmentedParagraphs[index], index, style);
  }, [getCurrentParagraphs, renderParagraph]);

  const { paragraphs: currentParagraphs, segmentedParagraphs: currentSegmentedParagraphs } = getCurrentParagraphs();

  return (
    <div 
      className="relative h-full"
      role="document"
      aria-label="Reflowable content reader"
    >
      <div
        ref={containerRef}
        className={`relative h-full ${className}`}
        onClick={handleContentTap}
        role="region"
        aria-label="Content area"
        style={{
          margin: `${margin}px`,
          minHeight: `${MIN_CONTENT_HEIGHT}px`,
        }}
      >
        {isPaginationEnabled && (
          <>
            <div 
              className="navigation-edge absolute left-0 top-0 w-[20%] h-full cursor-w-resize opacity-0 hover:opacity-10 bg-gray-400 transition-opacity z-10" 
              onClick={handlePrevPage}
              aria-label="Previous page area"
            />
            <div 
              className="navigation-edge absolute right-0 top-0 w-[20%] h-full cursor-e-resize opacity-0 hover:opacity-10 bg-gray-400 transition-opacity z-10" 
              onClick={handleNextPage}
              aria-label="Next page area"
            />
          </>
        )}
        
        <div
          ref={contentRef}
          className="h-full"
          style={{
            padding: `${padding}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '4px',
            overflowY: isPaginationEnabled ? 'hidden' : 'auto',
            minHeight: `${MIN_CONTENT_HEIGHT}px`,
          }}
        >
          {isPaginationEnabled ? (
            // Pagination mode: render current page paragraphs directly
            <div className="h-full">
              {currentParagraphs.map((paragraph, index) => 
                renderParagraph(paragraph, currentSegmentedParagraphs[index], index)
              )}
            </div>
          ) : (
            // Scroll mode: use virtualized list
            <List
              ref={listRef}
              height={Math.max(dimensions.availableHeight, MIN_CONTENT_HEIGHT)}
              itemCount={currentParagraphs.length}
              itemSize={ITEM_SIZE}
              width="100%"
              className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
            >
              {renderRow}
            </List>
          )}
        </div>
      </div>

      {isPaginationEnabled && (
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-200 px-3 py-1 rounded"
          onClick={(e) => e.stopPropagation()} // Prevent this from triggering handleContentTap
          style={{
            marginBottom: bottomBarHeight,
          }}
        >
          {currentPage} / {totalPages}
        </div>
      )}
    </div>
  );
};

export default React.memo(ReflowableContent);
