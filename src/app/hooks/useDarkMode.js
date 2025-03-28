import { useState, useEffect } from 'react';

export default function useDarkMode() {
  // Default to false (light mode) during SSR
  const [darkMode, setDarkMode] = useState(false);
  
  // Only run this effect on the client
  useEffect(() => {
    // Now safe to access localStorage (client-side only)
    const isDark = localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    
    // Set initial class on document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      
      // Update localStorage and document class
      if (newMode) {
        localStorage.setItem("theme", "dark");
        document.documentElement.classList.add("dark");
      } else {
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
      }
      
      return newMode;
    });
  };
  
  return [darkMode, toggleDarkMode];
}