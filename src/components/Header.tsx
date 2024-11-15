import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { User, Library, BookOpen, Pencil, FileText, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer px-3 py-1 ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </div>
  )
}

interface HeaderProps {
  isDarkMode: boolean;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  currentTab,
  setCurrentTab,
  setIsProfileMenuOpen,
  toggleDarkMode
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 })

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-primary text-white'}>
      <div className="flex justify-between items-center px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'} w-10 h-10 flex items-center justify-center`}
          onClick={() => setIsProfileMenuOpen(true)}
        >
          <User className="h-5 w-5" />
        </Button>
        <h1 className={`font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}>DassoShu</h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-transparent w-10 h-10 flex items-center justify-center"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <Moon className="h-5 w-5 text-white fill-white" />
          ) : (
            <Sun className="h-5 w-5 text-white fill-white" />
          )}
        </Button>
      </div>
      <div className="flex justify-around items-center py-2">
        <NavItem icon={<Library className="h-7 w-7" />} label="Bookshelf" isActive={currentTab === 'Home'} onClick={() => setCurrentTab('Home')} />
        <NavItem icon={<BookOpen className="h-7 w-7" />} label="Reading" isActive={currentTab === 'Discover'} onClick={() => setCurrentTab('Discover')} />
        <NavItem icon={<Pencil className="h-7 w-7" />} label="Note" isActive={currentTab === 'Font'} onClick={() => setCurrentTab('Font')} />
        <NavItem icon={<FileText className="h-7 w-7" />} label="Flashcards" isActive={currentTab === 'Flashcards'} onClick={() => setCurrentTab('Flashcards')} />
      </div>
    </div>
  )
}

export default Header;
