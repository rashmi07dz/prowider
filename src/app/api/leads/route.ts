import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { allocateProviders } from '@/lib/allocate'
import { notifyClients } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, city, serviceId, description } = await req.json()

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        city,
        serviceId: Number(serviceId),
        description
      }
    })

    await allocateProviders(lead.id, lead.serviceId)
    notifyClients()

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (e: unknown) {
    const prismaError = e as { code?: string }

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'This phone number already submitted this service.' },
        { status: 409 }
      )
    }
    console.error(e)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}