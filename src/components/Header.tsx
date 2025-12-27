import React, { useState, useEffect } from 'react';

export const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Check system preference or local storage
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className="flex justify-between items-start sm:items-center mb-8 sm:mb-12">
      <div>
        <h1 className="text-2xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight">
          Pritam's Creativities
        </h1>
        <p className="mt-1 text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium max-w-[200px] sm:max-w-none">
          Advanced Geometric Partitioning Tool
        </p>
      </div>
      
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 sm:p-3 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-slate-700 text-xl sm:text-2xl"
        aria-label="Toggle Theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  );
};
