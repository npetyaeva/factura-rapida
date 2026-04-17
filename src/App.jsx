import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Factura from './pages/Factura'
import Clients from './pages/Clients'
import ClientCard from './pages/ClientCard'

function App() {
  return (
    <BrowserRouter>
      <nav className="border-b">
        <div className="max-w-xl mx-auto flex gap-6 p-4">
          <Link to="/">Factura</Link>
          <Link to="/clients">Clientes</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Factura />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientCard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App