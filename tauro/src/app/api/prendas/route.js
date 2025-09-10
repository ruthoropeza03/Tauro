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
    const { nombre, descripcion, precio_fabricacion, precio_venta, imagen_url } = await request.json()
    
    // Convertir URL de Google Drive al formato de thumbnail si es necesario
    let imagenUrlFormateada = null;
    if (imagen_url) {
      imagenUrlFormateada = formatGoogleDriveUrl(imagen_url);
    }
    
    // Asegurarse de que el precio de fabricación sea un número
    const precioFabricacion = precio_fabricacion ? parseFloat(precio_fabricacion) : 0
    const result = await query(
      'INSERT INTO prendas (nombre, descripcion, precio_fabricacion, precio_venta, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, descripcion, precioFabricacion, precio_venta ? parseFloat(precio_venta) : null, imagenUrlFormateada]
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
    const { id, nombre, descripcion, precio_fabricacion, precio_venta, imagen_url } = await request.json()
    
    // Convertir URL de Google Drive al formato de thumbnail si es necesario
    let imagenUrlFormateada = null;
    if (imagen_url) {
      imagenUrlFormateada = formatGoogleDriveUrl(imagen_url);
    }
    
    const result = await query(
      'UPDATE prendas SET nombre = $1, descripcion = $2, precio_fabricacion = $3, precio_venta = $4, imagen_url = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [nombre, descripcion, precio_fabricacion ? parseFloat(precio_fabricacion) : null, precio_venta ? parseFloat(precio_venta) : null, imagenUrlFormateada, id]
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

// Función para formatear URLs de Google Drive al formato de thumbnail
function formatGoogleDriveUrl(url) {
  if (!url) return null;
  
  try {
    // Si ya está en formato thumbnail, devolver tal cual
    if (url.includes('thumbnail?id=')) {
      return url;
    }
    
    // Extraer el ID del archivo de diferentes formatos de URL de Google Drive
    let fileId = '';
    
    // Formato estándar: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Formato de enlace directo: https://drive.google.com/uc?id=FILE_ID
    else if (url.includes('uc?id=')) {
      const match = url.match(/uc\?id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Formato de enlace abreviado: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
      const match = url.match(/open\?id=([^&]+)/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }
    // Si es solo el ID
    else if (url.length === 33 && !url.includes('/')) {
      fileId = url;
    }
    
    // Si se encontró un ID válido, formatear al URL de thumbnail
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=s4000`;
    }
    
    // Si no se pudo extraer el ID, devolver la URL original
    return url;
    
  } catch (error) {
    console.error('Error formateando URL de Google Drive:', error);
    return url; // Devolver la URL original en caso de error
  }
}