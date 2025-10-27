import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './app/store'
import App from './App'
import { ToastProvider } from './components/Toast'
import './main.css'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </ToastProvider>
    </Provider>
  </StrictMode>,
)
