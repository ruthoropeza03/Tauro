// src/app/api/calculos/route.js
import { query } from '@/lib/db'

export async function POST(request) {
  try {
    const { prenda_nombre, grupo_tallas, cantidad } = await request.json()
    
    // Obtener información de la prenda por nombre
    const prendaResult = await query('SELECT * FROM prendas WHERE nombre = $1', [prenda_nombre])
    const prenda = prendaResult.rows[0]
    
    if (!prenda) {
      return Response.json({ 
        success: false, 
        error: 'Prenda no encontrada' 
      }, { status: 404 })
    }
    
    // Obtener todos los materiales para el grupo de tallas seleccionado
    const materialesResult = await query(`
      SELECT m.*, mp.cantidad
      FROM materiales_por_prenda mp
      JOIN materiales m ON mp.material_id = m.id
      WHERE mp.prenda_id = $1 
      AND mp.grupo_tallas = $2
    `, [prenda.id, grupo_tallas])
    
    if (materialesResult.rows.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'No se encontraron materiales para este grupo de tallas' 
      }, { status: 404 })
    }
    
    const materialesNecesarios = materialesResult.rows.map(material => {
      const cantidadNecesaria = material.cantidad * cantidad
      const costoTotal = cantidadNecesaria * parseFloat(material.precio_por_metro || 0)
      return {
        id: material.id,
        nombre: material.nombre,
        precio_por_metro: material.precio_por_metro,
        cantidad_necesaria: cantidadNecesaria,
        costo_total: costoTotal
      }
    })
    
    // Calcular costos totales
    const costoTotalMateriales = materialesNecesarios.reduce((total, material) => total + material.costo_total, 0)
    const precioVentaUnitario = prenda.precio_venta ? parseFloat(prenda.precio_venta) : 0
    
    // Calcular precios sugeridos basados en el costo de materiales
    const costoMaterialesUnitario = costoTotalMateriales / cantidad
    const precioDetal = costoMaterialesUnitario * 1.70 // +70%
    const precioMayor = costoMaterialesUnitario * 1.50 // +50%
    
    const precioTotalVenta = precioVentaUnitario * cantidad
    const gananciaEstimada = precioTotalVenta - costoTotalMateriales
    
    return Response.json({
      success: true,
      prenda,
      grupo_tallas,
      cantidad,
      materiales_necesarios: materialesNecesarios,
      costo_total_materiales: costoTotalMateriales,
      precio_total_venta: precioTotalVenta,
      ganancia_estimada: gananciaEstimada,
      precios_sugeridos: {
        detal: precioDetal,
        mayor: precioMayor
      },
      detalles: {
        precio_venta_unitario: precioVentaUnitario,
        costo_materiales_unitario: costoMaterialesUnitario
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

// Función para obtener los grupos de tallas disponibles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const prendaNombre = searchParams.get('prenda_nombre')
    
    if (!prendaNombre) {
      return Response.json({ 
        success: false, 
        error: 'Nombre de prenda requerido' 
      }, { status: 400 })
    }
    
    // Obtener la prenda por nombre para obtener su ID
    const prendaResult = await query('SELECT id, grupo_tallas FROM prendas WHERE nombre = $1', [prendaNombre])
    
    if (prendaResult.rows.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Prenda no encontrada' 
      }, { status: 404 })
    }
    
    const prendaId = prendaResult.rows[0].id
    const grupoTallas = prendaResult.rows[0].grupo_tallas
    
    // Obtener los grupos de tallas únicos que tienen materiales asignados
    const gruposResult = await query(`
      SELECT DISTINCT grupo_tallas 
      FROM materiales_por_prenda 
      WHERE prenda_id = $1 
      ORDER BY grupo_tallas
    `, [prendaId])
    
    const gruposDisponibles = gruposResult.rows.map(row => row.grupo_tallas)
    
    return Response.json({
      success: true,
      grupo_tallas: grupoTallas,
      grupos_disponibles: gruposDisponibles
    })
  } catch (error) {
    console.error('Error obteniendo grupos de tallas:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}