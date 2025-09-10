// src/components/Layout.js
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-accent">
      <nav className="bg-primary text-accent shadow-md relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-xl font-bold flex items-center space-x-2 z-50"
              onClick={closeMenu}
            >
              <Image 
                src="/favicon.ico" 
                alt="Logo Tauro" 
                width={32} 
                height={32} 
                className="w-8 h-8"
              />
              <span>Tauro</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/materiales" 
                className="hover:underline hover:opacity-90 transition-opacity duration-200"
              >
                Materiales
              </Link>
              <Link 
                href="/prendas" 
                className="hover:underline hover:opacity-90 transition-opacity duration-200"
              >
                Prendas
              </Link>
              <Link 
                href="/calculos" 
                className="hover:underline hover:opacity-90 transition-opacity duration-200"
              >
                Cálculos
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 z-50"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className={`block w-8 h-0.5 bg-accent transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}></span>
              <span className={`block w-8 h-0.5 bg-accent transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`block w-8 h-0.5 bg-accent transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}></span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden absolute left-0 right-0 bg-primary shadow-lg transition-all duration-300 ease-in-out z-40 ${
            isMenuOpen 
              ? 'max-h-96 opacity-100 top-full visible' 
              : 'max-h-0 opacity-0 -top-10 invisible'
          }`}>
            <div className="py-4 space-y-4 border-t border-accent/20 px-4">
              <Link 
                href="/materiales" 
                className="block py-3 px-4 hover:bg-primary/80 rounded-lg transition-colors duration-200 text-lg font-medium"
                onClick={closeMenu}
              >
                Materiales
              </Link>
              <Link 
                href="/prendas" 
                className="block py-3 px-4 hover:bg-primary/80 rounded-lg transition-colors duration-200 text-lg font-medium"
                onClick={closeMenu}
              >
                Prendas
              </Link>
              <Link 
                href="/calculos" 
                className="block py-3 px-4 hover:bg-primary/80 rounded-lg transition-colors duration-200 text-lg font-medium"
                onClick={closeMenu}
              >
                Cálculos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay para mobile - Solo se muestra cuando el menú está abierto */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMenu}
        />
      )}

      <main className="container mx-auto p-4 relative z-10">
        {children}
      </main>

      <footer className="bg-secondary text-accent p-4 mt-8 relative z-10">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Tauro. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}