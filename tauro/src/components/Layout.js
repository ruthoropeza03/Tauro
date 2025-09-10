// src/components/Layout.js
'use client'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Tauro
          </Link>
          <div className="space-x-4">
            <Link href="/materiales" className="hover:underline">
              Materiales
            </Link>
            <Link href="/prendas" className="hover:underline">
              Prendas
            </Link>
            <Link href="/calculos" className="hover:underline">
              Cálculos
            </Link>
            <Link href="/prueba-db" className="hover:underline">
              Prueba DB
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Tauro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}