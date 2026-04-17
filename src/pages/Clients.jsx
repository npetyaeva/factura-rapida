import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [name, setName] = useState('')
  const [ruc, setRuc] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data } = await supabase
      .from('clients')
      .select('*, services(count)')
      .order('name')
    setClients(data || [])
  }

  async function addClient() {
    if (!name || !ruc) return
    await supabase.from('clients').insert({ name, ruc, address })
    setName('')
    setRuc('')
    setAddress('')
    fetchClients()
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Clientes</h1>

      <div className="flex flex-col gap-2 mb-6">
        <input className="border p-2 rounded" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="RUC" value={ruc} onChange={e => setRuc(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Dirección" value={address} onChange={e => setAddress(e.target.value)} />
        <button className="bg-black text-white p-2 rounded" onClick={addClient}>Agregar cliente</button>
      </div>

      <ul className="flex flex-col gap-2">
        {clients.map(c => (
          <li key={c.id}>
            <Link to={`/clients/${c.id}`} className="border p-3 rounded flex flex-col block hover:bg-gray-50">
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>{c.ruc} · {c.address}</span>
                  {c.services?.[0]?.count > 0 && (
                    <span className="text-gray-400">{c.services[0].count} servicios</span>
                  )}
                </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}