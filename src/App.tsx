
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './page/home/Home'
import Coin from './page/coin/Coin'
import NotFound from './page/not-found/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/coin" element={<Coin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
