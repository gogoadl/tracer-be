import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'
import { AlertProvider } from './components/AlertContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

