import { useState } from 'react';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [page, setPage] = useState('home');

  return page === 'home'
    ? <Landing onEnter={() => setPage('app')} />
    : <Dashboard onHome={() => setPage('home')} />;
}
