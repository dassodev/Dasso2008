'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Volume2, Save, VolumeX } from 'lucide-react'
import { WordInfo } from '../lib/chinese-utils'
import { dbManager, SavedWord } from '../lib/db'

interface WordPopoverProps {
  word: string
  onClose: () => void
  position?: { x: number; y: number } | null
}

export const WordPopover: React.FC<WordPopoverProps> = ({ word, onClose, position }) => {
  const [wordInfo, setWordInfo] = React.useState<WordInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [audioLoading, setAudioLoading] = React.useState(false)
  const [audioError, setAudioError] = React.useState<string | null>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const fetchWordInfo = async () => {
      try {
        // Check cache first
        const cached = await dbManager.getCachedDictionaryEntry(word)
        if (cached) {
          setWordInfo(cached.data)
          setLoading(false)
          return
        }

        // If not cached, fetch from API
        const response = await fetch('/api/word-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: word, type: 'word' }),
        })
        const data = await response.json()
        if (data.wordInfo) {
          setWordInfo(data.wordInfo)
          // Cache the result
          await dbManager.cacheDictionaryEntry({
            word,
            data: data.wordInfo,
            dateAdded: new Date()
          })
        }
      } catch (error) {
        console.error('Error fetching word info:', error)
      } finally {
        setLoading(false)
      }
    }

    if (word) {
      fetchWordInfo()
    }
  }, [word])

  const playAudio = async () => {
    if (!wordInfo) return

    setAudioLoading(true)
    setAudioError(null)

    try {
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile) {
        // Use Azure TTS for mobile devices
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: wordInfo.word }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch audio')
        }

        const blob = await response.blob()
        const audio = new Audio(URL.createObjectURL(blob))
        
        audio.onended = () => {
          setAudioLoading(false)
        }

        audio.onerror = () => {
          setAudioError('Failed to play audio')
          setAudioLoading(false)
        }

        await audio.play()
      } else {
        // Use browser's speech synthesis for desktop
        const utterance = new SpeechSynthesisUtterance(wordInfo.word)
        utterance.lang = 'zh-CN'
        utterance.rate = 0.8
        
        utterance.onend = () => {
          setAudioLoading(false)
        }

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event)
          setAudioError('Failed to play audio')
          setAudioLoading(false)
        }

        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setAudioError('Failed to play audio')
      setAudioLoading(false)
    }
  }

  const saveWord = async () => {
    if (!wordInfo) return

    try {
      const savedWord: SavedWord = {
        id: `${word}-${Date.now()}`,
        word: wordInfo.word,
        pinyin: wordInfo.pinyin,
        translation: wordInfo.translation,
        dateAdded: new Date()
      }

      await dbManager.saveWord(savedWord)
    } catch (error) {
      console.error('Error saving word:', error)
    }
  }

  // Add touch event handling
  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const popover = popoverRef.current
      if (popover && !popover.contains(e.target as Node)) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [onClose])

  const handleTouchMove = (e: TouchEvent) => {
    // Prevent scrolling of the background content when popover is open
    e.preventDefault();
  };

  React.useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const popoverStyle: React.CSSProperties = position ? {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)',
  } : {};

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={popoverRef}
        className="bg-white rounded-lg shadow-lg p-5 w-[90vw] max-w-[320px] animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : wordInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xl font-bold">{wordInfo.word}</span>
              <div className="flex space-x-3">
                <button
                  onClick={playAudio}
                  disabled={audioLoading}
                  className={`p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200 ${
                    audioLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={audioError || 'Play pronunciation'}
                >
                  {audioError ? (
                    <VolumeX className="h-6 w-6 text-red-500" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={saveWord}
                  className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
                  title="Save word"
                >
                  <Save className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="text-base text-gray-600 space-y-3">
              <div className="flex flex-col">
                <span className="font-semibold mb-1">Pinyin</span>
                <span className="text-lg">{wordInfo.pinyin}</span>
              </div>
              {wordInfo.translation && (
                <div className="flex flex-col">
                  <span className="font-semibold mb-1">Translation</span>
                  <span className="text-lg">{wordInfo.translation}</span>
                </div>
              )}
              {wordInfo.segments.length > 1 && (
                <div className="flex flex-col">
                  <span className="font-semibold mb-1">Components</span>
                  <span className="text-lg">{wordInfo.segments.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-center py-4">Failed to load word information</div>
        )}
      </div>
    </div>
  )
}
