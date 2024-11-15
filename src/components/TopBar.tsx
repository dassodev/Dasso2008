
import React from 'react'
import { ChevronLeft } from 'lucide-react'

interface TopBarProps {
  title: string;
  onBack: () => void;
  isDarkMode: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ title, onBack, isDarkMode }) => {
  return (
    <div className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} border-b transition-opacity duration-300`}>
      <button
        onClick={onBack}
        className="mr-4 hover:opacity-70 transition-opacity"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-semibold truncate">{title}</h1>
    </div>
  )
}

export default TopBar