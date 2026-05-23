/**
 * Datei: lib/prisma.ts
 *
 * Zweck: Zentraler Prisma Client Singleton für die gesamte App.
 *
 * Wichtig:
 * In Next.js (Dev-Modus) wird das Modul bei jedem Hot-Reload neu geladen.
 * Ohne Singleton entstehen dadurch zu viele offene DB-Verbindungen.
 * globalThis verhindert das — der Client wird nur einmal erstellt.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
