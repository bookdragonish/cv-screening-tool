import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import '@/lib/styles/globals.css'
import Home from '@/pages/Home'
import Layout from '@/pages/Layout'
import NewScreeningPage from '@/pages/NewScreeningPage'
import Screening from '@/pages/Screening'
import ScreeningHistory from '@/pages/ScreeningHistory'
import CVDatabase from '@/pages/CVDatabase'
import Candidate from './pages/Candidate'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/pages/ProtectedRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/ny-skanning" element={<NewScreeningPage />} />
              <Route path="/skanning-historikk" element={<ScreeningHistory />} />
              <Route path="/skanning-historikk/:jobPostId" element={<Screening />} />
              <Route path="/kandidater" element={<CVDatabase />} />
            </Route>
          </Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
