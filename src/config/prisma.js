const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mostrar modelos disponibles
console.log('Modelos Prisma:', Object.keys(prisma));

module.exports = prisma;