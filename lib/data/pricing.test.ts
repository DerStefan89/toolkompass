import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PricingPlan } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { syncStartingPrice } from './pricing'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pricingPlan: {
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    tool: {
      update: vi.fn(),
    },
  },
}))

const mockedPrisma = vi.mocked(prisma, { deep: true })

/**
 * findFirst wird in pricing.ts mit `select: { priceCents: true }` aufgerufen,
 * aber vi.mocked() kennt diese Selektion nicht — mockResolvedValue erwartet den
 * vollständigen PricingPlan-Rückgabetyp. Deshalb hier ein vollständiges Fixture
 * statt eines Teil-Objekts (kein Cast nötig).
 */
function buildPricingPlan(priceCents: number): PricingPlan {
  return {
    id: 'plan-1',
    toolId: 'tool-1',
    name: 'Starter',
    priceCents,
    billingCycle: 'monthly',
    features: [],
    isHighlighted: false,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('syncStartingPrice', () => {
  it('(a) ruft prisma.tool.update NICHT auf, wenn keine Tarife vorhanden sind', async () => {
    mockedPrisma.pricingPlan.count.mockResolvedValue(0)
    mockedPrisma.pricingPlan.findFirst.mockResolvedValue(null)

    await syncStartingPrice('tool-1')

    expect(mockedPrisma.tool.update).not.toHaveBeenCalled()
  })

  it('(b) aktualisiert mit priceCents des monatlichen Tarifs', async () => {
    mockedPrisma.pricingPlan.count.mockResolvedValue(2)
    mockedPrisma.pricingPlan.findFirst.mockResolvedValue(buildPricingPlan(990))

    await syncStartingPrice('tool-1')

    expect(mockedPrisma.tool.update).toHaveBeenCalledWith({
      where: { id: 'tool-1' },
      data: { startingPriceCents: 990 },
    })
  })

  it('(c) aktualisiert mit null, wenn Tarife vorhanden sind aber keiner monatlich ist', async () => {
    mockedPrisma.pricingPlan.count.mockResolvedValue(1)
    mockedPrisma.pricingPlan.findFirst.mockResolvedValue(null)

    await syncStartingPrice('tool-1')

    expect(mockedPrisma.tool.update).toHaveBeenCalledWith({
      where: { id: 'tool-1' },
      data: { startingPriceCents: null },
    })
  })

  it('(d) übergibt billingCycle "monthly" und orderBy priceCents asc an findFirst', async () => {
    mockedPrisma.pricingPlan.count.mockResolvedValue(1)
    mockedPrisma.pricingPlan.findFirst.mockResolvedValue(buildPricingPlan(500))

    await syncStartingPrice('tool-1')

    expect(mockedPrisma.pricingPlan.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { toolId: 'tool-1', billingCycle: 'monthly' },
        orderBy: { priceCents: 'asc' },
      })
    )
  })
})
