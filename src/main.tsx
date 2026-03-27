import { createRoot } from 'react-dom/client'
import './reset.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

const buildId = __APP_BUILD_ID__
const url = new URL(window.location.href)
const urlVersion = url.searchParams.get('v')

if (urlVersion !== buildId) {
  url.searchParams.set('v', buildId)
  window.location.replace(url.toString())
} else {
  createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename="/personal">
      <App />
    </BrowserRouter>,
  )
}
