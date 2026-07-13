import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme
    let saved = 'light';
    try {
      const stored = localStorage.getItem('stride-theme');
      if (stored === 'light' || stored === 'dark') saved = stored;
    } catch (error) {
      console.error('Failed to load the saved theme:', error);
    }
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('stride-theme', next);
    } catch (error) {
      console.error('Failed to save the selected theme:', error);
    }
  }

  return <Dashboard theme={theme} toggleTheme={toggleTheme} />;
}
