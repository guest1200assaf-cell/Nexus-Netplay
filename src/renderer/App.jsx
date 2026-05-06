// src/renderer/App.jsx
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home     from './pages/Home';
import Lobby    from './pages/Lobby';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/lobby"    element={<Lobby />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
