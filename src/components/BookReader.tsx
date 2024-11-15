'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Battery } from 'lucide-react'
import { BookType } from '../types/book'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { WordPopover } from './WordPopover'
import ReflowableContent from './ReflowableContent'

interface BookReaderProps {
  book: BookType;
  showSpaces: boolean;
  segmentedContent: string;
  isFullscreen: boolean;
  isDarkMode: boolean;
  fontFamily: string;
  textAlign: string;
  brightness: number;
  backgroundColor: string;
  fontSize: number;
  toggleFullscreen: () => void;
  margin: number;
  padding: number;
  lineSpacing: number;
  isPaginationEnabled?: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  showSpaces,
  segmentedContent,
  isFullscreen,
  isDarkMode,
  fontFamily,
  textAlign,
  brightness,
  backgroundColor,
  fontSize,
  toggleFullscreen,
  margin,
  padding,
  lineSpacing,
  isPaginationEnabled = false,
  currentPage,
  setCurrentPage,
}) => {
  const content = book.content || ''
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [showBars, setShowBars] = useState(true)
  const { scrollPosition, progressPercentage, updateProgress } = useReadingProgress(book.id)
  const contentRef = useRef<string>(content)
  const scrollRestoredRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const scrollRestoreAttempts = useRef(0)
  const maxRestoreAttempts = 5
  const restoreIntervalRef = useRef<NodeJS.Timeout>()
  const barsTimeoutRef = useRef<NodeJS.Timeout>()
  const [totalPages, setTotalPages] = useState(1)

  // Handle bars visibility with timeout
  const handleToggleBars = () => {
    setShowBars(prev => !prev)
    
    // Clear any existing timeout
    if (barsTimeoutRef.current) {
      clearTimeout(barsTimeoutRef.current)
    }

    // If showing bars, set timeout to hide them
    if (!showBars) {
      barsTimeoutRef.current = setTimeout(() => {
        setShowBars(false)
      }, 3000)
    }
  }

  // Update reading progress when page or scroll changes
  useEffect(() => {
    if (isPaginationEnabled) {
      updateProgress({
        scrollPosition: 0, // Reset scroll position in pagination mode
        currentPage,
        totalPages,
        progressPercentage: (currentPage / totalPages) * 100
      });
    } else if (contentRef.current) {
      const target = document.getElementById('book-content');
      if (target) {
        const maxScroll = target.scrollHeight - target.clientHeight;
        const currentProgress = maxScroll > 0 ? (target.scrollTop / maxScroll) * 100 : 0;
        updateProgress({
          scrollPosition: target.scrollTop,
          currentPage: 1,
          totalPages: 1,
          progressPercentage: currentProgress
        });
      }
    }
  }, [isPaginationEnabled, currentPage, totalPages, updateProgress]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (barsTimeoutRef.current) {
        clearTimeout(barsTimeoutRef.current)
      }
    }
  }, [])

  // Handle scroll position restoration
  useEffect(() => {
    const restoreScrollPosition = () => {
      if (!isPaginationEnabled && contentRef.current && scrollPosition > 0 && !scrollRestoredRef.current) {
        const target = document.getElementById('book-content')
        if (target) {
          target.scrollTop = scrollPosition
          
          if (Math.abs(target.scrollTop - scrollPosition) < 10) {
            scrollRestoredRef.current = true
            scrollRestoreAttempts.current = 0
            if (restoreIntervalRef.current) {
              clearInterval(restoreIntervalRef.current)
            }
          } else {
            scrollRestoreAttempts.current++
            if (scrollRestoreAttempts.current >= maxRestoreAttempts) {
              if (restoreIntervalRef.current) {
                clearInterval(restoreIntervalRef.current)
              }
            }
          }
        }
      }
    }

    if (restoreIntervalRef.current) {
      clearInterval(restoreIntervalRef.current)
    }

    if (content !== contentRef.current) {
      scrollRestoredRef.current = false
      scrollRestoreAttempts.current = 0
      contentRef.current = content
    }

    if (!isPaginationEnabled) {
      restoreScrollPosition()

      if (!scrollRestoredRef.current) {
        restoreIntervalRef.current = setInterval(restoreScrollPosition, 100)
      }
    }

    return () => {
      if (restoreIntervalRef.current) {
        clearInterval(restoreIntervalRef.current)
      }
    }
  }, [content, scrollPosition, isPaginationEnabled])

  return (
    <div
      className={`relative flex flex-col h-full w-full overflow-hidden transition-all duration-300 ease-in-out ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${fontFamily}`}
      style={{
        filter: `brightness(${brightness}%)`,
        backgroundColor: isDarkMode ? '#1a1a1a' : backgroundColor,
        color: isDarkMode ? '#e0e0e0' : 'inherit',
      } as React.CSSProperties}
    >
      {/* Main Content Container */}
      <div className="relative flex-1 overflow-hidden">
        <ReflowableContent
          content={content}
          initialFontSize={fontSize}
          className={textAlign}
          lineSpacing={lineSpacing}
          showSpaces={showSpaces}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isPaginationEnabled={isPaginationEnabled}
          onWordSelect={(word, position) => {
            setSelectedWord(word)
            setPopoverPosition(position)
          }}
          onToggleBars={handleToggleBars}
          onTotalPagesChange={setTotalPages}
          margin={margin}
          padding={padding}
        />
      </div>

      {/* Fixed Footer */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[60] transition-transform duration-300 ease-in-out ${
          showBars ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : backgroundColor,
          borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        }}
      >
        <Footer
          isDarkMode={isDarkMode}
          backgroundColor={backgroundColor}
          currentPage={currentPage}
          totalPages={totalPages}
          isPaginationEnabled={isPaginationEnabled}
          progressPercentage={progressPercentage}
        />
      </div>

      {selectedWord && (
        <WordPopover
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  )
}

interface FooterProps {
  isDarkMode: boolean;
  backgroundColor: string;
  currentPage: number;
  totalPages: number;
  isPaginationEnabled: boolean;
  progressPercentage: number;
}

const Footer: React.FC<FooterProps> = ({
  isDarkMode,
  backgroundColor,
  currentPage,
  totalPages,
  isPaginationEnabled,
  progressPercentage
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setBatteryLevel(Math.round(battery.level * 100))

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100))
          })
        } catch (error) {
          console.error('Error accessing battery status:', error)
          setBatteryLevel(null)
        }
      } else {
        console.log('Battery Status API not supported')
        setBatteryLevel(null)
      }
    }

    updateBattery()

    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="p-4 flex justify-between items-center text-sm"
      style={{
        color: isDarkMode ? '#9ca3af' : '#4b5563',
      }}
    >
      <div className="flex items-center space-x-4">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {batteryLevel !== null && (
          <div className="flex items-center space-x-1">
            <Battery className="h-4 w-4" />
            <span>{batteryLevel}%</span>
          </div>
        )}
        <div>
          {isPaginationEnabled ? (
            <span>Page {currentPage} of {totalPages}</span>
          ) : (
            <span>{Math.round(progressPercentage)}% completed</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookReader
