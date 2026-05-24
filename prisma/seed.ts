import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Services
  await prisma.service.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'Service 1' } })
  await prisma.service.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'Service 2' } })
  await prisma.service.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: 'Service 3' } })

  // Providers 1–8
  for (let i = 1; i <= 8; i++) {
    await prisma.provider.upsert({
      where: { id: i },
      update: {},
      create: { id: i, name: `Provider ${i}`, monthlyQuota: 10, currentCount: 0 }
    })
  }

  // Mandatory rules
  const rules = [
    { serviceId: 1, providerId: 1 },
    { serviceId: 2, providerId: 5 },
    { serviceId: 3, providerId: 1 },
    { serviceId: 3, providerId: 4 },
  ]
  for (const rule of rules) {
    await prisma.mandatoryRule.create({ data: rule })
  }

  // Fair pool counters
  const fairPools = [
    { serviceId: 1, providerIds: [2, 3, 4] },
    { serviceId: 2, providerIds: [6, 7, 8] },
    { serviceId: 3, providerIds: [2, 3, 5, 6, 7, 8] },
  ]
  for (const pool of fairPools) {
    for (const providerId of pool.providerIds) {
      await prisma.allocationCounter.upsert({
        where: { serviceId_providerId: { serviceId: pool.serviceId, providerId } },
        update: {},
        create: { serviceId: pool.serviceId, providerId, roundRobinIndex: 0 }
      })
    }
  }

  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())