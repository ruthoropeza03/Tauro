// src/app/materiales/page.js
'use client'
import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

export default function Materiales() {
  const [materiales, setMateriales] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    precio_por_metro: '',
    descripcion: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    fetchMateriales()
  }, [])

  const fetchMateriales = async () => {
    try {
      const response = await fetch('/api/materiales')
      const data = await response.json()
      setMateriales(data)
    } catch (error) {
      console.error('Error fetching materiales:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/materiales', {
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
          setMateriales(materiales.map(m => m.id === editingId ? result.material : m))
        } else {
          setMateriales([...materiales, result.material])
        }
        
        setFormData({ nombre: '', precio_por_metro: '', descripcion: '' })
        setEditingId(null)
        setShowForm(false)
        fetchMateriales()
      }
    } catch (error) {
      console.error('Error guardando material:', error)
    }
  }

  const handleEdit = (material) => {
    setFormData({
      nombre: material.nombre,
      precio_por_metro: material.precio_por_metro,
      descripcion: material.descripcion || ''
    })
    setEditingId(material.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        const response = await fetch(`/api/materiales?id=${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setMateriales(materiales.filter(m => m.id !== id))
          fetchMateriales()
        }
      } catch (error) {
        console.error('Error eliminando material:', error)
      }
    }
  }

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = materiales.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(materiales.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-primary mb-6">Gestión de Materiales</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-accent px-4 py-2 rounded mb-4 hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Agregar Material'}
        </button>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-secondary mb-4">
              {editingId ? 'Editar Material' : 'Nuevo Material'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              
              <div>
                <label className="block text-secondary mb-2 font-medium">Precio por metro</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_por_metro}
                  onChange={(e) => setFormData({...formData, precio_por_metro: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary mb-2 font-medium">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              className="bg-primary text-accent px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'} Material
            </button>
          </form>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="table-custom w-full">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio por metro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((material) => (
                  <tr key={material.id}>
                    <td className="font-medium">{material.nombre}</td>
                    <td>${parseFloat(material.precio_por_metro).toFixed(2)}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="bg-primary text-accent px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
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
        {materiales.length > itemsPerPage && (
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
          Mostrando {currentItems.length} de {materiales.length} materiales
        </div>
      </div>
    </Layout>
  )
}