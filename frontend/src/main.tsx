import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import '@/lib/styles/globals.css'
import Home from '@/pages/Home'
import Layout from '@/pages/Layout'
import GeminiTestPage from '@/pages/GeminiTestPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route  path="GeminiTestPage" element={<GeminiTestPage />}/>
          </Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
