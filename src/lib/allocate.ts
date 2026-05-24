import { prisma } from './prisma'

export async function allocateProviders(leadId: number, serviceId: number) {
  const SLOTS = 3

  // Get mandatory provider IDs for this service
  const mandatoryRules = await prisma.mandatoryRule.findMany({
    where: { serviceId }
  })
  const mandatoryIds = mandatoryRules.map(r => r.providerId)

  // Check which mandatory providers still have quota using raw query
  const eligibleMandatoryRaw = await prisma.$queryRawUnsafe<{id: number}[]>(
    `SELECT id FROM "Provider" WHERE id = ANY($1) AND "currentCount" < "monthlyQuota"`,
    mandatoryIds
  )

  const assignedIds: number[] = eligibleMandatoryRaw.map(p => p.id)

  // Fill remaining slots from fair pool using round-robin
  const remaining = SLOTS - assignedIds.length
  if (remaining > 0) {
    const poolProviders = await prisma.$queryRawUnsafe<{id: number}[]>(
      `SELECT ac."providerId" as id
       FROM "AllocationCounter" ac
       JOIN "Provider" p ON p.id = ac."providerId"
       WHERE ac."serviceId" = $1
         AND ac."providerId" != ALL($2)
         AND p."currentCount" < p."monthlyQuota"
       ORDER BY ac."roundRobinIndex" ASC, ac."providerId" ASC
       LIMIT $3`,
      serviceId,
      assignedIds.length > 0 ? assignedIds : [0],
      remaining
    )

    for (const p of poolProviders) {
      assignedIds.push(p.id)
      await prisma.allocationCounter.updateMany({
        where: { serviceId, providerId: p.id },
        data: { roundRobinIndex: { increment: 1 } }
      })
    }
  }

  // Create assignments and update provider counts
  for (const providerId of assignedIds) {
    await prisma.leadAssignment.create({ data: { leadId, providerId } })
    await prisma.provider.update({
      where: { id: providerId },
      data: { currentCount: { increment: 1 } }
    })
  }

  return assignedIds
}