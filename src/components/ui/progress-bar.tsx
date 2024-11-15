import React from 'react';

interface ProgressBarProps {
  progress: number;
  isDarkMode: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isDarkMode }) => {
  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 relative">
      <div
        className="absolute h-full transition-all duration-300 ease-in-out"
        style={{
          width: `${progress}%`,
          backgroundColor: isDarkMode ? '#9ca3af' : '#4b5563'
        }}
      />
      <div
        className="absolute -right-6 -top-6 px-2 py-1 text-xs rounded"
        style={{
          backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
          color: isDarkMode ? '#e0e0e0' : '#4b5563'
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;
