// src/app/api/materiales/route.js
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await query('SELECT * FROM materiales ORDER BY nombre')
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nombre, precio_por_metro, descripcion } = await request.json()
    const result = await query(
      'INSERT INTO materiales (nombre, precio_por_metro, descripcion) VALUES ($1, $2, $3) RETURNING *',
      [nombre, parseFloat(precio_por_metro), descripcion]
    )
    return NextResponse.json({ material: result.rows[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { id, nombre, precio_por_metro, descripcion } = await request.json()
    const result = await query(
      'UPDATE materiales SET nombre = $1, precio_por_metro = $2, descripcion = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [nombre, parseFloat(precio_por_metro), descripcion, id]
    )
    return NextResponse.json({ material: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await query('DELETE FROM materiales WHERE id = $1', [id])
    return NextResponse.json({ message: 'Material eliminado' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}