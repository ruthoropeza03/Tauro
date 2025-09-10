// src/app/api/test-db/route.js
import db from '@/lib/db';

export async function GET() {
  try {
    // Probar la conexión con una consulta simple
    const result = await db.query('SELECT version()');
    const version = result.rows[0]?.version || 'Versión no disponible';
    
    return new Response(JSON.stringify({ 
      success: true, 
      version 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}