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
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/lobby"    element={<Lobby />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
