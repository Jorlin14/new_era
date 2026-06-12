/**
 * Database Config — New Era Supermercado
 *
 * Cliente Prisma singleton para toda la aplicación.
 *
 * @module config/database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
