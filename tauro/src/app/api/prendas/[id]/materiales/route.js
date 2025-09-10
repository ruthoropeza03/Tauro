// src/app/api/prendas/[id]/materiales/route.js
import { query } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    const result = await query(`
      SELECT 
        mp.id as material_prenda_id,
        m.nombre,
        m.precio_por_metro,
        mp.cantidad,
        mp.talla
      FROM materiales_por_prenda mp
      JOIN materiales m ON mp.material_id = m.id
      WHERE mp.prenda_id = $1
      ORDER BY m.nombre
    `, [id])
    
    return Response.json(result.rows)
  } catch (error) {
    console.error('Error obteniendo materiales de prenda:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}