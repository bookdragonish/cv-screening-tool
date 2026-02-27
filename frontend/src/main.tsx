import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import '@/lib/styles/globals.css'
import Home from '@/pages/Home'
import Layout from '@/pages/Layout'
import GeminiTestPage from '@/pages/GeminiTestPage'
import ScreeningFlowPage from '@/pages/screening/ScreeningFlowPage'
import NewScreeningPage from '@/pages/screening/NewScreeningPage'
import ScreeningResultsPage from '@/pages/screening/ScreeningResultsPage'
import ScreeningCandidatePage from '@/pages/screening/ScreeningCandidatePage'
import Screening from '@/pages/Screening'
import ScreeningHistory from '@/pages/ScreeningHistory'
import CVDatabase from '@/pages/CVDatabase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route  path="GeminiTestPage" element={<GeminiTestPage />}/>
            <Route path="/screening-flow" element={<ScreeningFlowPage />}>
              <Route index element={<Navigate to="new-screening" replace />} />
              <Route path="new-screening" element={<NewScreeningPage />} />
              <Route path="results" element={<ScreeningResultsPage />} />
              <Route path="results/:candidateId" element={<ScreeningCandidatePage />} />
            </Route>
            <Route path="/screening" element={<Screening />} />
            <Route path="/screening-historikk" element={<ScreeningHistory />} />
            <Route path="/screening-historikk/:jobPostId" element={<Screening />} />
            <Route path="/cv-database" element={<CVDatabase />} />
          </Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
