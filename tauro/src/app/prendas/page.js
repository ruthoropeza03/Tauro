// src/app/prendas/page.js
'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

export default function Prendas() {
  const [prendas, setPrendas] = useState([])
  const [materiales, setMateriales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [selectedPrenda, setSelectedPrenda] = useState(null)
  const [prendaMaterials, setPrendaMaterials] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_fabricacion: '0.00', // Valor por defecto
    precio_venta: ''
  })
  const [materialFormData, setMaterialFormData] = useState({
    material_id: '',
    cantidad: '',
    talla: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [costoMateriales, setCostoMateriales] = useState(0) // Nuevo estado para el costo

  useEffect(() => {
    fetchPrendas()
    fetchMateriales()
  }, [])

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

  const fetchPrendaMaterials = async (prendaId) => {
    try {
      const response = await fetch(`/api/prendas/${prendaId}/materiales`)
      const data = await response.json()
      setPrendaMaterials(data)
      
      // Calcular el costo total de materiales
      const costoTotal = data.reduce((total, material) => {
        return total + (material.cantidad * material.precio_por_metro)
      }, 0)
      setCostoMateriales(costoTotal)
      
      // Actualizar automáticamente el precio de fabricación
      setFormData(prev => ({
        ...prev,
        precio_fabricacion: costoTotal.toFixed(2)
      }))
    } catch (error) {
      console.error('Error fetching materiales de prenda:', error)
    }
  }

  const calcularCostoMateriales = (materiales) => {
    return materiales.reduce((total, material) => {
      return total + (material.cantidad * material.precio_por_metro)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/prendas', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId,
          ...formData
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (editingId) {
          setPrendas(prendas.map(p => p.id === editingId ? result.prenda : p))
        } else {
          setPrendas([...prendas, result.prenda])
        }
        
        setFormData({ 
          nombre: '', 
          descripcion: '', 
          precio_fabricacion: '0.00', 
          precio_venta: '' 
        })
        setEditingId(null)
        setShowForm(false)
        fetchPrendas()
      }
    } catch (error) {
      console.error('Error guardando prenda:', error)
    }
  }

  const handleEdit = (prenda) => {
    setFormData({
      nombre: prenda.nombre,
      descripcion: prenda.descripcion || '',
      precio_fabricacion: prenda.precio_fabricacion || '0.00',
      precio_venta: prenda.precio_venta || ''
    })
    setEditingId(prenda.id)
    setShowForm(true)
    
    // Cargar materiales para calcular costo
    fetchPrendaMaterials(prenda.id)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta prenda?')) {
      try {
        const response = await fetch(`/api/prendas?id=${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setPrendas(prendas.filter(p => p.id !== id))
          fetchPrendas()
        }
      } catch (error) {
        console.error('Error eliminando prenda:', error)
      }
    }
  }

  const handleAddMaterial = (prenda) => {
    setSelectedPrenda(prenda)
    setMaterialFormData({ material_id: '', cantidad: '', talla: '' })
    setShowMaterialForm(true)
  }

  const handleMaterialSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/prendas/material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenda_id: selectedPrenda.id,
          ...materialFormData
        }),
      })
      
      if (response.ok) {
        setMaterialFormData({ material_id: '', cantidad: '', talla: '' })
        setShowMaterialForm(false)
        
        // Recalcular costos después de agregar material
        if (editingId) {
          await fetchPrendaMaterials(selectedPrenda.id)
        }
        fetchPrendas()
      }
    } catch (error) {
      console.error('Error agregando material a prenda:', error)
    }
  }

  const handleViewMaterials = async (prenda) => {
    setSelectedPrenda(prenda)
    await fetchPrendaMaterials(prenda.id)
    setShowMaterialsModal(true)
  }

  const handleDeleteMaterial = async (materialPrendaId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este material de la prenda?')) {
      try {
        const response = await fetch(`/api/prendas/material?id=${materialPrendaId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          // Actualizar la lista de materiales y recalcular costos
          await fetchPrendaMaterials(selectedPrenda.id)
          // Actualizar el contador en la lista principal
          fetchPrendas()
        }
      } catch (error) {
        console.error('Error eliminando material de prenda:', error)
      }
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Gestión de Prendas</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Agregar Prenda'}
        </button>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Prenda' : 'Nueva Prenda'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Precio de fabricación</label>
                <input
                  type="text"
                  value={`$${formData.precio_fabricacion}`}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Calculado automáticamente en base a los materiales
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Precio de venta</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                {formData.precio_venta && formData.precio_fabricacion && (
                  <p className="text-sm text-gray-500 mt-1">
                    Ganancia: ${(formData.precio_venta - formData.precio_fabricacion).toFixed(2)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">URL de la imagen</label>
                <input
                  type="url"
                  value={formData.imagen_url || ''}
                  onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  />
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingId ? 'Actualizar' : 'Guardar'} Prenda
            </button>
          </form>
        )}
        
        {showMaterialForm && (
          <form onSubmit={handleMaterialSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Agregar Material a {selectedPrenda.nombre}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Material</label>
                <select
                  value={materialFormData.material_id}
                  onChange={(e) => setMaterialFormData({...materialFormData, material_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccionar material</option>
                  {materiales.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.nombre} (${material.precio_por_metro}/m)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Cantidad (metros)</label>
                <input
                  type="number"
                  step="0.01"
                  value={materialFormData.cantidad}
                  onChange={(e) => setMaterialFormData({...materialFormData, cantidad: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Talla</label>
                <input
                  type="text"
                  value={materialFormData.talla}
                  onChange={(e) => setMaterialFormData({...materialFormData, talla: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="S, M, L, etc."
                />
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="font-semibold">Costo adicional: $
                {materialFormData.material_id && materialFormData.cantidad 
                  ? (materialFormData.cantidad * materiales.find(m => m.id == materialFormData.material_id)?.precio_por_metro || 0).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
            >
              Agregar Material
            </button>
            <button
              type="button"
              onClick={() => setShowMaterialForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Modal para ver materiales */}
        {showMaterialsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md max-w-2xl w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">
                Materiales de {selectedPrenda.nombre}
              </h2>
              
              {prendaMaterials.length === 0 ? (
                <p className="text-gray-500">No hay materiales asignados a esta prenda.</p>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-green-50 rounded">
                    <p className="font-semibold">Costo total de materiales: ${costoMateriales.toFixed(2)}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Material</th>
                          <th className="p-2 text-left">Cantidad</th>
                          <th className="p-2 text-left">Talla</th>
                          <th className="p-2 text-left">Precio/m</th>
                          <th className="p-2 text-left">Costo Total</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prendaMaterials.map((material, index) => (
                          <tr key={material.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="p-2">{material.nombre}</td>
                            <td className="p-2">{material.cantidad} m</td>
                            <td className="p-2">{material.talla}</td>
                            <td className="p-2">${material.precio_por_metro}</td>
                            <td className="p-2">${(material.cantidad * material.precio_por_metro).toFixed(2)}</td>
                            <td className="p-2">
                              <button
                                onClick={() => handleDeleteMaterial(material.material_prenda_id)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className=" bg-white rounded shadow-md overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Costo</th>
                <th className="p-3 text-left">Precio Venta</th>
                <th className="p-3 text-left">Materiales</th>
                <th className="p-3 text-left">Ganancia</th>
                <th className="p-3 text-left">Imagen</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prendas.map((prenda, index) => {
                const costo = parseFloat(prenda.precio_fabricacion || 0)
                const venta = parseFloat(prenda.precio_venta || 0)
                const ganancia = venta - costo
                
                return (
                  <tr key={prenda.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3">{prenda.nombre}</td>
                    <td className="p-3">${costo.toFixed(2)}</td>
                    <td className="p-3">${venta.toFixed(2)}</td>
                    <td className="p-3">{prenda.materiales_count || 0} materiales</td>
                    <td className={`p-3 font-semibold ${
                      ganancia >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${ganancia.toFixed(2)}
                    </td>
                    <td className="p-3">
  {prenda.imagen_url ? (
    <img 
      src={prenda.imagen_url} 
      alt={prenda.nombre}
      className="w-16 h-16 object-cover rounded"
    />
  ) : (
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
      <span className="text-gray-500">📷</span>
    </div>
  )}
</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewMaterials(prenda)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleAddMaterial(prenda)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                      >
                        + Material
                      </button>
                      <button
                        onClick={() => handleEdit(prenda)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prenda.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}