'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ErrorBoundary } from 'react-error-boundary'
import * as pdfjs from 'pdfjs-dist'
import { BookType, UserProfile } from './types/book'
import Auth from './components/Auth'
import Header from './components/Header'
import Bookshelf from './components/Bookshelf'
import BookReader from './components/BookReader'
import BottomBar from './components/BottomBar'
import ProfileMenu from './components/ProfileMenu'
import { ChevronLeft } from 'lucide-react'
import TopBar from './components/TopBar'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DassoShu() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentTab, setCurrentTab] = useState('Home')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [databaseBooks, setDatabaseBooks] = useState<BookType[]>([])
  const [manualBooks, setManualBooks] = useState<BookType[]>([])
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null)
  const [authMessage, setAuthMessage] = useState('')
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('font-sans')
  const [textAlign, setTextAlign] = useState('text-left')
  const [brightness, setBrightness] = useState(100)
  const [activeContainer, setActiveContainer] = useState<string | null>(null)
  const [volume, setVolume] = useState(50)
  const [backgroundColor, setBackgroundColor] = useState('#f5f1e8')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentProfileScreen, setCurrentProfileScreen] = useState<string | null>(null)
  const [showSpaces, setShowSpaces] = useState(false)
  const [segmentedContent, setSegmentedContent] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [hskLevels, setHskLevels] = useState<string[]>([])
  const [showReadingProgress, setShowReadingProgress] = useState(true)
  const [bookshelfBackground, setBookshelfBackground] = useState('bookshelf-background.webp')
  const [margin, setMargin] = useState<number>(24)
  const [padding, setPadding] = useState<number>(16)
  const [lineSpacing, setLineSpacing] = useState(1.5)
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(false)
  const [currentBookPage, setCurrentBookPage] = useState(1)
  const [showBars, setShowBars] = useState(false)

  const fetchHSKLevels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('content_category')
        .not('content_category', 'is', null)

      if (error) throw error

      const levels = Array.from(new Set(data.map(book => book.content_category)))
      setHskLevels(levels)
    } catch (error) {
      console.error('Error fetching HSK levels:', error)
    }
  }, [])

  useEffect(() => {
    fetchHSKLevels()
  }, [fetchHSKLevels])

  const fetchBooksFromSupabase = useCallback(async () => {
    try {
      console.log('Fetching all books from Supabase...')
      const { data, error } = await supabase.from('books').select('*')

      if (error) {
        console.error('Error fetching books:', error)
        throw error
      }

      console.log('Fetched books data:', data)

      if (!data || data.length === 0) {
        console.log('No books found in the database.')
        setDatabaseBooks([])
        return
      }

      const fetchedBooks: BookType[] = await Promise.all(data.map(async (book) => {
        console.log('Processing book:', book.title)
        let content = ''
        if (book.content_url.endsWith('.txt')) {
          console.log('Fetching content for:', book.title, 'from URL:', book.content_url)
          try {
            const response = await fetch(book.content_url, { mode: 'cors' })
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            content = await response.text()
            console.log('Fetched content for:', book.title, 'Content preview:', content.substring(0, 100) + '...')
          } catch (error) {
            console.error('Error fetching book content:', error)
            content = `This is a placeholder content for ${book.title}. The actual content could not be fetched due to an error.`
          }
        }
        return {
          ...book,
          type: book.content_url.split('.').pop() || '',
          content,
        }
      }))

      console.log('Processed books:', fetchedBooks)
      setDatabaseBooks(fetchedBooks)
      console.log('Database books state updated')
    } catch (error) {
      console.error('Error in fetchBooksFromSupabase:', error)
      setDatabaseBooks([])
    }
  }, [])

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
  }, [])

  const segmentText = async (text: string) => {
    try {
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
      const result = await response.json()
      setSegmentedContent(result.segmented.join(' '))
    } catch (error) {
      console.error('Error segmenting text:', error)
      setSegmentedContent('Error segmenting text')
    }
  }

  useEffect(() => {
    if (showSpaces && selectedBook?.content) {
      segmentText(selectedBook.content)
    } else {
      setSegmentedContent(selectedBook?.content || '')
    }
  }, [showSpaces, selectedBook])

  useEffect(() => {
    const checkUserAndFetchBooks = async () => {
      console.log('Checking user authentication...')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('User authenticated:', user.id)
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        console.log('User profile fetched:', data)
        setUserProfile(data)
        setCurrentScreen(4) // Move to home screen
        console.log('Calling fetchBooksFromSupabase...')
        await fetchBooksFromSupabase() // Fetch all books initially
        console.log('fetchBooksFromSupabase completed')
      } else {
        console.log('No authenticated user found')
      }
    }

    checkUserAndFetchBooks()
  }, [fetchBooksFromSupabase])

  useEffect(() => {
    if (currentScreen === 4 && selectedFilter !== 'all') {
      fetchBooksFromSupabase()
    }
  }, [selectedFilter, currentScreen, fetchBooksFromSupabase])

  const readPdfContent = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let content = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        content += textContent.items.map((item: any) => item.str).join(' ') + '\n\n'
      }
      return content
    } catch (error) {
      console.error('Error reading PDF content:', error)
      return 'Error: Unable to read PDF content.'
    }
  }

  const selectBook = useCallback(async (book: BookType) => {
    if (book.type === 'pdf') {
      if (book.file) {
        const content = await readPdfContent(book.file)
        setSelectedBook({ ...book, content })
      } else if (book.content) {
        setSelectedBook(book)
      } else {
        console.error('PDF book has no file or content:', book.title)
        setSelectedBook({ ...book, content: 'Error: Unable to load PDF content.' })
      }
    } else {
      setSelectedBook(book)
    }
    setCurrentTab('Discover')
    setIsFullscreen(true) // Immediately set fullscreen when book is selected
    setShowBars(false) // Initially hide both bars
  }, [readPdfContent])

  const handleReaderClick = (e: React.MouseEvent) => {
    // Don't show/hide bars if clicking on word-related elements
    if (
      (e.target as HTMLElement).closest('.segment') ||
      (e.target as HTMLElement).closest('.word-popover') ||
      window.getSelection()?.toString().trim()
    ) {
      return
    }
    setShowBars(!showBars)
  }

  const handleBackToBookshelf = () => {
    setIsFullscreen(false)
    setSelectedBook(null)
    setCurrentTab('Home')
  }

  const toggleFullscreen = useCallback(() => {
    setShowBars(!showBars)
  }, [showBars])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode)
  }, [isDarkMode])

  const openFileExplorer = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newBooks: BookType[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const id = Math.random().toString(36).substr(2, 9)
        const title = file.name.split('.').slice(0, -1).join('.')
        const type = file.name.split('.').pop() || ''

        let content = ''
        if (type === 'txt') {
          content = await file.text()
        }

        newBooks.push({
          id,
          title,
          author: 'Unknown',
          content_url: URL.createObjectURL(file),
          cover_image: '/book-covers/cover103.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          type,
          content,
          file,
        })
      }
      setManualBooks(prevBooks => [...prevBooks, ...newBooks])
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', data.user.id)
        .single()
      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        setAuthMessage('Login successful, but there was an error fetching your profile.')
        return
      }
      setUserProfile(profileData)
      setAuthMessage('Login successful')
      setCurrentScreen(4) // Move to home screen
    } catch (error: any) {
      setAuthMessage(error.message)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })
      if (error) throw error
      setAuthMessage('Registration successful. Please check your email for verification.')
      setCurrentScreen(3) // Move to verification screen
    } catch (error: any) {
      setAuthMessage(error.message)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setAuthMessage('Logout successful')
      setCurrentScreen(0) // Move to welcome screen
      setIsProfileMenuOpen(false) // Close the profile menu
      setCurrentProfileScreen(null) // Reset the profile screen
      setUserProfile(null) // Clear user profile
    } catch (error: any) {
      setAuthMessage(error.message)
    }
  }

  const updateProfile = async (updatedProfile: UserProfile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)

      if (error) throw error

      setUserProfile(updatedProfile)
      setAuthMessage('Profile updated successfully')
    } catch (error: any) {
      setAuthMessage(error.message)
    }
  }

  const TabContent = () => {
    switch(currentTab) {
      case 'Home':
        return (
          <div className="h-full">
            <Bookshelf
              databaseBooks={databaseBooks}
              manualBooks={manualBooks}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectBook={selectBook}
              openFileExplorer={openFileExplorer}
              hskLevels={hskLevels}
              showReadingProgress={showReadingProgress}
              bookshelfBackground={bookshelfBackground}
            />
          </div>
        )
      case 'Discover':
        return (
          <div className={`h-full flex flex-col ${isFullscreen ? 'absolute inset-0 z-10 bg-white' : ''}`}>
            {selectedBook ? (
              <>
                {isFullscreen && showBars && (
                  <TopBar 
                    title={selectedBook.title}
                    onBack={handleBackToBookshelf}
                    isDarkMode={isDarkMode}
                  />
                )}
                <div 
                  className={`flex-grow overflow-y-auto ${isFullscreen ? 'h-full' : ''}`}
                  onClick={handleReaderClick}
                >
                  <BookReader
                    book={selectedBook}
                    showSpaces={showSpaces}
                    segmentedContent={segmentedContent}
                    isFullscreen={isFullscreen}
                    isDarkMode={isDarkMode}
                    fontFamily={fontFamily}
                    textAlign={textAlign}
                    brightness={brightness}
                    backgroundColor={backgroundColor}
                    fontSize={fontSize}
                    toggleFullscreen={toggleFullscreen}
                    margin={margin}
                    padding={padding}
                    lineSpacing={lineSpacing}
                    isPaginationEnabled={isPaginationEnabled}
                    currentPage={currentBookPage}
                    setCurrentPage={setCurrentBookPage}
                  />
                </div>
                {showBars && (
                  <div className="mt-auto transition-opacity duration-300">
                    <BottomBar
                      activeContainer={activeContainer}
                      setActiveContainer={setActiveContainer}
                      fontSize={fontSize}
                      setFontSize={setFontSize}
                      textAlign={textAlign}
                      setTextAlign={setTextAlign}
                      brightness={brightness}
                      setBrightness={setBrightness}
                      books={[...databaseBooks, ...manualBooks]}
                      selectBook={selectBook}
                      selectedBook={selectedBook}
                      volume={volume}
                      setVolume={setVolume}
                      setBackgroundColor={setBackgroundColor}
                      isDarkMode={isDarkMode}
                      margin={margin}
                      setMargin={setMargin}
                      padding={padding}
                      setPadding={setPadding}
                      lineSpacing={lineSpacing}
                      setLineSpacing={setLineSpacing}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>
                Select a book to read
              </div>
            )}
          </div>
        )
      case 'Font':
        return <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Font Content</div>
      case 'Flashcards':
        return <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Flashcards Content</div>
      default:
        return <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Select a tab</div>
    }
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className={`max-w-md mx-auto border rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
        <div className="h-[600px] bg-background relative">
          {currentScreen <= 3 ? (
            <Auth
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              authMessage={authMessage}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
              {!isFullscreen && (
                <Header
                  isDarkMode={isDarkMode}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  setIsProfileMenuOpen={setIsProfileMenuOpen}
                  toggleDarkMode={toggleDarkMode}
                />
              )}
              <div className="flex-1 overflow-y-auto relative">
                <TabContent />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".txt,.pdf"
                multiple
              />
            </div>
          )}
          {isProfileMenuOpen && (
            <ProfileMenu
              isProfileMenuOpen={isProfileMenuOpen}
              setIsProfileMenuOpen={setIsProfileMenuOpen}
              currentProfileScreen={currentProfileScreen}
              setCurrentProfileScreen={setCurrentProfileScreen}
              userProfile={userProfile}
              handleLogout={handleLogout}
              updateProfile={updateProfile}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              fontSize={fontSize}
              setFontSize={setFontSize}
              textAlign={textAlign}
              setTextAlign={setTextAlign}
              showReadingProgress={showReadingProgress}
              setShowReadingProgress={setShowReadingProgress}
              bookshelfBackground={bookshelfBackground}
              setBookshelfBackground={setBookshelfBackground}
              showSpaces={showSpaces}
              setShowSpaces={setShowSpaces}
              isPaginationEnabled={isPaginationEnabled}
              setIsPaginationEnabled={setIsPaginationEnabled}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
