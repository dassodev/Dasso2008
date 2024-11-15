import { useState, useEffect, useCallback } from 'react';
import { dbManager, ReadingProgress } from '../lib/db';

export interface ReadingState {
  scrollPosition: number;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
}

export function useReadingProgress(bookId: string) {
  const [readingState, setReadingState] = useState<ReadingState>({
    scrollPosition: 0,
    currentPage: 1,
    totalPages: 1,
    progressPercentage: 0
  });

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await dbManager.getReadingProgress(bookId);
        if (progress) {
          setReadingState(prevState => ({
            ...prevState,
            scrollPosition: progress.scrollPosition,
            currentPage: progress.currentPage || 1,
            totalPages: progress.totalPages || 1,
            progressPercentage: progress.progressPercentage
          }));
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadProgress();
    }
  }, [bookId]);

  const updateProgress = useCallback(async (update: Partial<ReadingState>) => {
    try {
      const newState = {
        ...readingState,
        ...update
      };

      // Calculate progress percentage based on mode
      const progressPercentage = update.totalPages 
        ? (update.currentPage! / update.totalPages * 100)
        : (update.scrollPosition! / (document.documentElement.scrollHeight - window.innerHeight) * 100);

      const progress: ReadingProgress = {
        bookId,
        scrollPosition: newState.scrollPosition,
        currentPage: newState.currentPage,
        totalPages: newState.totalPages,
        progressPercentage,
        lastRead: new Date()
      };
      
      await dbManager.saveReadingProgress(progress);
      setReadingState(prevState => ({
        ...prevState,
        ...update,
        progressPercentage
      }));
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [bookId, readingState]);

  return {
    ...readingState,
    updateProgress
  };
}
