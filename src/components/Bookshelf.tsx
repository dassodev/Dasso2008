import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import BookIcon from './BookIcon'
import { BookType } from '../types/book'

interface BookshelfSubheaderProps {
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  hskLevels: string[];
}

const BookshelfSubheader: React.FC<BookshelfSubheaderProps> = ({ selectedFilter, setSelectedFilter, hskLevels }) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 sm:py-3 md:h-14 bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out">
      <span className="text-sm sm:text-base font-medium">Filter</span>
      <Select value={selectedFilter} onValueChange={setSelectedFilter}>
        <SelectTrigger className="w-[140px] sm:w-[180px] text-sm sm:text-base">
          <SelectValue placeholder="Select filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Books</SelectItem>
          <SelectItem value="myBooks">My Books</SelectItem>
          {hskLevels.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface BookshelfProps {
  databaseBooks: BookType[];
  manualBooks: BookType[];
  selectedFilter: string;
  setSelectedFilter: (value: string) => void;
  selectBook: (book: BookType) => void;
  openFileExplorer: () => void;
  hskLevels: string[];
  showReadingProgress: boolean;
  bookshelfBackground: string;
}

const Bookshelf: React.FC<BookshelfProps> = ({
  databaseBooks,
  manualBooks,
  selectedFilter,
  setSelectedFilter,
  selectBook,
  openFileExplorer,
  hskLevels,
  showReadingProgress,
  bookshelfBackground
}) => {
  const [booksPerShelf, setBooksPerShelf] = useState(5);
  const shelfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateBooksPerShelf = () => {
      if (shelfRef.current) {
        const shelfWidth = shelfRef.current.offsetWidth;
        const bookWidth = 100; // Approximate width of a book in pixels
        const calculatedBooksPerShelf = Math.floor(shelfWidth / bookWidth);
        setBooksPerShelf(Math.max(2, calculatedBooksPerShelf)); // Ensure at least 2 books per shelf
      }
    };

    calculateBooksPerShelf();
    window.addEventListener('resize', calculateBooksPerShelf);

    return () => {
      window.removeEventListener('resize', calculateBooksPerShelf);
    };
  }, []);

  const filteredBooks = useMemo(() => {
    if (selectedFilter === 'all') {
      return [...databaseBooks, ...manualBooks];
    } else if (selectedFilter === 'myBooks') {
      return manualBooks;
    } else {
      return databaseBooks.filter(book => book.content_category === selectedFilter);
    }
  }, [databaseBooks, manualBooks, selectedFilter]);

  const MIN_SHELVES = 3;
  const shelves = useMemo(() => {
    const result = [];
    const totalShelves = Math.max(MIN_SHELVES, Math.ceil(filteredBooks.length / booksPerShelf));
    for (let i = 0; i < totalShelves; i++) {
      result.push({
        id: i + 1,
        books: filteredBooks.slice(i * booksPerShelf, (i + 1) * booksPerShelf)
      });
    }
    return result;
  }, [filteredBooks, booksPerShelf]);

  return (
    <div className="h-full relative overflow-hidden">
      <BookshelfSubheader
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        hskLevels={hskLevels}
      />
      <ScrollArea className="h-full">
        <div className="relative">
          {shelves.map((shelf) => (
            <div
              key={shelf.id}
              className="relative h-[25vh] min-h-[150px]"
              style={{
                backgroundImage: `url("/${bookshelfBackground}")`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div
                ref={shelfRef}
                className="absolute bottom-4 left-0 right-0 w-full grid gap-3 sm:gap-4 px-4 sm:px-6 md:px-8"
                style={{ gridTemplateColumns: `repeat(${booksPerShelf}, 1fr)` }}
              >
                {shelf.books.map((book) => (
                  <div key={book.id} className="aspect-[3/4] relative">
                    <BookIcon
                      book={book}
                      onClick={() => selectBook(book)}
                      showReadingProgress={showReadingProgress}
                    />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, booksPerShelf - shelf.books.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-[3/4] relative" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 z-20 bg-primary text-white hover:bg-primary/90 rounded-full p-2"
        onClick={openFileExplorer}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Bookshelf;