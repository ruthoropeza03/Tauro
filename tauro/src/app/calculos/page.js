// src/app/calculos/page.js
'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

export default function Calculos() {
  const [prendas, setPrendas] = useState([])
  const [prendasUnicas, setPrendasUnicas] = useState([])
  const [selectedPrenda, setSelectedPrenda] = useState('')
  const [selectedGrupoTallas, setSelectedGrupoTallas] = useState('')
  const [gruposDisponibles, setGruposDisponibles] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    fetchPrendas()
  }, [])

  useEffect(() => {
    if (selectedPrenda) {
      fetchGruposDisponibles(selectedPrenda)
    }
  }, [selectedPrenda])

  const fetchPrendas = async () => {
    try {
      const response = await fetch('/api/prendas')
      const data = await response.json()
      setPrendas(data)
      
      // Filtrar prendas únicas por nombre
      const uniquePrendas = [];
      const seenNames = new Set();
      
      for (const prenda of data) {
        if (!seenNames.has(prenda.nombre)) {
          seenNames.add(prenda.nombre);
          uniquePrendas.push(prenda);
        }
      }
      
      setPrendasUnicas(uniquePrendas);
    } catch (error) {
      console.error('Error fetching prendas:', error)
    }
  }

  const fetchGruposDisponibles = async (prendaNombre) => {
    try {
      const response = await fetch(`/api/calculos?prenda_nombre=${encodeURIComponent(prendaNombre)}`)
      if (!response.ok) {
        throw new Error('Error al obtener grupos de tallas')
      }
      const data = await response.json()
      
      if (data.success) {
        setSelectedGrupoTallas('')
        setGruposDisponibles(data.grupos_disponibles || [])
      }
    } catch (error) {
      console.error('Error fetching grupos de tallas:', error)
      setGruposDisponibles([])
    }
  }

  const calcularPresupuesto = async () => {
    if (!selectedPrenda || !selectedGrupoTallas) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/calculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenda_nombre: selectedPrenda,
          grupo_tallas: selectedGrupoTallas,
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

  // Paginación para materiales
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMaterials = resultados?.materiales_necesarios?.slice(indexOfFirstItem, indexOfLastItem) || []
  const totalPages = Math.ceil((resultados?.materiales_necesarios?.length || 0) / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Función para obtener el nombre del grupo de tallas
  const getNombreGrupoTallas = (grupo) => {
    switch (grupo) {
      case 'XS-S-M-L-XL': return 'XS, S, M, L, XL'
      case '2XL-3XL': return '2XL, 3XL'
      case '4XL': return '4XL'
      default: return grupo
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-primary mb-6">Cálculos y Presupuestos</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-secondary mb-4">Calcular Presupuesto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-secondary mb-2 font-medium">Prenda</label>
              <select
                value={selectedPrenda}
                onChange={(e) => setSelectedPrenda(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar prenda</option>
                {prendasUnicas.map(prenda => (
                  <option key={prenda.nombre} value={prenda.nombre}>
                    {prenda.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-secondary mb-2 font-medium">Grupo de Tallas</label>
              <select
                value={selectedGrupoTallas}
                onChange={(e) => setSelectedGrupoTallas(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!selectedPrenda}
              >
                <option value="">Seleccionar grupo</option>
                {gruposDisponibles.map(grupo => (
                  <option key={grupo} value={grupo}>
                    {getNombreGrupoTallas(grupo)}
                  </option>
                ))}
              </select>
              {gruposDisponibles.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Grupos disponibles: {gruposDisponibles.map(g => getNombreGrupoTallas(g)).join(', ')}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-secondary mb-2 font-medium">Cantidad</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <button
            onClick={calcularPresupuesto}
            disabled={!selectedPrenda || !selectedGrupoTallas || loading}
            className="bg-primary text-accent px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculando...' : 'Calcular Presupuesto'}
          </button>
        </div>
        
        {resultados && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-secondary mb-4">Resultados del cálculo</h2>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-accent/30 p-4 rounded">
                <h3 className="text-lg font-semibold text-secondary mb-3">Resumen General</h3>
                <p className="text-secondary"><span className="font-medium">Prenda:</span> {resultados.prenda.nombre}</p>
                <p className="text-secondary"><span className="font-medium">Grupo de Tallas:</span> {getNombreGrupoTallas(resultados.grupo_tallas)}</p>
                <p className="text-secondary"><span className="font-medium">Cantidad:</span> {resultados.cantidad} unidades</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-secondary mb-3">Costos</h3>
                <p className="text-secondary"><span className="font-medium">Costo materiales unitario:</span> ${resultados.detalles.costo_materiales_unitario.toFixed(2)}/unidad</p>
                <p className="text-secondary"><span className="font-medium">Costo total materiales:</span> ${resultados.costo_total_materiales.toFixed(2)}</p>
              </div>
            </div>

            {/* Nuevos precios sugeridos */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-secondary mb-3">Precios Sugeridos</h3>
                <p className="text-secondary"><span className="font-medium">Precio al detal (+70%):</span> ${resultados.precios_sugeridos.detal.toFixed(2)}/unidad</p>
                <p className="text-secondary"><span className="font-medium">Precio al mayor (+50%):</span> ${resultados.precios_sugeridos.mayor.toFixed(2)}/unidad</p>
                <p className="text-sm text-gray-500 mt-2">
                  * Basado en el costo de materiales unitario
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-secondary mb-3">Comparación de Ganancia</h3>
                <p className="text-secondary"><span className="font-medium">Ganancia al detal:</span> ${((resultados.precios_sugeridos.detal - resultados.detalles.costo_materiales_unitario) * resultados.cantidad).toFixed(2)}</p>
                <p className="text-secondary"><span className="font-medium">Ganancia al mayor:</span> ${((resultados.precios_sugeridos.mayor - resultados.detalles.costo_materiales_unitario) * resultados.cantidad).toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary mb-4">Materiales necesarios</h3>
              <div className="overflow-x-auto max-h-96">
                <table className="table-custom w-full">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Cantidad Total (m)</th>
                      <th>Precio/m</th>
                      <th>Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMaterials.map((material, index) => (
                      <tr key={index}>
                        <td className="font-medium">{material.nombre}</td>
                        <td>{material.cantidad_necesaria.toFixed(2)}</td>
                        <td>${material.precio_por_metro}</td>
                        <td>${material.costo_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación para materiales */}
              {resultados.materiales_necesarios.length > itemsPerPage && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-accent transition-colors"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-accent'
                          : 'border border-primary text-primary hover:bg-primary hover:text-accent'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-accent transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              <div className="mt-2 text-sm text-secondary text-center">
                Mostrando {currentMaterials.length} de {resultados.materiales_necesarios.length} materiales
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}