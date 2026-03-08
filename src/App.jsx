import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('stride-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('stride-theme', next);
  }

  return <Dashboard theme={theme} toggleTheme={toggleTheme} />;
}
