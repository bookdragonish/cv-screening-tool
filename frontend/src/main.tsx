import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/styles/globals.css'
import Home from './pages/Home.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
