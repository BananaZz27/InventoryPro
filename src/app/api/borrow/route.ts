import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const role = searchParams.get('role')

  try {
    let requests
    if (role === 'ADMIN') {
      requests = await prisma.borrowRequest.findMany({
        include: { user: true, item: true },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      requests = await prisma.borrowRequest.findMany({
        where: { userId: userId || undefined },
        include: { item: true },
        orderBy: { createdAt: 'desc' },
      })
    }
    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, itemId, quantity } = body

    // Check availability
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item || item.quantity < quantity) {
      return NextResponse.json({ error: 'Insufficient quantity' }, { status: 400 })
    }

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        userId,
        itemId,
        quantity,
        status: 'PENDING',
      },
    })
    return NextResponse.json(borrowRequest)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: { item: true },
    })

    if (!borrowRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (status === 'APPROVED') {
      // Deduct quantity
      if (borrowRequest.item.quantity < borrowRequest.quantity) {
        return NextResponse.json({ error: 'Insufficient quantity to approve' }, { status: 400 })
      }

      await prisma.item.update({
        where: { id: borrowRequest.itemId },
        data: { quantity: borrowRequest.item.quantity - borrowRequest.quantity },
      })
    } else if (status === 'RETURNED') {
      // Return quantity to stock
      await prisma.item.update({
        where: { id: borrowRequest.itemId },
        data: { quantity: borrowRequest.item.quantity + borrowRequest.quantity },
      })
    }

    const updated = await prisma.borrowRequest.update({
      where: { id },
      data: { status, returnedAt: status === 'RETURNED' ? new Date() : undefined },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
