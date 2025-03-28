"use client";

import React from "react";
import useDarkMode from "../hooks/useDarkMode";

const DarkModeToggle = () => {
  const [darkMode, toggleDarkMode] = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default DarkModeToggle;
