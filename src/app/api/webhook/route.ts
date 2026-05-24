import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/lib/sse'

export async function POST(req: NextRequest) {
  try {
    const { eventId, action } = await req.json()

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    // Idempotency check
    const existing = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    })

    if (existing) {
      return NextResponse.json({
        message: 'Event already processed',
        idempotent: true
      })
    }

    if (action === 'reset_quota') {
      await prisma.$transaction([
        prisma.provider.updateMany({
          data: { currentCount: 0 }
        }),
        prisma.webhookEvent.create({
          data: { id: eventId }
        })
      ])

      notifyClients()

      return NextResponse.json({
        success: true,
        message: 'All provider quotas reset to 10'
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}