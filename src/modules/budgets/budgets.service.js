const prisma = require('../../config/prisma');
const { getDateRange } = require('../../utils/dateHelpers');

async function getAll(userId) {
  const budgets = await prisma.budgets.findMany({
    where: { user_id: userId },
    include: {
      categories: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  // Para cada budget calcular el gasto actual en ese período
  const result = await Promise.all(
    budgets.map(async (budget) => {
      const { from, to } = getDateRange(budget.period);

      const spent = await prisma.transactions.aggregate({
        where: {
          user_id:     userId,
          category_id: budget.category_id,
          type:        'expense',
          date:        { gte: from, lte: to },
        },
        _sum: { amount: true },
      });

      const amountSpent = Number(spent._sum.amount || 0);
      const amountLimit = Number(budget.amount_limit);

      return {
        ...budget,
        amount_limit: amountLimit,
        amount_spent: amountSpent,
        percentage:   amountLimit > 0 ? Math.round((amountSpent / amountLimit) * 100) : 0,
        is_exceeded:  amountSpent > amountLimit,
      };
    })
  );

  return result;
}

async function getById(userId, id) {
  const budget = await prisma.budgets.findFirst({
    where: { id, user_id: userId },
    include: {
      categories: { select: { id: true, name: true, icon: true, color: true } },
    },
  });
  if (!budget) throw Object.assign(new Error('Presupuesto no encontrado'), { status: 404 });
  return budget;
}

async function create(userId, data) {
  // Verificar que no exista ya un budget para esa categoría y período
  const existing = await prisma.budgets.findFirst({
    where: {
      user_id:     userId,
      category_id: data.categoryId,
      period:      data.period,
    },
  });
  if (existing) throw Object.assign(
    new Error('Ya existe un presupuesto para esa categoría y período'), { status: 409 }
  );

  return prisma.budgets.create({
    data: {
      user_id:      userId,
      category_id:  data.categoryId,
      amount_limit: data.amountLimit,
      period:       data.period,
    },
    include: {
      categories: { select: { id: true, name: true, icon: true, color: true } },
    },
  });
}

async function update(userId, id, data) {
  await getById(userId, id);

  const updateData = {};
  if (data.amountLimit !== undefined) updateData.amount_limit = data.amountLimit;
  if (data.period      !== undefined) updateData.period       = data.period;
  updateData.updated_at = new Date();

  return prisma.budgets.update({
    where: { id },
    data: updateData,
    include: {
      categories: { select: { id: true, name: true, icon: true, color: true } },
    },
  });
}

async function remove(userId, id) {
  await getById(userId, id);
  await prisma.budgets.delete({ where: { id } });
  return { message: 'Presupuesto eliminado correctamente' };
}

module.exports = { getAll, getById, create, update, remove };