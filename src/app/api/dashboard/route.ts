import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const providers = await prisma.provider.findMany({
    include: {
      assignments: {
        include: {
          lead: {
            include: {
              service: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { id: 'asc' }
  })

  return NextResponse.json(providers)
}