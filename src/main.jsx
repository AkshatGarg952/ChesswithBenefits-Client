import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import ChessLandingPage from './LandPage.jsx';
import ChessDashboard from './Dashboard.jsx';
import LandPage from './LandPage2.jsx';
import './index.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
   
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandPage />} />
          <Route path="/dashboard" element={<ChessDashboard />} />
          <Route path="/game" element={<App />} />
        </Routes>
      </BrowserRouter>

  </StrictMode>
);