
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './page/home/Home'
import About from './page/about/About'
import NotFound from './page/not-found/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
