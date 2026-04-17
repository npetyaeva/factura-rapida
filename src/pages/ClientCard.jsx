import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Pencil, Trash2, X, Check } from 'lucide-react'

export default function ClientCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [editing, setEditing] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', ruc: '', address: '' })
  const [services, setServices] = useState([])
  const [name, setName] = useState('')
  const [ivaRate, setIvaRate] = useState(10)
  const [editingService, setEditingService] = useState(null)

  useEffect(() => {
    fetchClient()
    fetchServices()
  }, [])

  async function fetchClient() {
    const { data } = await supabase.from('clients').select('*').eq('id', id).single()
    setClient(data)
    setClientForm({ name: data.name, ruc: data.ruc, address: data.address || '' })
  }

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').eq('client_id', id).order('name')
    setServices(data || [])
  }

  async function saveClient() {
    await supabase.from('clients').update(clientForm).eq('id', id)
    setEditing(false)
    fetchClient()
  }

  async function deleteClient() {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    navigate('/clients')
  }

  async function addService() {
    if (!name) return
    await supabase.from('services').insert({ client_id: id, name, iva_rate: ivaRate })
    setName('')
    fetchServices()
  }

  async function saveService(service) {
    await supabase.from('services').update({ name: service.name, iva_rate: service.iva_rate }).eq('id', service.id)
    setEditingService(null)
    fetchServices()
  }

  async function deleteService(serviceId) {
    await supabase.from('services').delete().eq('id', serviceId)
    fetchServices()
  }

  if (!client) return <div className="p-4">Cargando...</div>

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Link to="/clients" className="text-sm text-gray-500 hover:underline mb-4 block">← Clientes</Link>

      {editing ? (
        <div className="flex flex-col gap-2 mb-6">
          <input className="border p-2 rounded" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Nombre" />
          <input className="border p-2 rounded" value={clientForm.ruc} onChange={e => setClientForm({ ...clientForm, ruc: e.target.value })} placeholder="RUC" />
          <input className="border p-2 rounded" value={clientForm.address} onChange={e => setClientForm({ ...clientForm, address: e.target.value })} placeholder="Dirección" />
          <div className="flex gap-2">
            <button className="bg-black text-white p-2 rounded flex-1 flex items-center justify-center gap-1" onClick={saveClient}><Check size={16} /> Guardar</button>
            <button className="border p-2 rounded flex-1 flex items-center justify-center gap-1" onClick={() => setEditing(false)}><X size={16} /> Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold">{client.name}</h1>
            <div className="text-sm text-gray-500">{client.ruc} · {client.address}</div>
          </div>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-black" onClick={() => setEditing(true)}><Pencil size={18} /></button>
            <button className="text-gray-400 hover:text-red-500" onClick={deleteClient}><Trash2 size={18} /></button>
          </div>
        </div>
      )}

      <h2 className="font-semibold mb-2">Servicios</h2>

      <div className="flex flex-col gap-2 mb-6">
        <input className="border p-2 rounded" placeholder="Nombre del servicio" value={name} onChange={e => setName(e.target.value)} />
        <select className="border p-2 rounded" value={ivaRate} onChange={e => setIvaRate(Number(e.target.value))}>
          <option value={10}>IVA 10%</option>
          <option value={5}>IVA 5%</option>
        </select>
        <button className="bg-black text-white p-2 rounded" onClick={addService}>Agregar servicio</button>
      </div>

      <ul className="flex flex-col gap-2">
        {services.map(s => (
          <li key={s.id} className="border p-3 rounded">
            {editingService?.id === s.id ? (
              <div className="flex flex-col gap-2">
                <input className="border p-1 rounded text-sm" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
                <select className="border p-1 rounded text-sm" value={editingService.iva_rate} onChange={e => setEditingService({ ...editingService, iva_rate: Number(e.target.value) })}>
                  <option value={10}>IVA 10%</option>
                  <option value={5}>IVA 5%</option>
                </select>
                <div className="flex gap-2">
                  <button className="bg-black text-white p-1 rounded text-sm flex-1 flex items-center justify-center gap-1" onClick={() => saveService(editingService)}><Check size={14} /> Guardar</button>
                  <button className="border p-1 rounded text-sm flex-1 flex items-center justify-center gap-1" onClick={() => setEditingService(null)}><X size={14} /> Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div>{s.name}</div>
                  <div className="text-sm text-gray-500">IVA {s.iva_rate}%</div>
                </div>
                <div className="flex gap-3">
                  <button className="text-gray-400 hover:text-black" onClick={() => setEditingService(s)}><Pencil size={16} /></button>
                  <button className="text-gray-400 hover:text-red-500" onClick={() => deleteService(s.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}