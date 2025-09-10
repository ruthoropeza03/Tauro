// src/app/layout.js

import './globals.css'

// src/app/layout.js
export const metadata = {
  title: 'Tauro - Sistema de Gestión para Costurera',
  description: 'Sistema de gestión para costurera Tauro',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}