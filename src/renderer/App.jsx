<<<<<<< HEAD
// src/renderer/App.jsx
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home     from './pages/Home';
import Lobby    from './pages/Lobby';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
=======
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home     from './pages/Home';
import Lobby    from './pages/Lobby';
import Settings from './pages/Settings';
import TitleBar from './components/ui/TitleBar';

export default function App() {
  return (
    <>
      {/* Animated background layer */}
      <div className="nexus-bg" aria-hidden="true" />

      {/* Custom frameless title bar */}
      <TitleBar />

      {/* Page routes */}
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/lobby"    element={<Lobby />} />
        <Route path="/settings" element={<Settings />} />
<<<<<<< HEAD
      </Routes>
    </HashRouter>
=======
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  );
}
