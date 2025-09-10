// src/app/page.js
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-primary mb-6">Bienvenida a Tauro</h1>
        <p className="text-lg text-secondary mb-8">
          Sistema de gestión para control de materiales, prendas y cálculos de costos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <Link href="/materiales" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Gestión de Materiales</h2>
            <p className="text-secondary">Administra los materiales disponibles y sus precios por metro.</p>
          </Link>
          
          <Link href="/prendas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Gestión de Prendas</h2>
            <p className="text-secondary">Crea y administra las prendas, sus materiales requeridos y precios.</p>
          </Link>
          
          <Link href="/calculos" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-primary mb-3">Cálculos y Presupuestos</h2>
            <p className="text-secondary">Realiza cálculos de materiales necesarios y presupuestos.</p>
          </Link>
        </div>
      </div>
    </Layout>
  )
}