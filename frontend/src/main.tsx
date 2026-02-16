import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import '@/lib/styles/globals.css'
import Home from '@/pages/Home'
import Layout from './pages/Layout'
import CandidateView from "./pages/CandidateView"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/candidates/" element={<CandidateView />} />
          </Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
