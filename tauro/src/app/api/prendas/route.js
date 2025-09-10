// src/app/api/prendas/route.js
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(`
      SELECT p.*, 
             COUNT(mp.id) as materiales_count
      FROM prendas p
      LEFT JOIN materiales_por_prenda mp ON p.id = mp.prenda_id
      GROUP BY p.id
      ORDER BY p.nombre
    `)
    return Response.json(result.rows)
  } catch (error) {
    console.error('Error obteniendo prendas:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nombre, descripcion, precio_fabricacion, precio_venta } = await request.json()
    // Asegurarse de que el precio de fabricación sea un número
    const precioFabricacion = precio_fabricacion ? parseFloat(precio_fabricacion) : 0
    const result = await query(
      'INSERT INTO prendas (nombre, descripcion, precio_fabricacion, precio_venta) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precioFabricacion ? parseFloat(precio_fabricacion) : null, precio_venta ? parseFloat(precio_venta) : null]
    )
    return Response.json({ 
      success: true, 
      prenda: result.rows[0] 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creando prenda:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, nombre, descripcion, precio_fabricacion, precio_venta } = await request.json()
    const result = await query(
      'UPDATE prendas SET nombre = $1, descripcion = $2, precio_fabricacion = $3, precio_venta = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [nombre, descripcion, precio_fabricacion ? parseFloat(precio_fabricacion) : null, precio_venta ? parseFloat(precio_venta) : null, id]
    )
    return Response.json({ 
      success: true, 
      prenda: result.rows[0] 
    })
  } catch (error) {
    console.error('Error actualizando prenda:', error)
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
    
    await query('DELETE FROM prendas WHERE id = $1', [id])
    
    return Response.json({ 
      success: true, 
      message: 'Prenda eliminada' 
    })
  } catch (error) {
    console.error('Error eliminando prenda:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}