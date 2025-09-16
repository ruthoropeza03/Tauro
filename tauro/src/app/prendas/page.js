// src/app/prendas/page.js
'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

// Función para obtener el nombre del grupo de tallas
const getNombreGrupoTallas = (grupo) => {
  const grupos = {
    'XS-S-M-L-XL': 'XS, S, M, L, XL',
    '2XL-3XL': '2XL, 3XL',
    '4XL': '4XL'
  }
  return grupos[grupo] || grupo
}

// Función para obtener grupos de tallas únicos de los materiales de una prenda
const getGruposTallasFromMaterials = (materials) => {
  if (!materials || materials.length === 0) return [];
  
  const gruposUnicos = [...new Set(materials.map(m => m.grupo_tallas))];
  return gruposUnicos.map(grupo => getNombreGrupoTallas(grupo)).join(', ');
}

// Función para agrupar materiales por talla
const groupMaterialsByTalla = (materials) => {
  if (!materials || materials.length === 0) return {};
  
  const grouped = {};
  materials.forEach(material => {
    const talla = material.grupo_tallas;
    if (!grouped[talla]) {
      grouped[talla] = [];
    }
    grouped[talla].push(material);
  });
  
  return grouped;
}

export default function Prendas() {
  const [prendas, setPrendas] = useState([])
  const [materiales, setMateriales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [selectedPrenda, setSelectedPrenda] = useState(null)
  const [prendaMaterials, setPrendaMaterials] = useState([])
  const [prendasWithMaterials, setPrendasWithMaterials] = useState([])
  const [formData, setFormData] = useState({
    nombre: ''
  })
  const [materialesForm, setMaterialesForm] = useState([{
    material_id: '',
    cantidad: '',
    grupo_tallas: 'XS-S-M-L-XL' // Valor por defecto
  }])
  const [editingId, setEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Grupos de tallas predefinidos
  const gruposTallas = [
    { value: 'XS-S-M-L-XL', label: 'XS, S, M, L, XL' },
    { value: '2XL-3XL', label: '2XL, 3XL' },
    { value: '4XL', label: '4XL' }
  ]

  useEffect(() => {
    fetchPrendas()
    fetchMateriales()
  }, [])

  const fetchPrendas = async () => {
    try {
      const response = await fetch('/api/prendas')
      const data = await response.json()
      setPrendas(data)
      
      // Obtener materiales para cada prenda
      const prendasConMateriales = await Promise.all(
        data.map(async (prenda) => {
          try {
            const materialesResponse = await fetch(`/api/prendas/${prenda.id}/materiales`)
            const materialesData = await materialesResponse.json()
            return {
              ...prenda,
              materiales: materialesData
            }
          } catch (error) {
            console.error(`Error fetching materiales for prenda ${prenda.id}:`, error)
            return {
              ...prenda,
              materiales: []
            }
          }
        })
      )
      
      setPrendasWithMaterials(prendasConMateriales)
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
    } catch (error) {
      console.error('Error fetching materiales de prenda:', error)
    }
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
          nombre: ''
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
      nombre: prenda.nombre
    })
    setEditingId(prenda.id)
    setShowForm(true)
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
    setMaterialesForm([{ 
      material_id: '', 
      cantidad: '', 
      grupo_tallas: 'XS-S-M-L-XL' 
    }])
    setShowMaterialForm(true)
  }

  const addMaterialField = () => {
    setMaterialesForm([...materialesForm, { 
      material_id: '', 
      cantidad: '', 
      grupo_tallas: materialesForm[0].grupo_tallas || 'XS-S-M-L-XL' 
    }])
  }

  const removeMaterialField = (index) => {
    if (materialesForm.length > 1) {
      const newMaterials = materialesForm.filter((_, i) => i !== index)
      setMaterialesForm(newMaterials)
    }
  }

  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materialesForm]
    newMaterials[index][field] = value
    
    // Si cambiamos el grupo de tallas en el primer campo, actualizar todos los demás
    if (field === 'grupo_tallas' && index === 0) {
      for (let i = 1; i < newMaterials.length; i++) {
        newMaterials[i].grupo_tallas = value
      }
    }
    
    setMaterialesForm(newMaterials)
  }

  const handleMaterialSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Filtrar materiales vacíos
      const materialesValidos = materialesForm.filter(m => m.material_id && m.cantidad)
      
      if (materialesValidos.length === 0) {
        alert('Por favor agrega al menos un material válido')
        return
      }

      // Enviar cada material individualmente
      const promises = materialesValidos.map(material => 
        fetch('/api/prendas/material', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prenda_id: selectedPrenda.id,
            ...material
          }),
        })
      )

      const responses = await Promise.all(promises)
      const allSuccessful = responses.every(response => response.ok)

      if (allSuccessful) {
        setMaterialesForm([{ material_id: '', cantidad: '', grupo_tallas: 'XS-S-M-L-XL' }])
        setShowMaterialForm(false)
        if (editingId) {
          await fetchPrendaMaterials(selectedPrenda.id)
        }
        fetchPrendas()
        alert('Materiales agregados exitosamente')
      } else {
        throw new Error('Error al agregar algunos materiales')
      }
    } catch (error) {
      console.error('Error agregando materiales a prenda:', error)
      alert('Error al agregar materiales. Por favor intenta nuevamente.')
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
          await fetchPrendaMaterials(selectedPrenda.id)
          fetchPrendas()
        }
      } catch (error) {
        console.error('Error eliminando material de prenda:', error)
      }
    }
  }

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = prendasWithMaterials.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(prendasWithMaterials.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-primary mb-6">Gestión de Prendas</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-accent px-4 py-2 rounded mb-4 hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Agregar Prenda'}
        </button>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-secondary mb-4">
              {editingId ? 'Editar Prenda' : 'Nueva Prenda'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-secondary mb-2 font-medium">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-secondary mb-2 font-medium">URL de la imagen</label>
              <input
                type="url"
                value={formData.imagen_url || ''}
                onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            
            <button
              type="submit"
              className="bg-primary text-accent px-4 py-2 rounded hover:bg-primary/90 transition-colors mt-4"
            >
              {editingId ? 'Actualizar' : 'Guardar'} Prenda
            </button>
          </form>
        )}
        
        {showMaterialForm && (
          <form onSubmit={handleMaterialSubmit} className="bg-white p-6 rounded shadow-md mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-secondary mb-4">
              Agregar Materiales a {selectedPrenda.nombre}
            </h2>
            
            {/* Campo de grupo de tallas en el formulario de materiales */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-secondary mb-2 font-medium">Grupo de Tallas</label>
              <select
                value={materialesForm[0].grupo_tallas}
                onChange={(e) => handleMaterialChange(0, 'grupo_tallas', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {gruposTallas.map(grupo => (
                  <option key={grupo.value} value={grupo.value}>
                    {grupo.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Este grupo de tallas se aplicará a todos los materiales agregados
              </p>
            </div>
            
            {materialesForm.map((material, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg relative">
                {materialesForm.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialField(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Eliminar material"
                  >
                    ×
                  </button>
                )}
                
                <div>
                  <label className="block text-secondary mb-2 font-medium">Material</label>
                  <select
                    value={material.material_id}
                    onChange={(e) => handleMaterialChange(index, 'material_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Seleccionar material</option>
                    {materiales.map(materialItem => (
                      <option key={materialItem.id} value={materialItem.id}>
                        {materialItem.nombre} (${materialItem.precio_por_metro}/m)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-secondary mb-2 font-medium">Cantidad (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={material.cantidad}
                    onChange={(e) => handleMaterialChange(index, 'cantidad', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <div className="w-full p-2 bg-gray-100 rounded">
                    <p className="text-sm text-secondary">
                      Costo: $
                      {material.material_id && material.cantidad 
                        ? (material.cantidad * materiales.find(m => m.id == material.material_id)?.precio_por_metro || 0).toFixed(2)
                        : '0.00'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mb-4">
              <button
                type="button"
                onClick={addMaterialField}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                + Agregar otro material
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary text-accent px-6 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Agregar Materiales
              </button>
              <button
                type="button"
                onClick={() => setShowMaterialForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Modal para ver materiales - Ahora agrupados por talla */}
        {showMaterialsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-semibold text-secondary mb-4">
                Materiales de {selectedPrenda.nombre}
              </h2>
              
              {prendaMaterials.length === 0 ? (
                <p className="text-gray-500">No hay materiales asignados a esta prenda.</p>
              ) : (
                <div>
                  {Object.entries(groupMaterialsByTalla(prendaMaterials)).map(([talla, materiales]) => (
                    <div key={talla} className="mb-6 border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="text-lg font-semibold text-primary mb-3 bg-gray-100 p-2 rounded">
                        Talla: {getNombreGrupoTallas(talla)}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="table-custom w-full">
                          <thead>
                            <tr>
                              <th>Material</th>
                              <th>Cantidad</th>
                              <th>Precio/m</th>
                              <th>Costo Total</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materiales.map((material) => (
                              <tr key={material.material_prenda_id || material.id}>
                                <td className="font-medium">{material.nombre}</td>
                                <td>{material.cantidad} m</td>
                                <td>${material.precio_por_metro}</td>
                                <td>${(material.cantidad * material.precio_por_metro).toFixed(2)}</td>
                                <td>
                                  <button
                                    onClick={() => handleDeleteMaterial(material.material_prenda_id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan="3" className="text-right">Subtotal:</td>
                              <td>${materiales.reduce((sum, material) => sum + (material.cantidad * material.precio_por_metro), 0).toFixed(2)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                {/*   <div className="mt-4 p-3 bg-primary text-accent rounded-lg font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Costo total de la prenda:</span>
                      <span>
                        ${prendaMaterials.reduce((sum, material) => sum + (material.cantidad * material.precio_por_metro), 0).toFixed(2)}
                      </span>
                    </div>
                  </div> */}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowMaterialsModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="table-custom w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Grupo de Tallas</th>
                  <th>Materiales</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((prenda) => (
                  <tr key={prenda.id}>
                    <td className="font-medium">{prenda.nombre}</td>
                    <td>
                      {getGruposTallasFromMaterials(prenda.materiales)}
                    </td>
                    <td>{prenda.materiales?.length || 0} materiales</td>
                    <td>
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
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewMaterials(prenda)}
                          className="bg-primary text-accent px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleAddMaterial(prenda)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          + Material
                        </button>
                        <button
                          onClick={() => handleEdit(prenda)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(prenda.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {prendasWithMaterials.length > itemsPerPage && (
          <div className="flex justify-center mt-6 space-x-2">
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

        <div className="mt-4 text-sm text-secondary">
          Mostrando {currentItems.length} de {prendasWithMaterials.length} prendas
        </div>
      </div>
    </Layout>
  )
}