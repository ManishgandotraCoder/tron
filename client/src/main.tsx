import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ReduxProvider } from './store/ReduxProvider.tsx'
import { AIProvider } from './modules/ai.module.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <AIProvider>
        <App />
      </AIProvider>
    </ReduxProvider>
  </StrictMode>,
)
