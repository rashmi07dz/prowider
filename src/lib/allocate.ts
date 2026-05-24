import { prisma } from './prisma'

export async function allocateProviders(leadId: number, serviceId: number) {
  const SLOTS = 3

  const mandatoryRules = await prisma.mandatoryRule.findMany({
    where: { serviceId }
  })
  const mandatoryIds = mandatoryRules.map(r => r.providerId)

  let assignedIds: number[] = []

  if (mandatoryIds.length > 0) {
    const eligibleMandatory = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM "Provider" WHERE id = ANY($1::int[]) AND "currentCount" < "monthlyQuota"`,
      mandatoryIds
    )
    assignedIds = eligibleMandatory.map(p => p.id)
  }

  const remaining = SLOTS - assignedIds.length
  if (remaining > 0) {
    const excludeIds = assignedIds.length > 0 ? assignedIds : [-1]
    const poolProviders = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `SELECT ac."providerId" as id
       FROM "AllocationCounter" ac
       JOIN "Provider" p ON p.id = ac."providerId"
       WHERE ac."serviceId" = $1
         AND ac."providerId" != ALL($2::int[])
         AND p."currentCount" < p."monthlyQuota"
       ORDER BY ac."roundRobinIndex" ASC, ac."providerId" ASC
       LIMIT $3`,
      serviceId,
      excludeIds,
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

  for (const providerId of assignedIds) {
    await prisma.leadAssignment.create({ data: { leadId, providerId } })
    await prisma.provider.update({
      where: { id: providerId },
      data: { currentCount: { increment: 1 } }
    })
  }

  return assignedIds
}