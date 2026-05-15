import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await prisma.item.findMany()
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, quantity, id } = body

    if (id) {
      // Update
      const item = await prisma.item.update({
        where: { id },
        data: { name, description, quantity: parseInt(quantity) },
      })
      return NextResponse.json(item)
    } else {
      // Create
      const item = await prisma.item.create({
        data: { name, description, quantity: parseInt(quantity) },
      })
      return NextResponse.json(item)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.item.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
