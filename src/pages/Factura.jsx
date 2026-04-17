import 'react-day-picker/dist/style.css'
import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { supabase } from '../supabase'
import { numeroALetras } from '../utils/numeroALetras'

export default function Factura() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [serviceOwner, setServiceOwner] = useState(null)
  const [services, setServices] = useState([])
  const [date, setDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [lines, setLines] = useState([])
  const calendarRef = useRef(null)

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data || [])
  }

  async function fetchServices(clientId) {
    const { data } = await supabase.from('services').select('*').eq('client_id', clientId).order('name')
    setServices((data || []).sort((a, b) => a.name.localeCompare(b.name)))
    setLines([])
  }

  function handleServiceOwnerChange(clientId) {
    const client = clients.find(c => c.id === clientId)
    setServiceOwner(client)
    fetchServices(clientId)
  }

  function toggleService(service) {
    const exists = lines.find(l => l.id === service.id)
    if (exists) {
      setLines(lines.filter(l => l.id !== service.id))
    } else {
      setLines([...lines, { ...service, price: '', qty: 1 }])
    }
  }

  function updatePrice(id, value) {
    setLines(lines.map(l => l.id === id ? { ...l, price: value } : l))
  }

  function updateQty(id, value) {
    setLines(lines.map(l => l.id === id ? { ...l, qty: value } : l))
  }

  const lines10 = lines.filter(l => l.iva_rate === 10)
  const lines5 = lines.filter(l => l.iva_rate === 5)
  const total10 = lines10.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.qty) || 1), 0)
  const total5 = lines5.reduce((sum, l) => sum + (Number(l.price) || 0) * (Number(l.qty) || 1), 0)
  const total = total10 + total5
  const iva10 = Math.round(total10 / 11)
  const iva5 = Math.round(total5 / 21)

  const formatDate = (d) => {
    return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Factura</h1>

      <div className="flex flex-col gap-3 mb-8">
        <div className="relative">
          <label className="text-sm text-gray-500 block mb-1">Fecha</label>
          <button className="border-2 border-gray-300 p-2 rounded w-full text-left" onClick={() => setShowCalendar(!showCalendar)}>
            {formatDate(date)}
          </button>
          {showCalendar && (
            <div ref={calendarRef} className="absolute z-10 bg-white border rounded shadow-lg mt-1 p-3 text-sm">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={d => { setDate(d || date); setShowCalendar(false) }}
                weekStartsOn={1}
                modifiersClassNames={{ today: 'font-bold' }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Cliente</label>
          <select className="border p-2 rounded w-full" onChange={e => setSelectedClient(clients.find(c => c.id === e.target.value))} defaultValue="">
            <option value="" disabled>Seleccionar cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Servicios de</label>
          <select className="border p-2 rounded w-full" onChange={e => handleServiceOwnerChange(e.target.value)} defaultValue="">
            <option value="" disabled>Seleccionar</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {services.length > 0 && (
          <div>
            <label className="text-sm text-gray-500 block mb-1">Seleccionar servicios</label>
            <div className="flex flex-col gap-2">
              {services.map(s => {
                const line = lines.find(l => l.id === s.id)
                return (
                  <div key={s.id} className="border p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm">{s.name}</div>
                        <div className="text-xs text-gray-400">IVA {s.iva_rate}%</div>
                      </div>
                      <input type="checkbox" checked={!!line} onChange={() => toggleService(s)} />
                    </div>
                    {line && (
                      <div className="flex gap-2 mt-2">
                        <input className="border p-1 rounded w-16 text-sm" placeholder="Cant." value={line.qty} onChange={e => updateQty(s.id, e.target.value)} />
                        <input className="border p-1 rounded flex-1 text-sm" placeholder="Precio unitario" value={line.price} onChange={e => updatePrice(s.id, e.target.value)} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {(selectedClient || lines.length > 0) && (
        <div className="border-t pt-6 flex flex-col gap-4">
          {selectedClient && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Fecha</div>
                <div className="text-sm">{formatDate(date)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Cliente</div>
                <div className="font-medium">{selectedClient.name}</div>
                <div className="text-sm text-gray-500">{selectedClient.ruc}</div>
                <div className="text-sm text-gray-500">{selectedClient.address}</div>
              </div>
            </div>
          )}

          {lines.length > 0 && (
            <>
              <div>
                <div className="text-xs text-gray-400 uppercase mb-2">Servicios</div>
                <div className="flex flex-col gap-1 text-sm">
                  {lines.map(l => (
                    <div key={l.id} className="flex justify-between">
                      <span>{l.name} {Number(l.qty) > 1 ? `× ${l.qty}` : ''}</span>
                      <span>{((Number(l.price) || 0) * (Number(l.qty) || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded flex flex-col gap-1 text-sm">
                {total10 > 0 && <div className="flex justify-between"><span>Subtotal 10%</span><span>{total10.toLocaleString()}</span></div>}
                {total5 > 0 && <div className="flex justify-between"><span>Subtotal 5%</span><span>{total5.toLocaleString()}</span></div>}
                {iva10 > 0 && <div className="flex justify-between text-gray-500"><span>IVA 10%</span><span>{iva10.toLocaleString()}</span></div>}
                {iva5 > 0 && <div className="flex justify-between text-gray-500"><span>IVA 5%</span><span>{iva5.toLocaleString()}</span></div>}
                {(iva10 > 0 && iva5 > 0) && <div className="flex justify-between text-gray-500"><span>Total IVA</span><span>{(iva10 + iva5).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base mt-2 border-t pt-2"><span>Total</span><span>{total.toLocaleString()}</span></div>
                <div className="text-xs text-gray-400 mt-1 italic">{numeroALetras(total)}</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}