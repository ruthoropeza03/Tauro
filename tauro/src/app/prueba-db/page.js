// src/app/prueba-db/page.js
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function PruebaDB() {
  const [postgresVersion, setPostgresVersion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/test-db')
        const data = await response.json()
        
        if (response.ok) {
          setPostgresVersion(data.version)
        } else {
          setError(data.error || 'Error desconocido')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Prueba de conexión a Neon Postgres</h1>
        
        {loading ? (
          <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
            🔄 Probando conexión a la base de datos...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">
            ❌ Error de conexión: {error}
          </div>
        ) : postgresVersion ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg">
            ✅ Conexión exitosa! Versión de PostgreSQL: <strong>{postgresVersion}</strong>
          </div>
        ) : null}

        <div className="mt-6">
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    </Layout>
  )
}