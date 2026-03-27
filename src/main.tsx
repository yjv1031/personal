import { createRoot } from 'react-dom/client'
import './reset.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

const BUILD_VERSION_KEY = 'app-build-version'
const buildId = __APP_BUILD_ID__
const previousBuildId = localStorage.getItem(BUILD_VERSION_KEY)
const url = new URL(window.location.href)
const urlVersion = url.searchParams.get('v')

if (urlVersion !== buildId) {
  url.searchParams.set('v', buildId)
  window.location.replace(url.toString())
} else {
  if (previousBuildId !== buildId) {
    localStorage.setItem(BUILD_VERSION_KEY, buildId)

    if (previousBuildId && 'caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .finally(() => window.location.reload())
    }
  }

  createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename="/personal">
      <App />
    </BrowserRouter>,
  )
}
