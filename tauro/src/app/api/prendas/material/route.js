// src/app/api/prendas/material/route.js
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    const { prenda_id, material_id, cantidad, grupo_tallas } = await request.json()
    
    const result = await query(
      'INSERT INTO materiales_por_prenda (prenda_id, material_id, cantidad, grupo_tallas) VALUES ($1, $2, $3, $4) RETURNING *',
      [prenda_id, material_id, parseFloat(cantidad), grupo_tallas]
    )
    
    return Response.json({ 
      success: true, 
      materialPrenda: result.rows[0] 
    }, { status: 201 })
  } catch (error) {
    console.error('Error agregando material a prenda:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    await query('DELETE FROM materiales_por_prenda WHERE id = $1', [id])
    
    return Response.json({ 
      success: true, 
      message: 'Material eliminado de la prenda' 
    })
  } catch (error) {
    console.error('Error eliminando material de prenda:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}