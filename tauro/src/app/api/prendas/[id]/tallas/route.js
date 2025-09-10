// src/app/api/prendas/[id]/tallas/route.js
import { query } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    // Await los params antes de desestructurar
    const { id } = await params
    
    const result = await query(
      'SELECT DISTINCT talla FROM materiales_por_prenda WHERE prenda_id = $1 ORDER BY talla',
      [id]
    )
    
    const tallas = result.rows.map(row => row.talla)
    
    return Response.json(tallas)
  } catch (error) {
    console.error('Error obteniendo tallas:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}