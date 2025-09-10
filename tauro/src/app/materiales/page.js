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
        fetchMateriales() // Refresh the list
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
          fetchMateriales() // Refresh the list
        }
      } catch (error) {
        console.error('Error eliminando material:', error)
      }
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Gestión de Materiales</h1>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Agregar Material'}
        </button>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Material' : 'Nuevo Material'}
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
                <label className="block text-gray-700 mb-2">Precio por metro</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_por_metro}
                  onChange={(e) => setFormData({...formData, precio_por_metro: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingId ? 'Actualizar' : 'Guardar'} Material
            </button>
          </form>
        )}
        
        <div class="overflow-auto" className="bg-white rounded shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-black text-left">Nombre</th>
                <th className="p-3 text-black text-left">Precio por metro</th>
                <th className="p-3 text-black text-left">Descripción</th>
                <th className="p-3 text-black text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((material, index) => (
                <tr key={material.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">{material.nombre}</td>
                  <td className="p-3">${parseFloat(material.precio_por_metro).toFixed(2)}</td>
                  <td className="p-3">{material.descripcion || '-'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEdit(material)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
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
    </Layout>
  )
}