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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />

            <Route path="/new-screening" element={<NewScreeningPage />} />

            <Route path="/screening" element={<Screening />} />
            <Route path="/screening-historikk" element={<ScreeningHistory />} />
            <Route path="/screening-historikk/:jobPostId" element={<Screening />} />
            <Route path="/cv-database" element={<CVDatabase />} />
          </Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
