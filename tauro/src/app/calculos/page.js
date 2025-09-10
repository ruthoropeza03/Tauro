// src/app/calculos/page.js
'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

export default function Calculos() {
  const [prendas, setPrendas] = useState([])
  const [materiales, setMateriales] = useState([])
  const [selectedPrenda, setSelectedPrenda] = useState('')
  const [selectedTalla, setSelectedTalla] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [resultados, setResultados] = useState(null)
  const [tallasDisponibles, setTallasDisponibles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPrendas()
    fetchMateriales()
  }, [])

  useEffect(() => {
    if (selectedPrenda) {
      fetchTallas(selectedPrenda)
    }
  }, [selectedPrenda])

  const fetchPrendas = async () => {
    try {
      const response = await fetch('/api/prendas')
      const data = await response.json()
      setPrendas(data)
    } catch (error) {
      console.error('Error fetching prendas:', error)
    }
  }

  const fetchMateriales = async () => {
    try {
      const response = await fetch('/api/materiales')
      const data = await response.json()
      setMateriales(data)
    } catch (error) {
      console.error('Error fetching materiales:', error)
    }
  }

  const fetchTallas = async (prendaId) => {
    try {
      const response = await fetch(`/api/prendas/${prendaId}/tallas`)
      const tallas = await response.json()
      setTallasDisponibles(tallas)
      if (tallas.length > 0) {
        setSelectedTalla(tallas[0])
      }
    } catch (error) {
      console.error('Error fetching tallas:', error)
    }
  }

  const calcularPresupuesto = async () => {
    if (!selectedPrenda || !selectedTalla) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/calculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenda_id: selectedPrenda,
          talla: selectedTalla,
          cantidad: parseInt(cantidad)
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setResultados(result)
      } else {
        console.error('Error calculando presupuesto')
      }
    } catch (error) {
      console.error('Error calculando presupuesto:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Cálculos y Presupuestos</h1>
        
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Calcular Presupuesto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Prenda</label>
              <select
                value={selectedPrenda}
                onChange={(e) => setSelectedPrenda(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar prenda</option>
                {prendas.map(prenda => (
                  <option key={prenda.id} value={prenda.id}>
                    {prenda.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Talla</label>
              <select
                value={selectedTalla}
                onChange={(e) => setSelectedTalla(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={!selectedPrenda}
              >
                {tallasDisponibles.map(talla => (
                  <option key={talla} value={talla}>
                    {talla}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Cantidad</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <button
            onClick={calcularPresupuesto}
            disabled={!selectedPrenda || !selectedTalla || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Calculando...' : 'Calcular Presupuesto'}
          </button>
        </div>
        
       
{resultados && (
  <div className="bg-white p-6 rounded shadow-md">
    <h2 className="text-xl font-semibold mb-4">Resultados del cálculo</h2>
    
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-3">Resumen General</h3>
        <p><span className="font-medium">Prenda:</span> {resultados.prenda.nombre}</p>
        <p><span className="font-medium">Talla:</span> {resultados.talla}</p>
        <p><span className="font-medium">Cantidad:</span> {resultados.cantidad} unidades</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-3">Costos Unitarios</h3>
        <p><span className="font-medium">Costo materiales:</span> ${resultados.detalles.costo_materiales_unitario.toFixed(2)}/unidad</p>
        <p><span className="font-medium">Costo fabricación:</span> ${resultados.detalles.costo_fabricacion_unitario.toFixed(2)}/unidad</p>
        <p><span className="font-medium">Precio venta:</span> ${resultados.detalles.precio_venta_unitario.toFixed(2)}/unidad</p>
      </div>
    </div>

    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-red-50 p-4 rounded">
        <h3 className="text-lg font-semibold mb-3">Costos Totales</h3>
        <p><span className="font-medium">Materiales:</span> ${resultados.costo_total_materiales.toFixed(2)}</p>
        <p><span className="font-medium">Fabricación:</span> ${resultados.costo_total_fabricacion.toFixed(2)}</p>
        <p><span className="font-medium">Costo total:</span> ${resultados.costo_total.toFixed(2)}</p>
      </div>
      
      <div className={`p-4 rounded ${
        resultados.ganancia_estimada >= 0 ? 'bg-green-50' : 'bg-orange-50'
      }`}>
        <h3 className="text-lg font-semibold mb-3">Ingresos y Ganancia</h3>
        <p><span className="font-medium">Venta total:</span> ${resultados.precio_total_venta.toFixed(2)}</p>
        <p className={`font-semibold ${
          resultados.ganancia_estimada >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          Ganancia: ${resultados.ganancia_estimada.toFixed(2)}
        </p>
        <p><span className="font-medium">Margen:</span> {resultados.margen_ganancia.toFixed(1)}%</p>
        <p><span className="font-medium">Markup:</span> {resultados.markup.toFixed(1)}%</p>
      </div>
    </div>

    {resultados.ganancia_estimada < 0 && (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="text-yellow-700">
          ⚠️ <strong>Alerta:</strong> La ganancia es negativa. Considera ajustar:
        </p>
        <ul className="list-disc list-inside mt-2 text-yellow-700">
          <li>Reducir costos de materiales</li>
          <li>Optimizar el proceso de fabricación</li>
          <li>Aumentar el precio de venta</li>
          <li>Revisar las cantidades de materiales utilizados</li>
        </ul>
      </div>
    )}

    <div >
      <h3 className="text-lg font-semibold mb-2">Materiales necesarios</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Material</th>
              <th className="p-2 text-left">Cantidad (m)</th>
              <th className="p-2 text-left">Precio/m</th>
              <th className="p-2 text-left">Costo total</th>
            </tr>
          </thead>
          <tbody>
            {resultados.materiales_necesarios.map((material, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-2">{material.nombre}</td>
                <td className="p-2">{material.cantidad_necesaria.toFixed(2)}</td>
                <td className="p-2">${material.precio_por_metro}</td>
                <td className="p-2">${material.costo_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
      </div>
    </Layout>
  )
}