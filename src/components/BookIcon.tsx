import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { BookType } from '../types/book'
import { useReadingProgress } from '../hooks/useReadingProgress'

function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3) + '...';
}

const FALLBACK_IMAGE = '/book-covers/cover103.jpg';

interface BookIconProps {
  book: BookType;
  onClick: () => void;
  showReadingProgress: boolean;
}

const BookIcon: React.FC<BookIconProps> = React.memo(({ book, onClick, showReadingProgress }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { progressPercentage } = useReadingProgress(book.id);

  useEffect(() => {
    if (book.cover_image && book.cover_image.trim() !== '') {
      setImgSrc(book.cover_image);
    } else {
      setImgSrc(FALLBACK_IMAGE);
    }
  }, [book.cover_image]);

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative transform translate-y-2">
      <button
        className="w-full h-full relative focus:outline-none focus:ring-2 focus:ring-blue-300 active:opacity-80 touch-manipulation"
        aria-label={`Open ${book.type} file: ${book.title}`}
        onClick={onClick}
      >
        <Image
          src={imgSrc || FALLBACK_IMAGE}
          alt={`Cover for ${book.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-md object-cover shadow-lg"
          onError={handleImageError}
          onLoad={handleImageLoad}
          unoptimized={true}
        />
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <p className="text-black text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center break-words max-w-full">
            {truncateTitle(book.title, 30)}
          </p>
        </div>

        {/* Progress bar */}
        {showReadingProgress && progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-transparent backdrop-blur-[2px] overflow-hidden rounded-b-md">
            <div
              className="h-full bg-black flex items-center justify-end pr-1 text-[6px] font-medium transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="text-white leading-none">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
});

export default BookIcon;