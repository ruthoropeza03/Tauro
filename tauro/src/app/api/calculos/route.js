// src/app/api/calculos/route.js
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    const { prenda_id, talla, cantidad } = await request.json()
    
    // Obtener información de la prenda
    const prendaResult = await query('SELECT * FROM prendas WHERE id = $1', [prenda_id])
    const prenda = prendaResult.rows[0]
    
    if (!prenda) {
      return Response.json({ 
        success: false, 
        error: 'Prenda no encontrada' 
      }, { status: 404 })
    }
    
    // Obtener materiales necesarios para la talla seleccionada
    const materialesResult = await query(`
      SELECT m.*, mp.cantidad
      FROM materiales_por_prenda mp
      JOIN materiales m ON mp.material_id = m.id
      WHERE mp.prenda_id = $1 AND mp.talla = $2
    `, [prenda_id, talla])
    
    const materialesNecesarios = materialesResult.rows.map(material => {
      const cantidadNecesaria = material.cantidad * cantidad
      const costoTotal = cantidadNecesaria * parseFloat(material.precio_por_metro || 0)
      return {
        ...material,
        cantidad_necesaria: cantidadNecesaria,
        costo_total: costoTotal
      }
    })
    
    // Calcular costos totales con valores por defecto para evitar NaN
    const costoTotalMateriales = materialesNecesarios.reduce((total, material) => total + material.costo_total, 0)
    const costoFabricacionUnitario = prenda.precio_fabricacion ? parseFloat(prenda.precio_fabricacion) : 0
    const precioVentaUnitario = prenda.precio_venta ? parseFloat(prenda.precio_venta) : 0
    
    const costoTotalFabricacion = (costoFabricacionUnitario * cantidad) * 0
    const precioTotalVenta = precioVentaUnitario * cantidad
    const gananciaEstimada = precioTotalVenta - costoTotalMateriales - costoTotalFabricacion
    
    // Calcular márgenes y porcentajes
    const costoTotal = costoTotalMateriales + (costoTotalFabricacion * 0)
    
    return Response.json({
      success: true,
      prenda,
      talla,
      cantidad,
      materiales_necesarios: materialesNecesarios,
      costo_total_materiales: costoTotalMateriales,
      costo_total_fabricacion: costoTotalFabricacion,
      costo_total: costoTotal,
      precio_total_venta: precioTotalVenta,
      ganancia_estimada: gananciaEstimada,
      detalles: {
        costo_fabricacion_unitario: costoFabricacionUnitario,
        precio_venta_unitario: precioVentaUnitario,
        costo_materiales_unitario: costoTotalMateriales / cantidad
      }
    })
  } catch (error) {
    console.error('Error calculando presupuesto:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}